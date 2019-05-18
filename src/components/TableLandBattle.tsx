import React, { Component } from 'react'
import { List } from 'immutable'
import { Table, Image } from 'semantic-ui-react'
import { UnitDefinition } from '../store/units'
import IconEmpty from '../images/empty.png'


interface IProps {
  units: List<List<(UnitDefinition | null)>>
  reverse: boolean
  onClick: (row: number, column: number) => void
}

// Display component for showing unit definitions for an army.
export class TableLandBattle extends Component<IProps> {

  render() {
    return (
      <Table celled>
        <Table.Body>
          {
            (this.props.reverse ? this.props.units.reverse() : this.props.units).map((row, index) => this.renderRow(this.props.units.size - 1 - index, row))
          }
        </Table.Body>
      </Table>
    )
  }


  renderRow = (row: number, units: List<(UnitDefinition | null)>) => {
    return (
      <Table.Row key={row}>
        {
          units.map((unit, index) => (
            <Table.Cell key={index} selectable onClick={() => this.props.onClick(row, index)}>
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
