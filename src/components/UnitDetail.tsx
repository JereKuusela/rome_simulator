import React, { Component } from 'react'
import { Table } from 'semantic-ui-react'

import DetailValueInput from './Detail/DetailValueInput'
import PaddedRow from './Utils/PaddedRow'
import DetailToggleRow from './Detail/DetailToggleRow'
import DetailTextRow from './Detail/DetailTextRow'
import DetailInputRow from './Detail/DetailInputRow'
import DetailDropdownRow from './Detail/DetailDropdownRow'
import Headers from './Utils/Headers'
import { DefinitionType, ValuesType, Unit, UnitType, TerrainType, UnitDeployment, UnitCalc, UnitValueType, unitValueToString } from 'types'
import { values } from 'utils'
import { getValue, calculateValue, explain } from 'definition_values'
import { toMaintenance } from 'formatters'

interface IProps {
  mode: DefinitionType
  custom_value_key: string
  unit: Unit
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
  onChangeDeployment?: (deployment: UnitDeployment) => void
  onIsLoyalToggle?: () => void
}

/**
 * Shows and allows changing unit details.
 */
export default class UnitDetail extends Component<IProps> {

  readonly attributes = values(UnitCalc)
  readonly units = values(UnitType).sort()
  readonly modes = values(DefinitionType)
  readonly deployments = values(UnitDeployment)
  readonly headers = ['Attribute', 'Value', 'Custom base', 'Custom modifier', 'Custom losses', 'Explained']

  readonly CELLS = 6

  render() {
    const { unit, onTypeChange, onModeChange, onImageChange, onChangeDeployment, onIsLoyalToggle } = this.props
    const { terrain_types, unit_types, unit_types_as_dropdown } = this.props
    const { id, type, mode, image, deployment, is_loyal } = unit
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
        </Table.Body>
      </Table>
    )
  }

  renderRow = (attribute: UnitValueType) => {
    const { unit, show_statistics, custom_value_key, onCustomBaseValueChange, onCustomModifierValueChange, onCustomLossValueChange, disable_base_values } = this.props
    if (attribute === UnitCalc.MovementSpeed || attribute === UnitCalc.RecruitTime)
      return null
    if (!show_statistics && (attribute === UnitCalc.StrengthDepleted || attribute === UnitCalc.MoraleDepleted))
      return null
    const base_value = getValue(ValuesType.Base, unit, attribute, custom_value_key)
    const modifier_value = getValue(ValuesType.Modifier, unit, attribute, custom_value_key)
    const loss_value = getValue(ValuesType.LossModifier, unit, attribute, custom_value_key)
    let value = unitValueToString(unit, attribute)
    if (attribute === UnitCalc.Maintenance)
      value += ' (' + toMaintenance(calculateValue(unit, UnitCalc.Cost) * calculateValue(unit, UnitCalc.Maintenance)) + ')'

    const enable_loss = attribute === UnitCalc.Morale || attribute === UnitCalc.Strength
    const enable_modifier = enable_loss || attribute === UnitCalc.Maintenance || attribute === UnitCalc.Cost || attribute === UnitCalc.AttritionWeight
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
