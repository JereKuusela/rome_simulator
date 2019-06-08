import React, { Component } from 'react'
import { OrderedSet, Map } from 'immutable'
import { Table, Input } from 'semantic-ui-react'
import { UnitType, UnitDefinition, UnitCalc, ArmyName, ValueType, valueToString } from '../store/units'
import { TerrainType } from '../store/terrains'
import { getBaseValue, getLossValue, getModifierValue, explain } from '../base_definition'

interface IProps {
  readonly army: ArmyName
  readonly custom_value_key: string
  readonly unit: UnitDefinition
  readonly unit_types: OrderedSet<UnitType>
  readonly units: Map<any, Map<UnitType, UnitDefinition>>
  readonly show_statistics: boolean
  readonly terrains: OrderedSet<TerrainType>
  readonly onCustomBaseValueChange: (army: ArmyName, type: UnitType, key: string, attribute: ValueType, value: number) => void
  readonly onCustomModifierValueChange: (army: ArmyName, type: UnitType, key: string, attribute: ValueType, value: number) => void
  readonly onCustomLossValueChange: (army: ArmyName, type: UnitType, key: string, attribute: ValueType, value: number) => void
  readonly onTypeChange?: (army: ArmyName, old_type: UnitType, new_type: UnitType) => void
  readonly onImageChange?: (army: ArmyName, type: UnitType, image: string) => void
}

// Display component for showing and changing unit details.
export default class UnitDetail extends Component<IProps> {

  readonly attributes = Object.keys(UnitCalc).map(k => UnitCalc[k as any]) as UnitCalc[]
  readonly units = Object.keys(UnitType).map(k => UnitType[k as any]).sort() as UnitType[]
  readonly headers = ['Attribute', 'Value', 'Custom base', 'Custom modifier', 'Custom losses', 'Explained']

  render() {

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
                  <Input
                    size='mini'
                    defaultValue={this.props.unit.type}
                    onChange={(_, data) => this.props.onTypeChange && this.props.onTypeChange(this.props.army, this.props.unit.type, data.value as UnitType)}
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
            this.props.onImageChange ?
              <Table.Row>
                <Table.Cell>
                  Image
                </Table.Cell>
                <Table.Cell collapsing>
                  <Input
                    size='mini'
                    defaultValue={this.props.unit.image}
                    onChange={(_, data) => this.props.onImageChange && this.props.onImageChange(this.props.army, this.props.unit.type, data.value)}
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
            this.props.unit_types.map(value => this.renderRow(this.props.unit, value))
          }
          {
            this.props.terrains.map(value => this.renderRow(this.props.unit, value))
          }
        </Table.Body>
      </Table>
    )
  }

  renderRow = (unit: UnitDefinition, attribute: ValueType) => {
    if (attribute === UnitCalc.MovementSpeed || attribute === UnitCalc.Upkeep || attribute === UnitCalc.RecruitTime)
      return null
    if (!this.props.show_statistics && (attribute === UnitCalc.ManpowerDepleted || attribute === UnitCalc.MoraleDepleted))
      return null
    let base_value = getBaseValue(unit, attribute, this.props.custom_value_key)
    let modifier_value = getModifierValue(unit, attribute, this.props.custom_value_key)
    let loss_value = getLossValue(unit, attribute, this.props.custom_value_key)

    return (
      <Table.Row key={attribute}>
        <Table.Cell collapsing>
          {attribute}
        </Table.Cell>
        <Table.Cell collapsing>
          {valueToString(unit, attribute)}
        </Table.Cell>
        <Table.Cell collapsing>
          <Input
            size='mini'
            style={{ width: 50 }}
            defaultValue={base_value}
            onChange={(_, data) => this.props.onCustomBaseValueChange(this.props.army, unit.type, this.props.custom_value_key, attribute, Number(data.value))
            }
          />
        </Table.Cell>
        <Table.Cell collapsing>
          {
            (attribute === UnitCalc.Morale || attribute === UnitCalc.Manpower) &&
            <Input
              size='mini'
              style={{ width: 50 }}
              defaultValue={modifier_value}
              onChange={(_, data) => this.props.onCustomModifierValueChange(this.props.army, unit.type, this.props.custom_value_key, attribute, Number(data.value))}
            />
          }
        </Table.Cell>
        <Table.Cell collapsing>
          {
            (attribute === UnitCalc.Morale || attribute === UnitCalc.Manpower) &&
            <Input
              size='mini'
              style={{ width: 50 }}
              defaultValue={loss_value}
              onChange={(_, data) => this.props.onCustomLossValueChange(this.props.army, unit.type, this.props.custom_value_key, attribute, Number(data.value))}
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
