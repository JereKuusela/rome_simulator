import React, { Component } from 'react'
import { List } from 'immutable'
import { Container, Image, Table } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { AppState } from '../store/index'
import { ArmyName, Unit, UnitType, UnitCalc } from '../store/units/types'
import { Armies } from '../store/land_battle'
import IconManpower from '../images/manpower.png'
import IconMorale from '../images/morale.png'
import { unit_to_icon } from '../store/units'
import { calculateValue, calculateValueWithoutLoss, merge_values } from '../base_definition'

class Stats extends Component<IProps> {
  readonly units = Object.keys(UnitType).map(k => UnitType[k as any]).sort() as UnitType[]

  render() {
    return (
      <Container>
        {this.renderArmy(ArmyName.Attacker, this.props.attacker)}
        {this.renderArmy(ArmyName.Defender, this.props.defender)}
      </Container >
    )
  }


  renderArmy = (army: ArmyName, armies: Armies) => {
    armies = { army: this.mergeAllValues(army, armies.army), reserve: this.mergeAllValues(army, armies.reserve), defeated: this.mergeAllValues(army, armies.defeated)}
    return (
        <Table celled selectable unstackable key={army}>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>
                {army}
              </Table.HeaderCell>
              <Table.HeaderCell>
                <Image src={IconManpower} avatar />
              </Table.HeaderCell>
              <Table.HeaderCell>
                <Image src={IconMorale} avatar />
              </Table.HeaderCell>
              <Table.HeaderCell>
                Enemies killed
              </Table.HeaderCell>
              <Table.HeaderCell>
                Morale depleted
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {
              this.units.map(type => this.renderRow(armies, type))
            }
          </Table.Body>
        </Table>
    )
  }

  round = (number: number) => +(number).toFixed(2)

  renderRow = (armies: Armies, type: UnitType) => {
    const count = this.countUnits(armies, type)

    if (count === 0)
      return null
    return (
      <Table.Row key={type}>
        <Table.Cell width='4'>
          <Image src={unit_to_icon.get(type)} avatar />
          {type + ' (x ' + count + ')'}</Table.Cell>
        <Table.Cell width='3'>
          {this.calculateValue(armies, type, UnitCalc.Manpower)} / {this.calculateValueWithoutLoss(armies, type, UnitCalc.Manpower)}
        </Table.Cell>
        <Table.Cell width='3'>
          {this.round(this.calculateValue(armies, type, UnitCalc.Morale))} / {this.round(this.calculateValueWithoutLoss(armies, type, UnitCalc.Morale))}
        </Table.Cell>
        <Table.Cell width='3'>
          {this.calculateValue(armies, type, UnitCalc.ManpowerDepleted)}
        </Table.Cell>
        <Table.Cell width='3'>
          {this.round(this.calculateValue(armies, type, UnitCalc.MoraleDepleted))}
        </Table.Cell>
      </Table.Row>
    )
  }

  
  mergeAllValues = (name: ArmyName, army: List<Unit | undefined>) => {
    return army.map(value => value && merge_values(merge_values(this.props.units.getIn([name, value.type]), value), this.props.global_stats.get(name)!))
  }

  calculateValue = (participant: Armies, type: UnitType, attribute: UnitCalc) => {
    return this.calculateValueSub(participant.army, type, attribute) + this.calculateValueSub(participant.reserve, type, attribute) + this.calculateValueSub(participant.defeated, type, attribute)
  }

  calculateValueSub = (army: List<Unit | undefined>, type: UnitType, attribute: UnitCalc) => {
    return army.reduce((previous, current) => previous + (current && current.type === type ? Math.max(0, calculateValue(current, attribute)) : 0), 0)
  }

  calculateValueWithoutLoss = (participant: Armies, type: UnitType, attribute: UnitCalc) => {
    return this.calculateValueWithoutLossSub(participant.army, type, attribute) + this.calculateValueWithoutLossSub(participant.reserve, type, attribute) + this.calculateValueWithoutLossSub(participant.defeated, type, attribute)
  }

  calculateValueWithoutLossSub = (army: List<Unit | undefined>, type: UnitType, attribute: UnitCalc) => {
    return army.reduce((previous, current) => previous + (current && current.type === type ? calculateValueWithoutLoss(current, attribute) : 0), 0)
  }

  countUnits = (army: Armies, type: UnitType) => {
    return this.countUnitsSub(army.army, type) + this.countUnitsSub(army.reserve, type) + this.countUnitsSub(army.defeated, type)
  }

  countUnitsSub = (army: List<Unit | undefined>, type: UnitType) => army.reduce((previous, current) => previous + (current && current.type === type ? 1 : 0), 0)
}

const mapStateToProps = (state: AppState) => ({
  attacker: state.land.attacker,
  defender: state.land.defender,
  units: state.units,
  global_stats: state.global_stats
})

const mapDispatchToProps = (dispatch: any) => ({
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> { }

export default connect(mapStateToProps, mapDispatchToProps)(Stats)
