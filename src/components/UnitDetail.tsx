import React, { Component } from 'react'
import { Table } from 'semantic-ui-react'

import DetailValueInput from './Detail/DetailValueInput'
import PaddedRow from './Utils/PaddedRow'
import DetailToggleRow from './Detail/DetailToggleRow'
import DetailTextRow from './Detail/DetailTextRow'
import DetailInputRow from './Detail/DetailInputRow'
import DetailDropdownRow from './Detail/DetailDropdownRow'
import Headers from './Utils/Headers'
import { DefinitionType, ValuesType, Cohort, UnitType, TerrainType, UnitRole, UnitAttribute, UnitValueType, unitValueToString, Settings, Setting, CombatPhase } from 'types'
import { values } from 'utils'
import { getValue, calculateValue, explain } from 'definition_values'
import { toMaintenance } from 'formatters'

interface IProps {
  mode: DefinitionType
  settings: Settings
  custom_value_key: string
  unit: Cohort
  unit_types?: UnitType[]
  show_statistics: boolean
  terrain_types?: TerrainType[]
  unit_types_as_dropdown?: boolean
  disable_base_values?: boolean
  onCustomBaseValueChange: (key: string, attribute: UnitValueType, value: number) => void
  onCustomModifierValueChange: (key: string, attribute: UnitValueType, value: number) => void
  onCustomLossValueChange: (key: string, attribute: UnitValueType, value: number) => void
  onTypeChange?: (type: UnitType) => void
  onModeChange?: (mode: DefinitionType) => void
  onImageChange?: (image: string) => void
  onChangeDeployment?: (deployment: UnitRole) => void
  onIsLoyalToggle?: () => void
}

/**
 * Shows and allows changing unit details.
 */
export default class UnitDetail extends Component<IProps> {

  readonly attributes = values(UnitAttribute)
  readonly units = values(UnitType).sort()
  readonly modes = values(DefinitionType)
  readonly deployments = values(UnitRole)
  readonly headers = ['Attribute', 'Value', 'Custom base', 'Custom modifier', 'Custom losses', 'Explained']

  readonly CELLS = 6

  render() {
    const { unit, onTypeChange, onModeChange, onImageChange, onChangeDeployment, onIsLoyalToggle } = this.props
    const { terrain_types, unit_types, unit_types_as_dropdown } = this.props
    const { id, type, mode, image, role: deployment, is_loyal } = unit
    return (
      <Table celled selectable unstackable>
        <Headers values={this.headers} />
        <Table.Body>
          {id && <DetailTextRow text='Identifier' cells={this.CELLS} value={id} />}
          {onTypeChange && unit_types && unit_types_as_dropdown && <DetailDropdownRow text='Type' cells={this.CELLS} value={type} values={unit_types} onChange={onTypeChange} />}
          {onTypeChange && unit_types && !unit_types_as_dropdown && <DetailInputRow text='Name' cells={this.CELLS} value={type} onChange={onTypeChange} />}
          {onModeChange && <DetailDropdownRow text='Mode' cells={this.CELLS} value={mode} values={this.modes} onChange={onModeChange} />}
          {onImageChange && <DetailInputRow text='Image' cells={this.CELLS} value={image} onChange={onImageChange} />}
          {onChangeDeployment && <DetailDropdownRow text='Deployment' cells={this.CELLS} value={deployment} values={this.deployments} onChange={onChangeDeployment} />}
          {<DetailToggleRow text='Is loyal?' cells={this.CELLS} value={!!is_loyal} onChange={onIsLoyalToggle} />}
          {this.attributes.map(this.renderRow)}
          {unit_types && unit_types.map(this.renderRow)}
          {terrain_types && terrain_types.map(this.renderRow)}
          {[CombatPhase.Fire, CombatPhase.Shock].map(this.renderRow)}
        </Table.Body>
      </Table>
    )
  }

  hideAttribute = (attribute: UnitValueType) => {
    const { show_statistics, settings, mode } = this.props
    if (!show_statistics && (attribute === UnitAttribute.StrengthDepleted || attribute === UnitAttribute.MoraleDepleted))
      return true
    if (!settings[Setting.BackRow] && attribute === UnitAttribute.BackrowEffectiveness)
      return true
    if (mode === DefinitionType.Naval && (attribute === UnitAttribute.CaptureChance || attribute === UnitAttribute.CaptureResist))
      return true
    if (!settings[Setting.DailyMoraleLoss] && attribute === UnitAttribute.DailyLossResist)
      return true
    if (!settings[Setting.FireAndShock] && attribute in CombatPhase)
      return true
    return false
  }

  renderRow = (attribute: UnitValueType) => {
    const { unit, custom_value_key, onCustomBaseValueChange, onCustomModifierValueChange, onCustomLossValueChange, disable_base_values} = this.props
    if (this.hideAttribute(attribute))
      return null
    const base_value = getValue(ValuesType.Base, unit, attribute, custom_value_key)
    const modifier_value = getValue(ValuesType.Modifier, unit, attribute, custom_value_key)
    const loss_value = getValue(ValuesType.LossModifier, unit, attribute, custom_value_key)
    let value = unitValueToString(unit, attribute)
    if (attribute === UnitAttribute.Maintenance)
      value += ' (' + toMaintenance(calculateValue(unit, UnitAttribute.Cost) * calculateValue(unit, UnitAttribute.Maintenance)) + ')'

    const enable_loss = attribute === UnitAttribute.Morale || attribute === UnitAttribute.Strength
    const enable_modifier = enable_loss || attribute === UnitAttribute.Maintenance || attribute === UnitAttribute.Cost || attribute === UnitAttribute.AttritionWeight || attribute in CombatPhase
    const enable_base = !disable_base_values || !enable_modifier

    return (
      <PaddedRow key={attribute} cells={this.CELLS}>
        {attribute}
        {value}
        {enable_base && <DetailValueInput value={base_value} onChange={value => onCustomBaseValueChange(custom_value_key, attribute, value)} />}
        {enable_modifier && <DetailValueInput value={modifier_value} onChange={value => onCustomModifierValueChange(custom_value_key, attribute, value)} /> }
        {enable_loss && <DetailValueInput value={loss_value} onChange={value => onCustomLossValueChange(custom_value_key, attribute, value)} />}
        {explain(unit, attribute)}
      </PaddedRow>
    )
  }
}
