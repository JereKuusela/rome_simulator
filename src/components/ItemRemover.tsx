import React, { Component } from 'react'
import { Table } from 'semantic-ui-react'
import Confirmation from './Confirmation'

interface IProps {
  onRemove: () => void
  confirm_remove?: boolean
  item?: string
}

interface IState {
  is_confirm: boolean
}

/**
 * Component for removing items with a confirmation.
 */
export default class ItemRemover extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props)
    this.state = { is_confirm: false }
  }

  render(): JSX.Element {
    const { item } = this.props
    return (
      <Table celled selectable unstackable>
        <Confirmation
          onClose={this.confirmOnClose}
          onConfirm={this.props.onRemove}
          open={this.state.is_confirm}
          message={'Are you sure you want to remove ' + item + ' ?'}
        />
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

  confirmOnClose = () => this.setState({ is_confirm: false })

  onClick = (): void => {
    if (this.props.confirm_remove)
      this.setState({ is_confirm: true })
    else
      this.props.onRemove()
  }
}
