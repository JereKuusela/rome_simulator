import React, { Component } from 'react'
import { List } from 'immutable'
import { Container, Image, Table } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { AppState } from '../store/index'
import { ArmyName, Unit, UnitType, UnitCalc } from '../store/units/types'
import { Participant, ParticipantType, Armies } from '../store/land_battle'
import IconManpower from '../images/manpower.png'
import IconMorale from '../images/morale.png'
import { calculateValue, calculateValueWithoutLoss, mergeValues, getImage } from '../base_definition'

class Stats extends Component<IProps> {
  render(): JSX.Element {
    return (
      <Container>
        {this.renderArmy(ParticipantType.Attacker, this.props.attacker, this.props.armies.get(this.props.attacker))}
        {this.renderArmy(ParticipantType.Defender, this.props.defender, this.props.armies.get(this.props.defender))}
      </Container >
    )
  }


  renderArmy = (type: ParticipantType, name: ArmyName, participant?: Participant): JSX.Element | null => {
    const info = participant && {
      army: this.mergeAllValues(name, participant.army),
      reserve: this.mergeAllValues(name, participant.reserve),
      defeated: this.mergeAllValues(name, participant.defeated)}
    const units = this.props.units.get(name)
    const types = this.props.types.get(name)
    if (!units || !types)
      return null
    return (
        <Table celled selectable unstackable key={type}>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>
                {type}
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
              info && types.map(type => this.renderRow(info, type, getImage(units.get(type))))
            }
          </Table.Body>
        </Table>
    )
  }

  round = (number: number): number => +(number).toFixed(2)

  renderRow = (armies: Armies, type: UnitType, image: string): JSX.Element | null => {
    const count = this.countUnits(armies, type)

    if (count === 0)
      return null
    return (
      <Table.Row key={type}>
        <Table.Cell width='4'>
          <Image src={image} avatar />
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

  
  mergeAllValues = (name: ArmyName, army: List<Unit | undefined>): List<any> => {
    return army.map(value => value && mergeValues(mergeValues(this.props.units.getIn([name, value.type]), value), this.props.global_stats.get(name)!))
  }

  calculateValue = (participant: Armies, type: UnitType, attribute: UnitCalc): number => {
    return this.calculateValueSub(participant.army, type, attribute) + this.calculateValueSub(participant.reserve, type, attribute) + this.calculateValueSub(participant.defeated, type, attribute)
  }

  calculateValueSub = (army: List<Unit | undefined>, type: UnitType, attribute: UnitCalc): number => {
    return army.reduce((previous, current) => previous + (current && current.type === type ? Math.max(0, calculateValue(current, attribute)) : 0), 0)
  }

  calculateValueWithoutLoss = (participant: Armies, type: UnitType, attribute: UnitCalc): number => {
    return this.calculateValueWithoutLossSub(participant.army, type, attribute) + this.calculateValueWithoutLossSub(participant.reserve, type, attribute) + this.calculateValueWithoutLossSub(participant.defeated, type, attribute)
  }

  calculateValueWithoutLossSub = (army: List<Unit | undefined>, type: UnitType, attribute: UnitCalc): number => {
    return army.reduce((previous, current) => previous + (current && current.type === type ? calculateValueWithoutLoss(current, attribute) : 0), 0)
  }

  countUnits = (army: Armies, type: UnitType): number => {
    return this.countUnitsSub(army.army, type) + this.countUnitsSub(army.reserve, type) + this.countUnitsSub(army.defeated, type)
  }

  countUnitsSub = (army: List<Unit | undefined>, type: UnitType): number => army.reduce((previous, current) => previous + (current && current.type === type ? 1 : 0), 0)
}

const mapStateToProps = (state: AppState) => ({
  attacker: state.land.attacker,
  defender: state.land.defender,
  armies: state.land.armies,
  units: state.units.definitions,
  types: state.units.types,
  global_stats: state.global_stats
})

const mapDispatchToProps = (dispatch: any) => ({
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> { }

export default connect(mapStateToProps, mapDispatchToProps)(Stats)
