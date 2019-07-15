import React, { Component } from 'react'
import { Button } from 'semantic-ui-react'
import Confirmation from './Confirmation'

interface IProps {
  onConfirm: () => void
  message: string
  text: string
  negative?: boolean
}

interface IState {
  open: boolean
}

/**
 * Confirmation dialog which renders a trigger button.
 */
export default class ConfirmationButton extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props)
    this.state = { open: false }
  }

  render(): JSX.Element {
    return (
      <div>
        <Confirmation
          message={this.props.message}
          open={this.state.open}
          onConfirm={this.onConfirm}
          onClose={this.onClose}
        />
        <Button negative={this.props.negative} onClick={this.onClick}>
          {this.props.text}
        </Button>
      </div>
    )
  }
  onClick = () => {
    this.setState({ open: true })
  }
  onClose = () => {
    this.setState({ open: false })
  }
  onConfirm = () => {
    this.props.onConfirm()
  }
}
