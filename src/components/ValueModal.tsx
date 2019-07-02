import React, { Component } from 'react'
import { Modal, Input, Grid, Button } from 'semantic-ui-react'

interface IProps {
  onSuccess: (value: string) => void
  onClose: () => void
  message: string
  button_message: string
  open: boolean
  initial?: string
}

interface IState {
  value?: string
}


export default class ValueModal extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props)
    this.state = { value: this.props.initial }
  }

  render(): JSX.Element {
    return (
      <Modal onClose={this.props.onClose} open={this.props.open}>
        <Modal.Header>{this.props.message}</Modal.Header>
        <Modal.Content style={{ paddingLeft: '5em' }}>
          <Grid>
            <Grid.Row>
              <Input value={this.state.value} onChange={(_, event) => this.setState({ value: event.value })} />
            </Grid.Row>
            <Grid.Row>
              <Button onClick={this.onSuccess} disabled={!this.state.value}>
                {this.props.button_message}
              </Button>
            </Grid.Row>
          </Grid>
        </Modal.Content>
      </Modal>
    )
  }

  onSuccess = (): void => {
    if (this.state.value)
      this.props.onSuccess(this.state.value)
    this.props.onClose()
  }
}
