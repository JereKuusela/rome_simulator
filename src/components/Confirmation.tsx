import React, { Component } from 'react'
import { Modal, Input, Grid } from 'semantic-ui-react'

interface IProps {
  onConfirm: () => void
  onClose: () => void
  message: string
  open: boolean
}

interface IState {
  confirmation: string
}


export default class Confirmation extends Component<IProps, IState> {

  CONFIRM = 'yes'

  constructor(props: IProps) {
    super(props)
    this.state = { confirmation: '' }
  }

  render(): JSX.Element {
    return (
      <Modal onClose={this.props.onClose} open={this.props.open}>
        <Modal.Header>{this.props.message}</Modal.Header>
        <Modal.Content style={{ paddingLeft: '5em' }}>
          <Grid>
            <Grid.Row>
              Write&nbsp;<i>yes</i>&nbsp;to confirm
              </Grid.Row>
            <Grid.Row>
              <Input value={this.state.confirmation} onChange={(_, {value}) => this.checkConfirm(value)} autoFocus />
            </Grid.Row>
          </Grid>
        </Modal.Content>
      </Modal>
    )
  }
  checkConfirm = (value: string) => {
    if (value === this.CONFIRM) {
      this.setState({ confirmation: '' })
      this.props.onConfirm()
      // Prevents nasty scroll down.
      setTimeout(() => this.props.onClose(), 0)
    }
    else {
      this.setState({ confirmation: value })
    }
  }
}
