import React, { Component } from 'react'
import { Modal, Input, Grid, Button } from 'semantic-ui-react'
import DropDownSelector from './DropdownSelector'

interface IProps<T, S> {
  readonly onSuccess: (value: T, selected: S) => void
  readonly onClose: () => void
  readonly message: string
  readonly value_label?: string
  readonly dropdown_label?: string
  readonly button_message: string
  readonly open: boolean
  readonly value: T
  readonly selected: S
  readonly items: S[]
}

interface IState<T, S> {
  value: T,
  selected: S
}

export default class ValueDropdownModal<T extends string, S extends string> extends Component<IProps<T, S>, IState<T, S>> {

  constructor(props: IProps<T, S>) {
    super(props)
    this.state = { value: this.props.value, selected: this.props.selected }
  }

  render(): JSX.Element {
    return (
      <Modal onClose={this.props.onClose} open={this.props.open}>
        <Modal.Header>{this.props.message}</Modal.Header>
        <Modal.Content style={{ paddingLeft: '5em' }}>
          <Grid>
            <Grid.Row columns='2'>
              <Grid.Column>
                <Input
                  value={this.state.value}
                  placeholder={this.props.value_label}
                  onChange={(_, event) => this.setState({ value: event.value as T })}
                />
              </Grid.Column>
              <Grid.Column>
                {
                  this.props.dropdown_label
                }
                <DropDownSelector
                  value={this.state.selected}
                  items={this.props.items}
                  clearable
                  onSelect={item => this.setState({selected: item})}
                />
              </Grid.Column>
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
      this.props.onSuccess(this.state.value, this.state.selected)
    this.props.onClose()
  }
}
