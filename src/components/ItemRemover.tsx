import React, { Component } from 'react'
import { Table } from 'semantic-ui-react'

type IProps = {
  onRemove: () => void
}

/** Component for removing items. */
export default class ItemRemover extends Component<IProps> {

  render() {
    return (
      <Table celled selectable unstackable>
        <Table.Body>
          <Table.Row onClick={this.onClick}>
            <Table.Cell>
              Remove
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    )
  }

  onClick = (): void => this.props.onRemove()
}
