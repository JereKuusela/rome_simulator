import React, { Component } from 'react'
import { Input, Grid, Button } from 'semantic-ui-react'
import { AppState } from 'state'
import { ModalType } from 'types'
import { closeModal } from 'reducers'
import { connect } from 'react-redux'
import BaseModal from './BaseModal'


type IState = {
  value: string
}

/**
 * Component for setting a value in a modal.
 */
class ValueModal extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props)
    this.state = { value: props.initial }
  }

  componentWillReceiveProps() {
    this.setState({ value: this.props.initial })
  }

  render() {
    const { message, button_message } = this.props
    const { value } = this.state
    return (
      <BaseModal type={ModalType.Value} header={message}>
        <Grid padded>
          <Grid.Row>
            <Input defaultValue={value} onChange={(_, { value }) => this.setState({ value })} />
          </Grid.Row>
          <Grid.Row>
            <Button onClick={this.onSuccess} disabled={!value}>
              {button_message}
            </Button>
          </Grid.Row>
        </Grid>
      </BaseModal>
    )
  }

  onSuccess = () => {
    const { onSuccess, closeModal } = this.props
    const { value } = this.state
    if (value)
      onSuccess(value)
    closeModal()
  }
}

const mapStateToProps = (state: AppState) => {
  const data = state.ui.modals[ModalType.Value]
  return {
    message: data?.message ?? '',
    onSuccess: data?.onSuccess ?? (() => { }),
    initial: data?.initial ?? '',
    button_message: data?.button_message ?? ''
  }
}

const actions = { closeModal }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends S, D { }

export default connect(mapStateToProps, actions)(ValueModal)
