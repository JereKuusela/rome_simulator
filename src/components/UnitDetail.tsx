import React, { Component } from 'react'
import { Table } from 'semantic-ui-react'

import DetailValueInput from './Detail/DetailValueInput'
import PaddedRow from './PaddedRow'
import DetailToggleRow from './Detail/DetailToggleRow'
import DetailTextRow from './Detail/DetailTextRow'
import DetailInputRow from './Detail/DetailInputRow'
import DetailDropdownRow from './Detail/DetailDropndownRow'

import { UnitType, Unit, UnitCalc, ValueType, valueToString } from '../store/units'
import { TerrainType } from '../store/terrains'

import { getBaseValue, getLossValue, getModifierValue, explain, DefinitionType, calculateValue } from '../base_definition'
import { toMaintenance } from '../formatters'
import { values } from '../utils'
import { renderHeaders } from './utils'

interface IProps {
  readonly mode: DefinitionType
  readonly custom_value_key: string
  readonly unit: Unit
  readonly unit_types?: UnitType[]
  readonly show_statistics: boolean
  readonly terrain_types?: TerrainType[]
  readonly unit_types_as_dropdown?: boolean
  readonly onCustomBaseValueChange: (key: string, attribute: ValueType, value: number) => void
  readonly onCustomModifierValueChange: (key: string, attribute: ValueType, value: number) => void
  readonly onCustomLossValueChange: (key: string, attribute: ValueType, value: number) => void
  readonly onTypeChange?: (type: UnitType) => void
  readonly onModeChange?: (mode: DefinitionType) => void
  readonly onImageChange?: (image: string) => void
  readonly onCanAssaultToggle?: () => void
  readonly onIsFlankToggle?: () => void
}

/**
 * Shows and allows changing unit details.
 */
export default class UnitDetail extends Component<IProps> {

  readonly attributes = values(UnitCalc)
  readonly units = values(UnitType).sort()
  readonly modes = values(DefinitionType)
  readonly headers = ['Attribute', 'Value', 'Custom base', 'Custom modifier', 'Custom losses', 'Explained']

  readonly CELLS = 6

  render() {
    const { unit, onTypeChange, onModeChange, onImageChange, onIsFlankToggle, onCanAssaultToggle } = this.props
    const { terrain_types, unit_types, unit_types_as_dropdown } = this.props
    const { id, type, mode, image, is_defeated, is_flank, can_assault } = unit
    return (
      <Table celled selectable unstackable>
        {renderHeaders(this.headers)}
        <Table.Body>
          {id && <DetailTextRow text='Identifier' cells={this.CELLS} value={id} />}
          {onTypeChange && unit_types && unit_types_as_dropdown && <DetailDropdownRow text='Type' cells={this.CELLS} value={type} values={unit_types} onChange={is_defeated ? undefined : onTypeChange} />}
          {onTypeChange && unit_types && !unit_types_as_dropdown && <DetailInputRow text='Name' cells={this.CELLS} value={type} onChange={is_defeated ? undefined : onTypeChange} />}
          {onModeChange && <DetailDropdownRow text='Mode' cells={this.CELLS} value={mode} values={this.modes} onChange={onModeChange} />}
          {onImageChange && <DetailInputRow text='Image' cells={this.CELLS} value={image} onChange={is_defeated ? undefined : onImageChange} />}
          {unit_types && <DetailToggleRow text='Is flank?' cells={this.CELLS} value={is_flank} onChange={onIsFlankToggle} />}
          {unit_types && <DetailToggleRow text='Can assault?' cells={this.CELLS} value={can_assault} onChange={onCanAssaultToggle} />}
          {this.attributes.map(this.renderRow)}
          {unit_types && unit_types.map(this.renderRow)}
          {terrain_types && terrain_types.map(this.renderRow)}
        </Table.Body>
      </Table>
    )
  }

  renderRow = (attribute: ValueType) => {
    const { unit, show_statistics, custom_value_key, onCustomBaseValueChange, onCustomModifierValueChange, onCustomLossValueChange } = this.props
    const { is_defeated } = unit
    if (attribute === UnitCalc.MovementSpeed || attribute === UnitCalc.RecruitTime)
      return null
    if (!show_statistics && (attribute === UnitCalc.StrengthDepleted || attribute === UnitCalc.MoraleDepleted))
      return null
    const base_value = getBaseValue(unit, attribute, custom_value_key)
    const modifier_value = getModifierValue(unit, attribute, custom_value_key)
    const loss_value = getLossValue(unit, attribute, custom_value_key)
    let value = valueToString(unit, attribute)
    if (attribute === UnitCalc.Maintenance)
      value += ' (' + toMaintenance(calculateValue(unit, UnitCalc.Cost) * calculateValue(unit, UnitCalc.Maintenance)) + ')'

    return (
      <PaddedRow key={attribute} cells={this.CELLS}>
        {attribute}
        {value}
        <DetailValueInput value={base_value} disabled={is_defeated} onChange={value => onCustomBaseValueChange(custom_value_key, attribute, value)} />
        {
          (attribute === UnitCalc.Morale || attribute === UnitCalc.Strength || attribute === UnitCalc.Maintenance || attribute === UnitCalc.Cost || attribute === UnitCalc.AttritionWeight) &&
          <DetailValueInput value={modifier_value} disabled={is_defeated} onChange={value => onCustomModifierValueChange(custom_value_key, attribute, value)} />
        }
        {
          (attribute === UnitCalc.Morale || attribute === UnitCalc.Strength) &&
          <DetailValueInput value={loss_value} disabled={is_defeated} onChange={value => onCustomLossValueChange(custom_value_key, attribute, value)} />
        }
        {explain(unit, attribute)}
      </PaddedRow>
    )
  }
}
