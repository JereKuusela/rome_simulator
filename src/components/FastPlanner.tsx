import React, { Component } from 'react'
import { Map } from 'immutable'
import { Table, Input } from 'semantic-ui-react'
import { UnitType, Units } from '../store/units'
import { renderImages } from './utils'
import { getImages } from '../base_definition'
import { Side } from '../store/battle';
import { toArr } from '../utils'

interface IProps {
  readonly units: Units
  readonly types_a: Set<UnitType>
  readonly types_d: Set<UnitType>
  readonly reserve_a: Map<UnitType, number>
  readonly reserve_d: Map<UnitType, number>
  readonly onValueChange: (side: Side, unit: UnitType, value: number) => void
  readonly attached?: boolean
  readonly changes_a: Map<UnitType, number>
  readonly changes_d: Map<UnitType, number>
}

// Display component for showing and changing tactic details.
export default class FastPlanner extends Component<IProps> {

  readonly headers = ['Units in reserve', 'Attacker', 'Defender']

  render(): JSX.Element {
    const types = new Set([...this.props.types_a, ...this.props.types_d])
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
            Array.from(types).map(this.renderRow)
          }
        </Table.Body>
      </Table>
    )
  }

  renderImages = (type: UnitType): JSX.Element[] => {
    const images = getImages(toArr(this.props.units), type)
    return renderImages(images)
  }

  renderRow = (type: UnitType): JSX.Element => (
    <Table.Row key={type}>
      <Table.Cell width='6'>
        {this.renderImages(type)}
        {type}
      </Table.Cell>
      <Table.Cell width='5'>
        {
          this.props.types_a.has(type) ?
            <Input
              type='number'
              size='mini'
              value={this.props.changes_a.has(type) ? this.props.changes_a.get(type) : this.props.reserve_a.get(type)}
              onChange={(_, data) => this.props.onValueChange(Side.Attacker, type, Math.max(0, Math.round(Number(data.value))))
              }
            />
            : null
        }
      </Table.Cell>
      <Table.Cell width='5'>
        {
          this.props.types_d.has(type) ?
            <Input
              type='number'
              size='mini'
              value={this.props.changes_d.has(type) ? this.props.changes_d.get(type) : this.props.reserve_d.get(type)}
              onChange={(_, data) => this.props.onValueChange(Side.Defender, type, Math.max(0, Math.round(Number(data.value))))
              }
            />
            : null
        }
      </Table.Cell>
    </Table.Row>
  )
}
