import React, { Component } from 'react'
import { Table } from 'semantic-ui-react'


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
