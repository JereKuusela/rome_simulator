import React, { Component } from 'react'
import { Table, Image, Container } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { AppState } from './../store/index'
import { UnitType, UnitDefinition, UnitCalc } from '../store/units/types'
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

  toPercent = (number: number) => Math.round(number * 100) + '%'

  render() {
    return (
      <Container>
        <Table celled>
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
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {
              Array.from(this.props.attacker).map((value) => {
                return this.renderRow(value[1])
              })
            }
          </Table.Body>
        </Table>
      </Container>
    )
  }

  renderRow = (unit: UnitDefinition) => {
    return (
      <Table.Row key={unit.type}>
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
          {this.toPercent(unit.calculate(UnitCalc.Discipline))}
        </Table.Cell>
        <Table.Cell>
          {this.toPercent(unit.calculate(UnitCalc.Offense))}
        </Table.Cell>
        <Table.Cell>
          {this.toPercent(unit.calculate(UnitCalc.Defense))}
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
          {this.toPercent(unit.calculate(UnitCalc.Morale))}
        </Table.Cell>
        <Table.Cell>
          {this.toPercent(unit.calculate(UnitCalc.StrengthDamageTaken))}
        </Table.Cell>
      </Table.Row>
    )
  }
}

const mapStateToProps = (state: AppState): IndexProps => ({
  attacker: state.units.attacker
})

const mapDispatchToProps = (dispatch: any) => ({

})



export default connect(mapStateToProps, mapDispatchToProps)(Index)