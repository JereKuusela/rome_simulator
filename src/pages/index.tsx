import { Map } from 'immutable'
import React, { Component } from 'react'
import { Table, Image, Container } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { AppState } from './../store/index'
import { UnitType, UnitDefinition, UnitCalc } from '../store/units/types'
import { setUnitModal } from '../store/layout'
import IconYes from '../images/yes.png'
import IconNo from '../images/no.png'
import IconDiscipline from '../images/discipline.png'
import IconOffense from '../images/offense.png'
import IconDefense from '../images/defense.png'
import IconManpower from '../images/manpower.png'
import IconMorale from '../images/morale.png'

interface IndexProps {
  attacker: Map<UnitType, UnitDefinition>
}

class Index extends Component<IndexProps> {

  render() {
    return (
      <Container>
        <Table celled selectable>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>
              </Table.HeaderCell>
              <Table.HeaderCell>
                <Image src={IconMorale} avatar />
              </Table.HeaderCell>
              <Table.HeaderCell>
                <Image src={IconManpower} avatar />
              </Table.HeaderCell>
              <Table.HeaderCell>
                <Image src={IconDiscipline} avatar />
              </Table.HeaderCell>
              <Table.HeaderCell>
                <Image src={IconOffense} avatar />
              </Table.HeaderCell>
              <Table.HeaderCell>
                <Image src={IconDefense} avatar />
              </Table.HeaderCell>
              <Table.HeaderCell>
                Assault?
              </Table.HeaderCell>
              <Table.HeaderCell>
                Speed
              </Table.HeaderCell>
              <Table.HeaderCell>
                Maneuver
              </Table.HeaderCell>
              <Table.HeaderCell>
                Morale damage
              </Table.HeaderCell>
              <Table.HeaderCell>
                Strength damage
              </Table.HeaderCell>
              {
                Array.from(this.props.attacker).map((value) => {
                  return (
                    <Table.HeaderCell key={value[0]}>
                      <Image src={value[1].image} avatar />
                    </Table.HeaderCell>
                  )
                })
              }
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {
              Array.from(this.props.attacker).map((value) => {
                return this.renderRow(value[1], this.props.attacker)
              })
            }
          </Table.Body>
        </Table>
      </Container>
    )
  }

  renderRow = (unit: UnitDefinition, units: Map<UnitType, UnitDefinition>) => {
    return (
      <Table.Row key={unit.type} onClick={() => (this.props as any).editUnit(unit)}>
        <Table.Cell>
          <Image src={unit.image} avatar />
          {unit.type}</Table.Cell>
        <Table.Cell>
          {unit.calculate(UnitCalc.Morale)}
        </Table.Cell>
        <Table.Cell>
          {unit.calculate(UnitCalc.Manpower)}
        </Table.Cell>
        <Table.Cell>
          {unit.calculate(UnitCalc.Discipline)}
        </Table.Cell>
        <Table.Cell>
          {unit.calculate(UnitCalc.Offense)}
        </Table.Cell>
        <Table.Cell>
          {unit.calculate(UnitCalc.Defense)}
        </Table.Cell>
        <Table.Cell>
          {unit.can_assault ? <Image src={IconYes} avatar /> : <Image src={IconNo} avatar />}
        </Table.Cell>
        <Table.Cell>
          {unit.calculate(UnitCalc.MovementSpeed)}
        </Table.Cell>
        <Table.Cell>
          {unit.calculate(UnitCalc.Maneuver)}
        </Table.Cell>
        <Table.Cell>
          {unit.calculate(UnitCalc.MoraleDamageTaken)}
        </Table.Cell>
        <Table.Cell>
          {unit.calculate(UnitCalc.StrengthDamageTaken)}
        </Table.Cell>
        {
          Array.from(this.props.attacker).map((value) => {
            return (
              <Table.Cell key={value[0]}>
                {unit.calculate(value[0])}
              </Table.Cell>
            )
          })
        }
      </Table.Row>
    )
  }
}

const mapStateToProps = (state: AppState): IndexProps => ({
  attacker: state.units.attacker
})

const mapDispatchToProps = (dispatch: any) => ({
  editUnit: (unit: UnitDefinition) => dispatch(setUnitModal(unit))
})



export default connect(mapStateToProps, mapDispatchToProps)(Index)