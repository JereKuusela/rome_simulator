import React, { Component } from 'react'
import { OrderedSet, List } from 'immutable'
import { Container, Image, Table } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { AppState } from '../store/index'
import { Unit, UnitType, UnitCalc } from '../store/units'
import { Side, Units, refreshBattle } from '../store/battle'
import IconManpower from '../images/manpower.png'
import IconStrength from '../images/naval_combat.png'
import IconMorale from '../images/morale.png'
import { getUnits, filterUnitTypes, getBattle } from '../store/utils'
import { calculateValue, calculateValueWithoutLoss, getImage, DefinitionType, strengthToValue } from '../base_definition'

class Stats extends Component<IProps> {
  render(): JSX.Element {
    if (this.props.outdated)
      this.props.refreshBattle(this.props.mode)
    return (
      <Container>
        {this.renderArmy(Side.Attacker, this.props.units_a, this.props.types_a)}
        {this.renderArmy(Side.Defender, this.props.units_d, this.props.types_d)}
      </Container >
    )
  }

  renderArmy = (side: Side, units: Units, unit_types: OrderedSet<UnitType>) => {
    return (
        <Table celled selectable unstackable key={side}>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell width='4'>
                {side}
              </Table.HeaderCell>
              <Table.HeaderCell width='3'>
                <Image src={this.props.mode === DefinitionType.Naval ? IconStrength: IconManpower} avatar />
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
            {
              unit_types.map(type => this.renderRow(units, type))
            }
          </Table.Body>
        </Table>
    )
  }

  round = (number: number): number => +(number).toFixed(2)

  renderRow = (units: Units, type: UnitType): JSX.Element | null => {

    const merged = this.merge(units, type)
    const count = merged.count()
    if (count === 0)
      return null
    const image = getImage(merged.get(0))
    return (
      <Table.Row key={type}>
        <Table.Cell width='4'>
          <Image src={image} avatar />
          {type + ' (x ' + count + ')'}</Table.Cell>
        <Table.Cell width='3'>
          {strengthToValue(this.props.mode, this.calculateValue(merged, UnitCalc.Strength))} / {strengthToValue(this.props.mode, this.calculateValueWithoutLoss(merged, UnitCalc.Strength))}
        </Table.Cell>
        <Table.Cell width='3'>
          {this.round(this.calculateValue(merged, UnitCalc.Morale))} / {this.round(this.calculateValueWithoutLoss(merged, UnitCalc.Morale))}
        </Table.Cell>
        <Table.Cell width='3'>
          {strengthToValue(this.props.mode, this.calculateValue(merged, UnitCalc.StrengthDepleted))}
        </Table.Cell>
        <Table.Cell width='3'>
          {this.round(this.calculateValue(merged, UnitCalc.MoraleDepleted))}
        </Table.Cell>
      </Table.Row>
    )
  }

  calculateValue = (merged: List<Unit>, attribute: UnitCalc): number => (
    merged.reduce((previous, current) => previous + (!current.is_defeated ? Math.max(0, calculateValue(current, attribute)) : 0), 0)
  )

  calculateValueWithoutLoss = (merged: List<Unit>, attribute: UnitCalc): number => (
    merged.reduce((previous, current) => previous + (!current.is_defeated ? calculateValueWithoutLoss(current, attribute) : 0), 0)
  )

  merge = (units: Units, type: UnitType): List<Unit> => (
    units.reserve.filter(unit => unit.type === type).merge(units.defeated.filter(unit => unit.type === type).merge(units.frontline.filter(unit => unit && unit.type === type) as List<Unit>))
  )
}

const mapStateToProps = (state: AppState) => ({
  units_a: getUnits(state, Side.Attacker),
  units_d: getUnits(state, Side.Defender),
  types_a: filterUnitTypes(state, Side.Attacker),
  types_d: filterUnitTypes(state, Side.Defender),
  outdated: getBattle(state).outdated,
  mode: state.settings.mode
})

const mapDispatchToProps = (dispatch: any) => ({
  refreshBattle: (mode: DefinitionType) => dispatch(refreshBattle(mode))
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> { }

export default connect(mapStateToProps, mapDispatchToProps)(Stats)
