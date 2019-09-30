import React, { Component } from 'react'
import { Modal, Input, Grid, Button } from 'semantic-ui-react'

interface IProps<T> {
  onSuccess: (value: T) => void
  onClose: () => void
  message: string
  button_message: string
  open: boolean
  initial: T
}

interface IState<T> {
  value: T
}

/**
 * Component for setting a value in a modal.
 */
export default class ValueModal<T extends string> extends Component<IProps<T>, IState<T>> {

  constructor(props: IProps<T>) {
    super(props)
    this.state = { value: this.props.initial }
  }

  render() {
    const { open, onClose, message, button_message } = this.props
    const { value } = this.state
    return (
      <Modal onClose={onClose} open={open}>
        <Modal.Header>{message}</Modal.Header>
        <Modal.Content style={{ paddingLeft: '5em' }}>
          <Grid>
            <Grid.Row>
              <Input value={value} onChange={(_, { value }) => this.setState({ value: value as T })} />
            </Grid.Row>
            <Grid.Row>
              <Button onClick={this.onSuccess} disabled={!value}>
                {button_message}
              </Button>
            </Grid.Row>
          </Grid>
        </Modal.Content>
      </Modal>
    )
  }

  onSuccess = () => {
    const { onSuccess, onClose } = this.props
    const { value } = this.state
    if (value)
      onSuccess(value)
    onClose()
  }
}
