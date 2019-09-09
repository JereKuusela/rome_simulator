import React, { Component } from 'react'
import { Table, Input } from 'semantic-ui-react'
import { UnitType, Units } from '../store/units'
import { renderImages } from './utils'
import { getImages } from '../base_definition'
import { Side } from '../store/battle'
import { toArr } from '../utils'
import { has } from 'lodash'

export type PlannerUnits = { [key in UnitType]: number }


interface IProps {
  readonly units: Units
  readonly types_a: Set<UnitType>
  readonly types_d: Set<UnitType>
  readonly reserve_a: PlannerUnits
  readonly reserve_d: PlannerUnits
  readonly onValueChange: (side: Side, unit: UnitType, value: number) => void
  readonly attached?: boolean
  readonly changes_a: PlannerUnits
  readonly changes_d: PlannerUnits
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
              value={has(this.props.changes_a, type) ? this.props.changes_a[type] : this.props.reserve_a[type]}
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
              value={has(this.props.changes_d, type) ? this.props.changes_d[type] : this.props.reserve_d[type]}
              onChange={(_, data) => this.props.onValueChange(Side.Defender, type, Math.max(0, Math.round(Number(data.value))))
              }
            />
            : null
        }
      </Table.Cell>
    </Table.Row>
  )
}
