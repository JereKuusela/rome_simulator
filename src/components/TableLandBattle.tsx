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
}

// Display component for showing unit definitions for an army.
export class TableLandBattle extends Component<IProps> {

  render() {
    const range = Array.from(Array(2).keys())
    return (
      <Table celled>
        <Table.Body>
          {
            range.map((value) => this.renderRow(value, 10))
          }
        </Table.Body>
      </Table>
    )
  }


  renderRow = (row: number, width: number) => {
    const range = Array.from(Array(width).keys())
    return (
      <Table.Row key={row}>
        {
          range.map((value) => (
            <Table.Cell key={value} selectable>

            </Table.Cell>
          ))
        }
      </Table.Row>
    )
  }
}
