import React, { Component } from 'react'
import { List } from 'immutable'
import { Container, Image, Table } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { AppState } from '../store/index'
import { Unit, UnitType, UnitCalc } from '../store/units'
import { ParticipantType, Army } from '../store/battle'
import IconManpower from '../images/manpower.png'
import IconStrength from '../images/naval_combat.png'
import IconMorale from '../images/morale.png'
import { getAttacker, getDefender, Participant } from '../store/utils'
import { mergeArmy } from '../utils'
import { calculateValue, calculateValueWithoutLoss, getImage, DefinitionType, strengthToValue } from '../base_definition'

class Stats extends Component<IProps> {
  render(): JSX.Element {
    return (
      <Container>
        {this.renderArmy(ParticipantType.Attacker, this.props.attacker)}
        {this.renderArmy(ParticipantType.Defender, this.props.defender)}
      </Container >
    )
  }

  renderArmy = (type: ParticipantType, participant: Participant) => {
    const info = {
      frontline: mergeArmy(participant, participant.frontline),
      reserve: mergeArmy(participant, participant.reserve),
      defeated: mergeArmy(participant, participant.defeated)
    }
    const types = this.props.types.get(participant.name)
    if (!types)
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
              info && types.map(type => this.renderRow(info, type, getImage(participant.units.get(type))))
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
          {strengthToValue(this.props.mode, this.calculateValue(armies, type, UnitCalc.Strength))} / {strengthToValue(this.props.mode, this.calculateValueWithoutLoss(armies, type, UnitCalc.Strength))}
        </Table.Cell>
        <Table.Cell width='3'>
          {this.round(this.calculateValue(armies, type, UnitCalc.Morale))} / {this.round(this.calculateValueWithoutLoss(armies, type, UnitCalc.Morale))}
        </Table.Cell>
        <Table.Cell width='3'>
          {strengthToValue(this.props.mode, this.calculateValue(armies, type, UnitCalc.StrengthDepleted))}
        </Table.Cell>
        <Table.Cell width='3'>
          {this.round(this.calculateValue(armies, type, UnitCalc.MoraleDepleted))}
        </Table.Cell>
      </Table.Row>
    )
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
  attacker: getAttacker(state),
  defender: getDefender(state),
  units: state.units.definitions,
  types: state.units.types,
  global_stats: state.global_stats,
  mode: state.settings.mode
})

const mapDispatchToProps = (dispatch: any) => ({
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> { }

export default connect(mapStateToProps, mapDispatchToProps)(Stats)
