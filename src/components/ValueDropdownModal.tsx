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

/**
 * Component for choosing a dropdown value in a modal.
 */
export default class ValueDropdownModal<T extends string, S extends string> extends Component<IProps<T, S>, IState<T, S>> {

  constructor(props: IProps<T, S>) {
    super(props)
    this.state = { value: this.props.value, selected: this.props.selected }
  }

  render() {
    const { onClose, open, message, items, value_label, dropdown_label, button_message } = this.props
    const { value, selected } = this.state
    return (
      <Modal onClose={onClose} open={open}>
        <Modal.Header>{message}</Modal.Header>
        <Modal.Content style={{ paddingLeft: '5em' }}>
          <Grid>
            <Grid.Row columns='2'>
              <Grid.Column>
                <Input
                  value={value}
                  placeholder={value_label}
                  onChange={(_, { value }) => this.setState({ value: value as T })}
                />
              </Grid.Column>
              <Grid.Column>
                {
                  dropdown_label
                }
                <DropDownSelector
                  value={selected}
                  items={items}
                  clearable
                  onSelect={item => this.setState({ selected: item })}
                />
              </Grid.Column>
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
    const { value, selected } = this.state
    if (value)
      onSuccess(value, selected)
    onClose()
  }
}
