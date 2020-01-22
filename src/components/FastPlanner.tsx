import React, { Component } from 'react'
import { Table, Input } from 'semantic-ui-react'

import Headers from './Utils/Headers'
import Images from './Utils/Images'

import { get } from 'lodash'
import { UnitType, Side } from 'types'

export type PlannerUnits = { [key in UnitType]: number }


interface IProps {
  images: { [key in UnitType]: string[] }
  types_a: Set<UnitType>
  types_d: Set<UnitType>
  reserve_a: PlannerUnits
  reserve_d: PlannerUnits
  onValueChange: (side: Side, unit: UnitType, value: number) => void
  attached?: boolean
  changes_a: PlannerUnits
  changes_d: PlannerUnits
}

/**
 * Allows quickly adding or removing units from reserve.
 */
export default class FastPlanner extends Component<IProps> {

  readonly headers = ['Units in reserve', 'Attacker', 'Defender']

  render() {
    const { types_a, types_d, attached } = this.props
    const types = Array.from(new Set([...types_a, ...types_d]))
    return (
      <Table celled unstackable attached={attached}>
        <Headers values={this.headers} />
        <Table.Body>
          {types.map(this.renderRow)}
        </Table.Body>
      </Table>
    )
  }

  renderImages = (type: UnitType) => {
    return <Images values={this.props.images[type]} />
  }

  renderRow = (type: UnitType) => {
    const { types_a, types_d, changes_a, changes_d, reserve_a, reserve_d } = this.props
    const units_a = get(changes_a, type, reserve_a[type])
    const units_d = get(changes_d, type, reserve_d[type])
    return (
      <Table.Row key={type}>
        <Table.Cell width='6'>
          {this.renderImages(type)}
          {type}
        </Table.Cell>
        <Table.Cell width='5'>
          {types_a.has(type) ? this.renderSide(type, Side.Attacker, units_a) : null}
        </Table.Cell>
        <Table.Cell width='5'>
          {types_d.has(type) ? this.renderSide(type, Side.Defender, units_d) : null}
        </Table.Cell>
      </Table.Row>
    )
  }

  renderSide = (type: UnitType, side: Side, value: number) => (
    <Input
      type='number'
      size='mini'
      value={value}
      onChange={(_, data) => this.props.onValueChange(side, type, Math.max(0, Math.round(Number(data.value))))
      }
    />
  )
}
