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
    const { message, onConfirm, negative, text } = this.props
    return (
      <>
        <Confirmation
          message={message}
          open={this.state.open}
          onConfirm={onConfirm}
          onClose={this.onClose}
        />
        <Button negative={negative} onClick={this.onClick}>
          {text}
        </Button>
      </>
    )
  }
  onClick = () => this.setState({ open: true })
  onClose = () => this.setState({ open: false })
}
