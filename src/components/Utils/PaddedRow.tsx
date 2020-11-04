import React, { Component } from 'react'
import { Table } from 'semantic-ui-react'
import { mapRange } from '../../utils'

interface IProps {
  cells: number
  stretch?: number
}

/**
 * Creates a table row with a fixed amount of cells.
 */
export default class PaddedRow extends Component<IProps> {
  render() {
    const { cells, children } = this.props
    const stretch = (this.props.stretch === undefined ? cells : this.props.stretch) - 1
    const length = React.Children.count(children)
    return (
      <Table.Row>
        {React.Children.map(children, (child, index) => (
          <Table.Cell key={index} collapsing={index !== stretch}>
            {child}
          </Table.Cell>
        ))}
        {mapRange(cells - length, number => (
          <Table.Cell key={number} collapsing={number + length !== stretch} />
        ))}
      </Table.Row>
    )
  }
}
