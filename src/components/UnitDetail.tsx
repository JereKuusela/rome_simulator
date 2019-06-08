import React, { Component } from 'react'
import { List } from 'immutable'
import { Table, Input } from 'semantic-ui-react'
import { UnitType, UnitDefinition, UnitCalc, ArmyName, ValueType, valueToString } from '../store/units'
import { TerrainType } from '../store/terrains'
import { getBaseValue, getLossValue, getModifierValue, explain } from '../base_definition'

interface IProps {
  army: ArmyName
  custom_value_key: string
  unit: UnitDefinition
  show_statistics: boolean
  terrains: List<TerrainType>
  onCustomBaseValueChange: (army: ArmyName, type: UnitType, key: string, attribute: ValueType, value: number) => void
  onCustomModifierValueChange: (army: ArmyName, type: UnitType, key: string, attribute: ValueType, value: number) => void
  onCustomLossValueChange: (army: ArmyName, type: UnitType, key: string, attribute: ValueType, value: number) => void
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
            this.attributes.map((value) => this.renderRow(this.props.unit, value))
          }
          {
            this.units.map((value) => this.renderRow(this.props.unit, value))
          }
          {
            this.props.terrains.map((value) => this.renderRow(this.props.unit, value))
          }
        </Table.Body>
      </Table>
    )
  }

  renderRow = (unit: UnitDefinition, attribute: ValueType) => {
    if (attribute === UnitCalc.MovementSpeed || attribute === UnitCalc.Upkeep || attribute === UnitCalc.Cost || attribute === UnitCalc.RecruitTime || attribute === UnitCalc.AttritionWeight)
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
