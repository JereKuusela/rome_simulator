import React, { Component } from 'react'
import { Table } from 'semantic-ui-react'

interface IProps {
  values: string[]
}

/**
 * Creates a table row with a fixed amount of cells.
 */
export default class Headers extends Component<IProps> {

  render() {
    const { values } = this.props
    return (
      <Table.Header>
        <Table.Row>
          {values.map(this.renderHeader)}
        </Table.Row>
      </Table.Header>
    )
  }

  renderHeader = (value: string) => (
    <Table.HeaderCell key={value}>
      {value}
    </Table.HeaderCell>
  )
}
