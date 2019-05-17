import React, { Component } from 'react'
import { Table, Image } from 'semantic-ui-react'
import { UnitDefinition } from '../store/units'
import IconEmpty from '../images/empty.png'


interface IProps {
  units: (UnitDefinition | null)[][]
  reverse: boolean
}

// Display component for showing unit definitions for an army.
export class TableLandBattle extends Component<IProps> {

  render() {
    return (
      <Table celled>
        <Table.Body>
          {
            (this.props.reverse ? this.props.units.reverse() : this.props.units).map((row, index) => this.renderRow(index, row))
          }
        </Table.Body>
      </Table>
    )
  }


  renderRow = (row: number, units: (UnitDefinition | null)[]) => {
    return (
      <Table.Row key={row}>
        {
          units.map((unit, index) => (
            <Table.Cell key={index} selectable>
              {
                <Image src={unit === null ? IconEmpty : unit.image} avatar />
              }
            </Table.Cell>
          ))
        }
      </Table.Row>
    )
  }
}
