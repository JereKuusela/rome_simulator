import React, { Component } from 'react'
import { Table, Input, Dropdown } from 'semantic-ui-react'
import { UnitType, Unit, UnitCalc, ValueType, valueToString } from '../store/units'
import { TerrainType } from '../store/terrains'
import { getBaseValue, getLossValue, getModifierValue, explain, DefinitionType, calculateValue } from '../base_definition'
import { toMaintenance } from '../formatters'

interface IProps<T extends string> {
  readonly mode: DefinitionType
  readonly name: T
  readonly custom_value_key: string
  readonly unit: Unit
  readonly unit_types: Set<UnitType>
  readonly show_statistics: boolean
  readonly terrain_types: Set<TerrainType>
  readonly unit_types_as_dropdown?: boolean
  readonly onCustomBaseValueChange: (key: string, attribute: ValueType, value: number) => void
  readonly onCustomModifierValueChange: (key: string, attribute: ValueType, value: number) => void
  readonly onCustomLossValueChange: (key: string, attribute: ValueType, value: number) => void
  readonly onTypeChange?: (type: UnitType) => void
  readonly onModeChange?: (mode: DefinitionType) => void
  readonly onImageChange?: (image: string) => void
}

// Display component for showing and changing unit details.
export default class UnitDetail<T extends string> extends Component<IProps<T>> {

  readonly attributes = Object.keys(UnitCalc).map(k => UnitCalc[k as any]) as UnitCalc[]
  readonly units = Object.keys(UnitType).map(k => UnitType[k as any]).sort() as UnitType[]
  readonly modes = Object.keys(DefinitionType).map(k => DefinitionType[k as any]).sort() as DefinitionType[]
  readonly headers = ['Attribute', 'Value', 'Custom base', 'Custom modifier', 'Custom losses', 'Explained']

  renderUnitTypeDropdown = (name: T, type: UnitType): JSX.Element => {
    return (
      <Dropdown
        text={type}
        selection
        value={type}
        disabled={this.props.unit.is_defeated || !this.props.unit_types}
      >
        <Dropdown.Menu>
          {
            Array.from(this.props.unit_types).map(key => (
              <Dropdown.Item value={key} text={key} key={key} active={type === key}
                onClick={() => this.props.onTypeChange && this.props.onTypeChange(key)}
              />
            ))
          }
        </Dropdown.Menu>
      </Dropdown>
    )
  }

  renderModeDropdown = (mode: DefinitionType): JSX.Element => {
    return (
      <Dropdown
        text={mode}
        selection
        value={mode}
        disabled={this.props.unit.is_defeated}
      >
        <Dropdown.Menu>
          {
            this.modes.map(key => (
              <Dropdown.Item value={key} text={key} key={key} active={mode === key}
                onClick={() => this.props.onModeChange && this.props.onModeChange(key)}
              />
            ))
          }
        </Dropdown.Menu>
      </Dropdown>
    )
  }

  render(): JSX.Element {

    return (
      <Table celled selectable unstackable>
        <Table.Header>
          <Table.Row>
            {
              Array.from(this.headers).map((value) => (
                <Table.HeaderCell key={value}>
                  {value}
                </Table.HeaderCell>
              ))
            }
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {
            this.props.onTypeChange ?
              <Table.Row>
                <Table.Cell>
                  Type
                </Table.Cell>
                <Table.Cell collapsing>
                  {this.props.unit_types_as_dropdown ?
                    this.renderUnitTypeDropdown(this.props.name, this.props.unit.type) :
                    <Input
                      size='mini'
                      disabled={this.props.unit.is_defeated}
                      defaultValue={this.props.unit.type}
                      onChange={(_, data) => this.props.onTypeChange && this.props.onTypeChange(data.value as UnitType)}
                    />
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
            this.props.onModeChange ?
              <Table.Row>
                <Table.Cell>
                  Mode
                </Table.Cell>
                <Table.Cell collapsing>
                  {this.renderModeDropdown(this.props.unit.mode)}
                </Table.Cell>
                <Table.Cell />
                <Table.Cell />
                <Table.Cell />
                <Table.Cell />
              </Table.Row>
              : null
          }
          {
            this.props.onImageChange ?
              <Table.Row>
                <Table.Cell>
                  Image
                </Table.Cell>
                <Table.Cell collapsing>
                  <Input
                    size='mini'
                    disabled={this.props.unit.is_defeated}
                    defaultValue={this.props.unit.image}
                    onChange={(_, data) => this.props.onImageChange && this.props.onImageChange(data.value)}
                  />
                </Table.Cell>
                <Table.Cell />
                <Table.Cell />
                <Table.Cell />
                <Table.Cell />
              </Table.Row>
              : null
          }
          {
            this.attributes.map(value => this.renderRow(this.props.unit, value))
          }
          {
            Array.from(this.props.unit_types).map(value => this.renderRow(this.props.unit, value))
          }
          {
            Array.from(this.props.terrain_types).map(value => this.renderRow(this.props.unit, value))
          }
        </Table.Body>
      </Table>
    )
  }

  renderRow = (unit: Unit, attribute: ValueType): JSX.Element | null => {
    if (attribute === UnitCalc.MovementSpeed || attribute === UnitCalc.RecruitTime)
      return null
    if (!this.props.show_statistics && (attribute === UnitCalc.StrengthDepleted || attribute === UnitCalc.MoraleDepleted))
      return null
    const base_value = getBaseValue(unit, attribute, this.props.custom_value_key)
    const modifier_value = getModifierValue(unit, attribute, this.props.custom_value_key)
    const loss_value = getLossValue(unit, attribute, this.props.custom_value_key)
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
          <Input
            size='mini'
            style={{ width: 50 }}
            defaultValue={base_value}
            disabled={unit.is_defeated}
            onChange={(_, {value}) => this.props.onCustomBaseValueChange(this.props.custom_value_key, attribute, Number(value))
            }
          />
        </Table.Cell>
        <Table.Cell collapsing>
          {
            (attribute === UnitCalc.Morale || attribute === UnitCalc.Strength || attribute === UnitCalc.Maintenance || attribute === UnitCalc.Cost || attribute === UnitCalc.AttritionWeight) &&
            <Input
              size='mini'
              style={{ width: 50 }}
              defaultValue={modifier_value}
              disabled={unit.is_defeated}
              onChange={(_, {value}) => this.props.onCustomModifierValueChange(this.props.custom_value_key, attribute, Number(value))}
            />
          }
        </Table.Cell>
        <Table.Cell collapsing>
          {
            (attribute === UnitCalc.Morale || attribute === UnitCalc.Strength) &&
            <Input
              size='mini'
              style={{ width: 50 }}
              defaultValue={loss_value}
              disabled={unit.is_defeated}
              onChange={(_, {value}) => this.props.onCustomLossValueChange(this.props.custom_value_key, attribute, Number(value))}
            />
          }
        </Table.Cell>
        <Table.Cell>
          {explain(unit, attribute)}
        </Table.Cell>
      </Table.Row>
    )
  }
}
