import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Image, Table } from 'semantic-ui-react'

import IconManpower from 'images/manpower.png'
import IconStrength from 'images/naval_combat.png'
import IconMorale from 'images/morale.png'
import IconEmpty from 'images/empty.png'
import { DefinitionType, Side, UnitType, UnitCalc } from 'types'
import { CombatUnits, CombatUnit } from 'combat'
import { strengthToValue } from 'formatters'
import { getImage, round, sumArr } from 'utils'
import { AppState, getCurrentCombat, filterUnitTypesBySide } from 'state'
import { flatten } from 'lodash'

type Props = {}

class Stats extends Component<IProps> {
  render() {
    return (
      <>
        {this.renderArmy(Side.Attacker, this.props.units_a, this.props.types_a)}
        {this.renderArmy(Side.Defender, this.props.units_d, this.props.types_d)}
      </ >
    )
  }

  renderArmy = (side: Side, units: CombatUnits, types: UnitType[]) => {
    const rows = types.map(type => this.renderRow(units, type)).filter(row => row)
    const flatten = this.flatten(units)
    return (
      <Table celled selectable unstackable key={side}>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell width='4'>
              {side}
            </Table.HeaderCell>
            <Table.HeaderCell width='3'>
              <Image src={this.props.mode === DefinitionType.Naval ? IconStrength : IconManpower} avatar />
            </Table.HeaderCell>
            <Table.HeaderCell width='3'>
              <Image src={IconMorale} avatar />
            </Table.HeaderCell>
            <Table.HeaderCell width='3'>
              Strength depleted
            </Table.HeaderCell>
            <Table.HeaderCell width='3'>
              Morale depleted
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows}
          <Table.Row>
            <Table.Cell width='4'>
              <Image src={IconEmpty} avatar />
              Total
            </Table.Cell>
            <Table.Cell width='3'>
              {strengthToValue(this.props.mode, this.sum(flatten,  unit => unit[UnitCalc.Strength]))} / {strengthToValue(this.props.mode, this.sum(flatten, unit => unit.definition.max_strength))}
            </Table.Cell>
            <Table.Cell width='3'>
              {round(this.sum(flatten,  unit => unit[UnitCalc.Morale]), 100.0)} / {round(this.sum(flatten, unit => unit.definition.max_morale), 100.0)}
            </Table.Cell>
            <Table.Cell width='3'>
              {strengthToValue(this.props.mode, this.sum(flatten, unit => unit.state.total_strength_dealt))}
            </Table.Cell>
            <Table.Cell width='3'>
              {round(this.sum(flatten, unit => unit.state.total_morale_dealt), 100.0)}
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    )
  }

  renderRow = (units: CombatUnits, type: UnitType) => {
    const flatten = this.flatten(units, type)
    const count = flatten.length
    if (count === 0)
      return null
    const image = getImage(flatten[0].definition)
    return (
      <Table.Row key={type}>
        <Table.Cell width='4'>
          <Image src={image} avatar />
          {type + ' (x ' + count + ')'}</Table.Cell>
        <Table.Cell width='3'>
          {strengthToValue(this.props.mode, this.sum(flatten, unit => unit[UnitCalc.Strength]))} / {strengthToValue(this.props.mode, this.sum(flatten, unit => unit.definition.max_strength))}
        </Table.Cell>
        <Table.Cell width='3'>
          {round(this.sum(flatten, unit => unit[UnitCalc.Morale]), 100.0)} / {round(this.sum(flatten, unit => unit.definition.max_morale), 100.0)}
        </Table.Cell>
        <Table.Cell width='3'>
          {strengthToValue(this.props.mode, this.sum(flatten, unit => unit.state.total_strength_dealt))}
        </Table.Cell>
        <Table.Cell width='3'>
          {round(this.sum(flatten, unit => unit.state.total_morale_dealt), 100.0)}
        </Table.Cell>
      </Table.Row>
    )
  }

  sum = (merged: CombatUnit[], getAttribute: (unit: CombatUnit) => number): number => sumArr(merged, value => Math.max(0, getAttribute(value)))

  // Flattens units to a single list. Also filters temporary 'defeated' units because they are copies of another unit.
  flatten = (units: CombatUnits, type?: UnitType): CombatUnit[] => (
    units.reserve.filter(unit => this.filter(unit, type)).concat(units.defeated.filter(unit => this.filter(unit, type)).concat(flatten(units.frontline).filter(unit => this.filter(unit, type)) as CombatUnit[]))
  )

  filter = (unit: CombatUnit | null, type?: UnitType) => unit && !unit.state.is_defeated && (!type || unit.definition.type === type)
}

const mapStateToProps = (state: AppState) => ({
  units_a: getCurrentCombat(state, Side.Attacker),
  units_d: getCurrentCombat(state, Side.Defender),
  types_a: filterUnitTypesBySide(state, Side.Attacker),
  types_d: filterUnitTypesBySide(state, Side.Defender),
  mode: state.settings.mode
})

const actions = {}

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends React.PropsWithChildren<Props>, S, D { }

export default connect(mapStateToProps, actions)(Stats)
