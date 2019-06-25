import React, { Component } from 'react'
import { List } from 'immutable'
import { Container, Image, Table } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { AppState } from '../store/index'
import { ArmyName, Unit, UnitType, UnitCalc } from '../store/units'
import { Participant, ParticipantType, Army } from '../store/battle'
import IconManpower from '../images/manpower.png'
import IconStrength from '../images/naval_combat.png'
import IconMorale from '../images/morale.png'
import { getBattle } from '../utils'
import { calculateValue, calculateValueWithoutLoss, mergeValues, getImage, DefinitionType } from '../base_definition'

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
      frontline: this.mergeAllValues(name, participant.frontline),
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
              <Table.HeaderCell width='4'>
                {type}
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
              info && types.map(type => this.renderRow(info, type, getImage(units.get(type))))
            }
          </Table.Body>
        </Table>
    )
  }

  round = (number: number): number => +(number).toFixed(2)

  renderRow = (armies: Army, type: UnitType, image: string): JSX.Element | null => {
    const count = this.countUnits(armies, type)

    if (count === 0)
      return null
    return (
      <Table.Row key={type}>
        <Table.Cell width='4'>
          <Image src={image} avatar />
          {type + ' (x ' + count + ')'}</Table.Cell>
        <Table.Cell width='3'>
          {this.finalize(this.calculateValue(armies, type, UnitCalc.Strength))} / {this.finalize(this.calculateValueWithoutLoss(armies, type, UnitCalc.Strength))}
        </Table.Cell>
        <Table.Cell width='3'>
          {this.round(this.calculateValue(armies, type, UnitCalc.Morale))} / {this.round(this.calculateValueWithoutLoss(armies, type, UnitCalc.Morale))}
        </Table.Cell>
        <Table.Cell width='3'>
          {this.finalize(this.calculateValue(armies, type, UnitCalc.StrengthDepleted))}
        </Table.Cell>
        <Table.Cell width='3'>
          {this.round(this.calculateValue(armies, type, UnitCalc.MoraleDepleted))}
        </Table.Cell>
      </Table.Row>
    )
  }

  finalize = (value: number): string => {
    if (this.props.mode === DefinitionType.Naval)
      return (value / 10.0) + '%'
    return String(value)
  }

  
  mergeAllValues = (name: ArmyName, army: List<Unit | undefined>): List<any> => {
    return army.map(value => value && mergeValues(mergeValues(this.props.units.getIn([name, value.type]), value), this.props.global_stats.getIn([name, this.props.mode])))
  }

  calculateValue = (participant: Army, type: UnitType, attribute: UnitCalc): number => {
    return this.calculateValueSub(participant.frontline, type, attribute) + this.calculateValueSub(participant.reserve, type, attribute) + this.calculateValueSub(participant.defeated, type, attribute)
  }

  calculateValueSub = (army: List<Unit | undefined>, type: UnitType, attribute: UnitCalc): number => {
    return army.reduce((previous, current) => previous + (current && !current.is_defeated && current.type === type ? Math.max(0, calculateValue(current, attribute)) : 0), 0)
  }

  calculateValueWithoutLoss = (participant: Army, type: UnitType, attribute: UnitCalc): number => {
    return this.calculateValueWithoutLossSub(participant.frontline, type, attribute) + this.calculateValueWithoutLossSub(participant.reserve, type, attribute) + this.calculateValueWithoutLossSub(participant.defeated, type, attribute)
  }

  calculateValueWithoutLossSub = (army: List<Unit | undefined>, type: UnitType, attribute: UnitCalc): number => {
    return army.reduce((previous, current) => previous + (current && !current.is_defeated && current.type === type ? calculateValueWithoutLoss(current, attribute) : 0), 0)
  }

  countUnits = (army: Army, type: UnitType): number => {
    return this.countUnitsSub(army.frontline, type) + this.countUnitsSub(army.reserve, type) + this.countUnitsSub(army.defeated, type)
  }

  countUnitsSub = (army: List<Unit | undefined>, type: UnitType): number => army.reduce((previous, current) => previous + (current && !current.is_defeated && current.type === type ? 1 : 0), 0)
}

const mapStateToProps = (state: AppState) => ({
  attacker: getBattle(state).attacker,
  defender: getBattle(state).defender,
  armies: getBattle(state).armies,
  units: state.units.definitions,
  types: state.units.types,
  global_stats: state.global_stats,
  mode: state.settings.mode
})

const mapDispatchToProps = (dispatch: any) => ({
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> { }

export default connect(mapStateToProps, mapDispatchToProps)(Stats)
