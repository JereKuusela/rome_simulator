import React, { Component } from 'react'
import { List } from 'immutable'
import { Container, Image, Table } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { AppState } from '../store/index'
import { ArmyName, UnitDefinition, UnitType, UnitCalc } from '../store/units/types'
import { ParticipantState } from '../store/land_battle'
import IconManpower from '../images/manpower.png'
import IconMorale from '../images/morale.png'
import { unit_to_icon } from '../store/units'
import { calculateValue, calculateValueWithoutLoss } from '../base_definition'

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


  renderArmy = (army: ArmyName, participant: ParticipantState) => {
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
              this.units.map(type => this.renderRow(participant, type))
            }
          </Table.Body>
        </Table>
    )
  }

  round = (number: number) => +(number).toFixed(2)

  renderRow = (participant: ParticipantState, type: UnitType) => {
    const count = this.countUnits(participant, type)
    if (count === 0)
      return null
    return (
      <Table.Row key={type}>
        <Table.Cell width='4'>
          <Image src={unit_to_icon.get(type)} avatar />
          {type + ' (x ' + count + ')'}</Table.Cell>
        <Table.Cell width='3'>
          {this.calculateValue(participant, type, UnitCalc.Manpower)} / {this.calculateValueWithoutLoss(participant, type, UnitCalc.Manpower)}
        </Table.Cell>
        <Table.Cell width='3'>
          {this.round(this.calculateValue(participant, type, UnitCalc.Morale))} / {this.round(this.calculateValueWithoutLoss(participant, type, UnitCalc.Morale))}
        </Table.Cell>
        <Table.Cell width='3'>
          {this.calculateValue(participant, type, UnitCalc.ManpowerDepleted)}
        </Table.Cell>
        <Table.Cell width='3'>
          {this.round(this.calculateValue(participant, type, UnitCalc.MoraleDepleted))}
        </Table.Cell>
      </Table.Row>
    )
  }

  calculateValue = (participant: ParticipantState, type: UnitType, attribute: UnitCalc) => {
    return this.calculateValueSub(participant.army, type, attribute) + this.calculateValueSub(participant.reserve, type, attribute) + this.calculateValueSub(participant.defeated, type, attribute)
  }

  calculateValueSub = (army: List<UnitDefinition | undefined>, type: UnitType, attribute: UnitCalc) => {
    return army.reduce((previous, current) => previous + (current && current.type === type ? Math.max(0, calculateValue(current, attribute)) : 0), 0)
  }

  calculateValueWithoutLoss = (participant: ParticipantState, type: UnitType, attribute: UnitCalc) => {
    return this.calculateValueWithoutLossSub(participant.army, type, attribute) + this.calculateValueWithoutLossSub(participant.reserve, type, attribute) + this.calculateValueWithoutLossSub(participant.defeated, type, attribute)
  }

  calculateValueWithoutLossSub = (army: List<UnitDefinition | undefined>, type: UnitType, attribute: UnitCalc) => {
    return army.reduce((previous, current) => previous + (current && current.type === type ? calculateValueWithoutLoss(current, attribute) : 0), 0)
  }

  countUnits = (army: ParticipantState, type: UnitType) => {
    return this.countUnitsSub(army.army, type) + this.countUnitsSub(army.reserve, type) + this.countUnitsSub(army.defeated, type)
  }

  countUnitsSub = (army: List<UnitDefinition | undefined>, type: UnitType) => army.reduce((previous, current) => previous + (current && current.type === type ? 1 : 0), 0)
}

const mapStateToProps = (state: AppState) => ({
  attacker: state.land.attacker,
  defender: state.land.defender
})

const mapDispatchToProps = (dispatch: any) => ({
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> { }

export default connect(mapStateToProps, mapDispatchToProps)(Stats)
