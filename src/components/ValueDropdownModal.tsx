import React, { Component } from 'react'
import { Modal, Input, Grid, Button } from 'semantic-ui-react'
import SimpleDropdown from './Dropdowns/SimpleDropdown'

interface IProps<T, S> {
  onSuccess: (value: T, selected: S) => void
  onClose: () => void
  message: string
  valueLabel?: string
  dropdownLabel?: string
  buttonMessage: string
  open: boolean
  value: T
  selected: S
  items: S[]
}

interface IState<T, S> {
  value: T
  selected: S
}

/**
 * Component for choosing a dropdown value in a modal.
 */
export default class ValueDropdownModal<T extends string, S extends string> extends Component<
  IProps<T, S>,
  IState<T, S>
> {
  constructor(props: IProps<T, S>) {
    super(props)
    this.state = { value: this.props.value, selected: this.props.selected }
  }

  render() {
    const { onClose, open, message, items, valueLabel, dropdownLabel, buttonMessage } = this.props
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
                  placeholder={valueLabel}
                  onChange={(_, { value }) => this.setState({ value: value as T })}
                />
              </Grid.Column>
              <Grid.Column>
                {dropdownLabel}
                <SimpleDropdown
                  value={selected}
                  values={items}
                  clearable
                  onChange={item => this.setState({ selected: item })}
                />
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Button onClick={this.onSuccess} disabled={!value}>
                {buttonMessage}
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
    if (value) onSuccess(value, selected)
    onClose()
  }
}
