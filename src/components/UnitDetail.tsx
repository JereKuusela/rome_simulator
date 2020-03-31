import React, { Component } from 'react'
import { Table } from 'semantic-ui-react'

import PaddedRow from './Utils/PaddedRow'
import DetailToggleRow from './Detail/DetailToggleRow'
import DetailTextRow from './Detail/DetailTextRow'
import DetailInputRow from './Detail/DetailInputRow'
import DetailDropdownRow from './Detail/DetailDropdownRow'
import Headers from './Utils/Headers'
import { Mode, ValuesType, Cohort, UnitType, TerrainType, UnitRole, UnitAttribute, UnitValueType, unitValueToString, Setting, CombatPhase, isAttributeEnabled, SiteSettings } from 'types'
import { values } from 'utils'
import { getValue, calculateValue, explain } from 'definition_values'
import { toMaintenance } from 'formatters'
import DelayedNumericInput from './Detail/DelayedNumericInput'

interface IProps {
  mode: Mode
  settings: SiteSettings
  custom_value_key: string
  unit: Cohort
  unit_types?: UnitType[]
  unit_types_with_base?: UnitType[]
  show_statistics: boolean
  terrain_types?: TerrainType[]
  unit_types_as_dropdown?: boolean
  disable_base_values?: boolean
  onCustomBaseValueChange: (key: string, attribute: UnitValueType, value: number) => void
  onCustomModifierValueChange: (key: string, attribute: UnitValueType, value: number) => void
  onCustomLossValueChange: (key: string, attribute: UnitValueType, value: number) => void
  onTypeChange?: (type: UnitType) => void
  onBaseTypeChange?: (type: UnitType) => void
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
  readonly modes = values(Mode)
  readonly deployments = values(UnitRole)
  readonly headers = ['Attribute', 'Value', 'Custom base', 'Custom modifier', 'Custom losses', 'Explained']

  readonly CELLS = 6

  render() {
    const { unit, onTypeChange, onBaseTypeChange, onImageChange, onChangeDeployment, onIsLoyalToggle } = this.props
    const { terrain_types, unit_types, unit_types_with_base, unit_types_as_dropdown, settings } = this.props
    const { id, type, mode, base, image, role: deployment, is_loyal, culture, tech } = unit
    return (
      <Table celled selectable unstackable>
        <Headers values={this.headers} />
        <Table.Body>
          {id && <DetailTextRow text='Identifier' cells={this.CELLS} value={id} />}
          {onTypeChange && unit_types && unit_types_as_dropdown && <DetailDropdownRow text='Type' cells={this.CELLS} value={type} values={unit_types} onChange={onTypeChange} />}
          {onTypeChange && unit_types && !unit_types_as_dropdown && <DetailInputRow text='Name' cells={this.CELLS} value={type} onChange={onTypeChange} />}
          {mode && <DetailTextRow text='Mode' cells={this.CELLS} value={mode} />}
          {settings[Setting.Culture] && culture && <DetailTextRow text='Culture' cells={this.CELLS} value={culture} />}
          {settings[Setting.Tech] && tech && <DetailTextRow text='Tech' cells={this.CELLS} value={tech} />}
          {base && unit_types_with_base && onBaseTypeChange && <DetailDropdownRow text='Base type' cells={this.CELLS} value={base} values={unit_types_with_base} onChange={onBaseTypeChange} />}
          {onImageChange && <DetailInputRow text='Image' cells={this.CELLS} value={image} onChange={onImageChange} />}
          {onChangeDeployment && deployment && <DetailDropdownRow text='Deployment' cells={this.CELLS} value={deployment} values={this.deployments} onChange={onChangeDeployment} />}
          {settings[Setting.AttributeLoyal] && <DetailToggleRow text='Is loyal?' cells={this.CELLS} value={!!is_loyal} onChange={onIsLoyalToggle} />}
          {this.attributes.map(this.renderRow)}
          {settings[Setting.AttributeUnitType] && unit_types && unit_types.map(this.renderRow)}
          {settings[Setting.AttributeTerrainType] && terrain_types && terrain_types.map(this.renderRow)}
          {[CombatPhase.Fire, CombatPhase.Shock].map(this.renderRow)}
        </Table.Body>
      </Table>
    )
  }

  renderRow = (attribute: UnitValueType) => {
    const { unit, custom_value_key, onCustomBaseValueChange, onCustomModifierValueChange, onCustomLossValueChange, disable_base_values, settings, mode, show_statistics } = this.props
    if (!isAttributeEnabled(attribute, settings, mode, show_statistics))
      return null
    const base_value = getValue(ValuesType.Base, unit, attribute, custom_value_key)
    const modifier_value = getValue(ValuesType.Modifier, unit, attribute, custom_value_key)
    const loss_value = getValue(ValuesType.LossModifier, unit, attribute, custom_value_key)
    let value = unitValueToString(unit, attribute)
    if (attribute === UnitAttribute.Maintenance)
      value += ' (' + toMaintenance(calculateValue(unit, UnitAttribute.Cost) * calculateValue(unit, UnitAttribute.Maintenance)) + ')'

    const enable_loss = attribute === UnitAttribute.Morale || attribute === UnitAttribute.Strength
    const enable_modifier = enable_loss || attribute === UnitAttribute.Maintenance || attribute === UnitAttribute.Cost || attribute === UnitAttribute.AttritionWeight
    const enable_base = !disable_base_values || !enable_modifier

    return (
      <PaddedRow key={attribute} cells={this.CELLS}>
        {attribute}
        {value}
        {enable_base && <DelayedNumericInput value={base_value} onChange={value => onCustomBaseValueChange(custom_value_key, attribute, value)} />}
        {enable_modifier && <DelayedNumericInput value={modifier_value} onChange={value => onCustomModifierValueChange(custom_value_key, attribute, value)} />}
        {enable_loss && <DelayedNumericInput value={loss_value} onChange={value => onCustomLossValueChange(custom_value_key, attribute, value)} />}
        {explain(unit, attribute)}
      </PaddedRow>
    )
  }
}
