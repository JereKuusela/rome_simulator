import React, { Component } from 'react'
import { Table, Dropdown } from 'semantic-ui-react'

import DetailInput from './DetailInput'
import DetailToggle from './DetailToggle'

import { UnitType, Unit, UnitCalc, ValueType, valueToString } from '../store/units'
import { TerrainType } from '../store/terrains'

import { getBaseValue, getLossValue, getModifierValue, explain, DefinitionType, calculateValue } from '../base_definition'
import { toMaintenance } from '../formatters'
import { values } from '../utils'
import { renderModeDropdown, renderHeaders } from './utils'
import DetailValueInput from './DetailValueInput'

interface IProps {
  readonly mode: DefinitionType
  readonly custom_value_key: string
  readonly unit: Unit
  readonly unit_types: UnitType[]
  readonly show_statistics: boolean
  readonly terrain_types: TerrainType[]
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

// Display component for showing and changing unit details.
export default class UnitDetail extends Component<IProps> {

  readonly attributes = values(UnitCalc)
  readonly units = values(UnitType).sort()
  readonly modes = values(DefinitionType)
  readonly headers = ['Attribute', 'Value', 'Custom base', 'Custom modifier', 'Custom losses', 'Explained']

  renderUnitTypeDropdown = (type: UnitType) => {
    return (
      <Dropdown
        text={type}
        selection
        value={type}
        disabled={this.props.unit.is_defeated || !this.props.unit_types}
      >
        <Dropdown.Menu>
          {
            this.props.unit_types.map(key => (
              <Dropdown.Item value={key} text={key} key={key} active={type === key}
                onClick={() => this.props.onTypeChange && this.props.onTypeChange(key)}
              />
            ))
          }
        </Dropdown.Menu>
      </Dropdown>
    )
  }

  render() {
    const { unit, onTypeChange, onModeChange, onImageChange, unit_types_as_dropdown, onIsFlankToggle, onCanAssaultToggle } = this.props
    const { id, type, mode, image, is_defeated, is_flank, can_assault } = unit
    return (
      <Table celled selectable unstackable>
        {renderHeaders(this.headers)}
        <Table.Body>
          {
            id ?
              <Table.Row>
                <Table.Cell>
                  Identifier
                </Table.Cell>
                <Table.Cell>
                  {id}
                </Table.Cell>
                <Table.Cell />
                <Table.Cell />
                <Table.Cell />
              </Table.Row>
              : null
          }
          {
            onTypeChange ?
              <Table.Row>
                <Table.Cell>
                  Type
                </Table.Cell>
                <Table.Cell collapsing>
                  {
                    unit_types_as_dropdown ?
                      this.renderUnitTypeDropdown(type) :
                      <DetailInput value={type} disabled={is_defeated} onChange={onTypeChange} />
                  }
                </Table.Cell>
                <Table.Cell />
                <Table.Cell />
                <Table.Cell />
                <Table.Cell />
              </Table.Row>
              : null
          }
          {
            onModeChange ?
              <Table.Row>
                <Table.Cell>
                  Mode
                </Table.Cell>
                <Table.Cell collapsing>
                  {renderModeDropdown(mode, mode => onModeChange!(mode), is_defeated)}
                </Table.Cell>
                <Table.Cell />
                <Table.Cell />
                <Table.Cell />
                <Table.Cell />
              </Table.Row>
              : null
          }
          {
            onImageChange ?
              <Table.Row>
                <Table.Cell>
                  Image
                </Table.Cell>
                <Table.Cell collapsing>
                  <DetailInput value={image} disabled={is_defeated} onChange={onImageChange} />
                </Table.Cell>
                <Table.Cell />
                <Table.Cell />
                <Table.Cell />
                <Table.Cell />
              </Table.Row>
              : null
          }
          {
            <Table.Row>
              <Table.Cell>
                Is flank?
            </Table.Cell>
              <Table.Cell collapsing>
                <DetailToggle value={is_flank} onClick={onIsFlankToggle} />
              </Table.Cell>
              <Table.Cell />
              <Table.Cell />
              <Table.Cell />
              <Table.Cell />
            </Table.Row>
          }
          {
            <Table.Row>
              <Table.Cell>
                Can assault?
            </Table.Cell>
              <Table.Cell collapsing>
                <DetailToggle value={can_assault} onClick={onCanAssaultToggle} />
              </Table.Cell>
              <Table.Cell />
              <Table.Cell />
              <Table.Cell />
              <Table.Cell />
            </Table.Row>
          }
          {
            this.attributes.map(this.renderRow)
          }
          {
            this.props.unit_types.map(this.renderRow)
          }
          {
            this.props.terrain_types.map(this.renderRow)
          }
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
      <Table.Row key={attribute}>
        <Table.Cell collapsing>
          {attribute}
        </Table.Cell>
        <Table.Cell collapsing>
          {value}
        </Table.Cell>
        <Table.Cell collapsing>
          <DetailValueInput value={base_value} disabled={is_defeated} onChange={value => onCustomBaseValueChange(custom_value_key, attribute, value)} />
        </Table.Cell>
        <Table.Cell collapsing>
          {
            (attribute === UnitCalc.Morale || attribute === UnitCalc.Strength || attribute === UnitCalc.Maintenance || attribute === UnitCalc.Cost || attribute === UnitCalc.AttritionWeight) &&
            <DetailValueInput value={modifier_value} disabled={is_defeated} onChange={value => onCustomModifierValueChange(custom_value_key, attribute, value)} />
          }
        </Table.Cell>
        <Table.Cell collapsing>
          {
            (attribute === UnitCalc.Morale || attribute === UnitCalc.Strength) &&
            <DetailValueInput value={loss_value} disabled={is_defeated} onChange={value => onCustomLossValueChange(custom_value_key, attribute, value)} />
          }
        </Table.Cell>
        <Table.Cell>
          {explain(unit, attribute)}
        </Table.Cell>
      </Table.Row>
    )
  }
}
