import React, { Component } from 'react'
import { Map } from 'immutable'
import { Table, Input, Image } from 'semantic-ui-react'
import { UnitType, unit_to_icon, UnitDefinition, ArmyName } from '../store/units'

interface IProps {
  reserve_a: Map<UnitType, number>
  reserve_b: Map<UnitType, number>
  onValueChange: (army: ArmyName, unit: UnitType, value: number) => void
}

// Display component for showing and changing tactic details.
export default class FastPlanner extends Component<IProps> {

  readonly units = Object.keys(UnitType).map(k => UnitType[k as any]).sort() as UnitType[]
  readonly headers = ['Units in reserve', 'Attacker', 'Defender']

  render() {
    return (
      <Table celled unstackable>
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
            this.units.map(value => this.renderRow(value))
          }
        </Table.Body>
      </Table>
    )
  }

  // <div className='ui avatar image' />

  renderRow = (unit: UnitType) => (
    <Table.Row key={unit}>
      <Table.Cell collapsing>
        <Image src={unit_to_icon.get(unit)} avatar />
        {unit}
      </Table.Cell>
      <Table.Cell collapsing>
        <Input
          type='number'
          size='mini'
          defaultValue={this.props.reserve_a.get(unit)}
          onChange={(_, data) => this.props.onValueChange(ArmyName.Attacker, unit, Math.round(Number(data.value)))
          }
        />
      </Table.Cell>
      <Table.Cell collapsing>
        <Input
          type='number'
          size='mini'
          defaultValue={this.props.reserve_b.get(unit)}
          onChange={(_, data) => this.props.onValueChange(ArmyName.Attacker, unit, Math.round(Number(data.value)))
          }
        />
      </Table.Cell>
    </Table.Row>
  )
}
