import React, { Component } from 'react'
import { Map, OrderedSet } from 'immutable'
import { Table, Input } from 'semantic-ui-react'
import { UnitType, ArmyName, UnitDefinition } from '../store/units'
import { renderImages } from './utils'
import { getImage } from '../base_definition'

interface IProps {
  readonly types_a: OrderedSet<UnitType>
  readonly units: Map<any, Map<UnitType, UnitDefinition>>
  readonly types_d: OrderedSet<UnitType>
  readonly reserve_a: Map<UnitType, number>
  readonly reserve_d: Map<UnitType, number>
  readonly onValueChange: (army: ArmyName, unit: UnitType, value: number) => void
  readonly attached?: boolean
}

// Display component for showing and changing tactic details.
export default class FastPlanner extends Component<IProps> {

  readonly headers = ['Units in reserve', 'Attacker', 'Defender']

  render() {
    const types = this.props.types_a.merge(this.props.types_d)
    return (
      <Table celled unstackable attached={this.props.attached}>
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
            types.map(value => this.renderRow(value))
          }
        </Table.Body>
      </Table>
    )
  }

  renderImages = (type: UnitType) => {
    const images = this.props.units.filter(value => value.get(type)).map(value => getImage(value.get(type))).toOrderedSet()
    return renderImages(images)
  }

  renderRow = (type: UnitType) => (
    <Table.Row key={type}>
      <Table.Cell width='6'>
        {this.renderImages(type)}
        {type}
      </Table.Cell>
      <Table.Cell width='5'>
        {
          this.props.types_a.contains(type) ?
            <Input
              type='number'
              size='mini'
              defaultValue={this.props.reserve_a.get(type)}
              onChange={(_, data) => this.props.onValueChange(ArmyName.Attacker, type, Math.max(0, Math.round(Number(data.value))))
              }
            />
            : null
        }
      </Table.Cell>
      <Table.Cell width='5'>
        {
          this.props.types_d.contains(type) ?
            <Input
              type='number'
              size='mini'
              defaultValue={this.props.reserve_d.get(type)}
              onChange={(_, data) => this.props.onValueChange(ArmyName.Defender, type, Math.max(0, Math.round(Number(data.value))))
              }
            />
            : null
        }
      </Table.Cell>
    </Table.Row>
  )
}
