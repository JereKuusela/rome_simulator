import React, { Component } from 'react'
import { Modal, Input, Grid, Button } from 'semantic-ui-react'

interface IProps {
  onCreate: (type: string) => void
  onClose: () => void
  message: string
  open: boolean
}

interface IState {
  type: string
}


export default class NewDefinition extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props)
    this.state = { type: '' }
  }

  render() {
    return (
      <Modal onClose={this.props.onClose} open={this.props.open}>
        <Modal.Header>{this.props.message}</Modal.Header>
        <Modal.Content style={{ paddingLeft: '5em' }}>
          <Grid>
            <Grid.Row>
              <Input label='Type' value={this.state.type} onChange={(_, event) => this.setState({ type: event.value })} />
            </Grid.Row>
            <Grid.Row>
              <Button onClick={this.onCreate}>
                Create
              </Button>
            </Grid.Row>
          </Grid>
        </Modal.Content>
      </Modal>
    )
  }

  onCreate = () => {
    this.props.onCreate(this.state.type)
    this.props.onClose()
  }
}
