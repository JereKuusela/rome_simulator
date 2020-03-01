import React, { Component } from 'react'
import { Table, Input } from 'semantic-ui-react'

import Headers from './Utils/Headers'

import { get } from 'lodash'
import { UnitType, Side, Unit } from 'types'
import { mapRange } from 'utils'
import LabelItem from './Utils/LabelUnit'

export type PlannerUnits = { [key in UnitType]: number }


interface IProps {
  units_a: Unit[]
  units_d: Unit[]
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

  readonly headers = ['', 'Attacker', 'Defender', '']

  render() {
    const { units_a, units_d, attached } = this.props
    const arr = mapRange(Math.max(units_a.length, units_d.length), value => value)
    return (
      <Table celled unstackable attached={attached}>
        <Headers values={this.headers} />
        <Table.Body>
          {arr.map(index => this.renderRow(index < units_a.length ? units_a[index] : undefined, index < units_d.length ? units_d[index] : undefined))}
        </Table.Body>
      </Table>
    )
  }

  renderRow = (unit_a: Unit | undefined, unit_d: Unit | undefined) => {
    const { changes_a, changes_d, reserve_a, reserve_d } = this.props
    const units_a = (unit_a && get(changes_a, unit_a.type, reserve_a[unit_a.type])) ?? 0
    const units_d = (unit_d && get(changes_d, unit_d.type, reserve_d[unit_d.type])) ?? 0
    return (
      <Table.Row key={unit_a?.type + '_' + unit_d?.type}>
        <Table.Cell width='5'>
          <LabelItem unit={unit_a} />
        </Table.Cell>
        <Table.Cell width='3'>
          {unit_a ? this.renderSide(unit_a.type, Side.Attacker, units_a) : null}
        </Table.Cell>
        <Table.Cell width='3'>
          {unit_d ? this.renderSide(unit_d.type, Side.Defender, units_d) : null}
        </Table.Cell>
        <Table.Cell width='5'>
          <LabelItem unit={unit_d} />
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
