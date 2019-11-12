import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Image, Table } from 'semantic-ui-react'

import { sumArr, round } from '../utils'
import { calculateValue, calculateValueWithoutLoss, getImage, DefinitionType, strengthToValue } from '../base_definition'
import { filterUnitTypesBySide, getCurrentUnits } from '../store/utils'
import { AppState } from '../store/index'
import { Unit, UnitType, UnitCalc } from '../store/units'
import { Side, Units } from '../store/battle'

import IconManpower from '../images/manpower.png'
import IconStrength from '../images/naval_combat.png'
import IconMorale from '../images/morale.png'
import IconEmpty from '../images/empty.png'

class Stats extends Component<IProps> {
  render() {
    return (
      <>
        {this.renderArmy(Side.Attacker, this.props.units_a, this.props.types_a)}
        {this.renderArmy(Side.Defender, this.props.units_d, this.props.types_d)}
      </ >
    )
  }

  renderArmy = (side: Side, units: Units, types: UnitType[]) => {
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
              {strengthToValue(this.props.mode, this.sum(flatten, UnitCalc.Strength))} / {strengthToValue(this.props.mode, this.sumMax(flatten, UnitCalc.Strength))}
            </Table.Cell>
            <Table.Cell width='3'>
              {round(this.sum(flatten, UnitCalc.Morale), 100.0)} / {round(this.sumMax(flatten, UnitCalc.Morale), 100.0)}
            </Table.Cell>
            <Table.Cell width='3'>
              {strengthToValue(this.props.mode, this.sum(flatten, UnitCalc.StrengthDepleted))}
            </Table.Cell>
            <Table.Cell width='3'>
              {round(this.sum(flatten, UnitCalc.MoraleDepleted), 100.0)}
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    )
  }

  renderRow = (units: Units, type: UnitType): JSX.Element | null => {
    const flatten = this.flatten(units, type)
    const count = flatten.length
    if (count === 0)
      return null
    const image = getImage(flatten[0])
    return (
      <Table.Row key={type}>
        <Table.Cell width='4'>
          <Image src={image} avatar />
          {type + ' (x ' + count + ')'}</Table.Cell>
        <Table.Cell width='3'>
          {strengthToValue(this.props.mode, this.sum(flatten, UnitCalc.Strength))} / {strengthToValue(this.props.mode, this.sumMax(flatten, UnitCalc.Strength))}
        </Table.Cell>
        <Table.Cell width='3'>
          {round(this.sum(flatten, UnitCalc.Morale), 100.0)} / {round(this.sumMax(flatten, UnitCalc.Morale), 100.0)}
        </Table.Cell>
        <Table.Cell width='3'>
          {strengthToValue(this.props.mode, this.sum(flatten, UnitCalc.StrengthDepleted))}
        </Table.Cell>
        <Table.Cell width='3'>
          {round(this.sum(flatten, UnitCalc.MoraleDepleted), 100.0)}
        </Table.Cell>
      </Table.Row>
    )
  }

  sum = (merged: Unit[], attribute: UnitCalc): number => sumArr(merged, value => Math.max(0, calculateValue(value, attribute)))

  sumMax = (merged: Unit[], attribute: UnitCalc): number => sumArr(merged, value => Math.max(0, calculateValueWithoutLoss(value, attribute)))

  // Flattens units to a single list. Also filters temporary "defeated" units because they are copies of another unit.
  flatten = (units: Units, type?: UnitType): Unit[] => (
    units.reserve.filter(unit => this.filter(unit, type)).concat(units.defeated.filter(unit => this.filter(unit, type)).concat(units.frontline.filter(unit => this.filter(unit, type)) as Unit[]))
  )

  filter = (unit: Unit | null, type?: UnitType) => unit && !unit.is_defeated && (!type || unit.type === type)
}

const mapStateToProps = (state: AppState) => ({
  units_a: getCurrentUnits(state, Side.Attacker),
  units_d: getCurrentUnits(state, Side.Defender),
  types_a: filterUnitTypesBySide(state, Side.Attacker),
  types_d: filterUnitTypesBySide(state, Side.Defender),
  mode: state.settings.mode
})

const mapDispatchToProps = (dispatch: any) => ({
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> { }

export default connect(mapStateToProps, mapDispatchToProps)(Stats)