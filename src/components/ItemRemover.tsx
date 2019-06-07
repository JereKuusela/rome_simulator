import React, { Component } from 'react'
import { Table } from 'semantic-ui-react'
import Confirmation from './Confirmation'

interface IProps {
  onClose: () => void
  onRemove: () => void
  confirm_remove?: boolean
  item?: string
}

interface IState {
  is_confirm: boolean
}

export default class ItemRemover extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props)
    this.state = { is_confirm: false }
  }

  render() {
    return (
      <Table celled selectable unstackable>
        <Confirmation
          onClose={this.confirmOnClose}
          onConfirm={this.confirmOnConfirm}
          open={this.state.is_confirm}
          message={'Are you sure you want to remove ' + this.props.item + ' ?'}
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

  remove = () => {
    this.props.onRemove()
    this.props.onClose()
  }

  confirmOnClose = () => this.setState({ is_confirm: false })

  confirmOnConfirm = () => this.remove()

  onClick = () => {
    if (this.props.confirm_remove)
      this.setState({ is_confirm: true })
    else
      this.remove()
  }
}
