import { List } from 'immutable'
import React, { Component } from 'react'
import { Image, Table } from 'semantic-ui-react'
import { UnitDefinition, UnitCalc, ArmyType } from '../store/units'
import IconYes from '../images/yes.png'
import IconNo from '../images/no.png'
import IconDiscipline from '../images/discipline.png'
import IconOffense from '../images/offense.png'
import IconDefense from '../images/defense.png'
import IconManpower from '../images/manpower.png'
import IconMorale from '../images/morale.png'

interface IProps {
  readonly army: ArmyType
  readonly units: List<UnitDefinition>
  readonly onRowClick: (unit: UnitDefinition) => void
}

// Display component for showing unit definitions for an army.
export class TableUnitDefinitions extends Component<IProps> {

  render() {
    return (
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
              this.props.units.map((value) => (
                <Table.HeaderCell key={value.type}>
                  <Image src={value.image} avatar />
                </Table.HeaderCell>
              )
              )
            }
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {
            this.props.units.map((value) => this.renderRow(value))
          }
        </Table.Body>
      </Table>
    )
  }


  renderRow = (unit: UnitDefinition) => {
    return (
      <Table.Row key={unit.type} onClick={() => this.props.onRowClick(unit)}>
        <Table.Cell>
          <Image src={unit.image} avatar />
          {unit.type}</Table.Cell>
        <Table.Cell>
          {unit.valueToString(UnitCalc.Morale)}
        </Table.Cell>
        <Table.Cell>
          {unit.valueToString(UnitCalc.Manpower)}
        </Table.Cell>
        <Table.Cell>
          {unit.valueToString(UnitCalc.Discipline)}
        </Table.Cell>
        <Table.Cell>
          {unit.valueToString(UnitCalc.Offense)}
        </Table.Cell>
        <Table.Cell>
          {unit.valueToString(UnitCalc.Defense)}
        </Table.Cell>
        <Table.Cell>
          {unit.can_assault ? <Image src={IconYes} avatar /> : <Image src={IconNo} avatar />}
        </Table.Cell>
        <Table.Cell>
          {unit.valueToString(UnitCalc.MovementSpeed)}
        </Table.Cell>
        <Table.Cell>
          {unit.valueToString(UnitCalc.Maneuver)}
        </Table.Cell>
        <Table.Cell>
          {unit.valueToString(UnitCalc.MoraleDamageTaken)}
        </Table.Cell>
        <Table.Cell>
          {unit.valueToString(UnitCalc.StrengthDamageTaken)}
        </Table.Cell>
        {
          this.props.units.map((value) => (
            <Table.Cell key={value.type}>
              {unit.valueToString(value.type)}
            </Table.Cell>
          )
          )
        }
      </Table.Row>
    )
  }
}
