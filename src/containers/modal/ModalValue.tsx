import React, { Component } from 'react'
import { Input, Grid, Button } from 'semantic-ui-react'
import type { AppState } from 'reducers'
import { ModalType } from 'types'
import { closeModal } from 'reducers'
import { connect } from 'react-redux'
import BaseModal from './BaseModal'
import { noop } from 'lodash'

type IState = {
  value: string
}

/**
 * Component for setting a value in a modal.
 */
class ModalValue extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = { value: props.initial }
  }

  static getDerivedStateFromProps(props: IProps) {
    return { value: props.initial }
  }

  render() {
    const { message, buttonMessage } = this.props
    const { value } = this.state
    return (
      <BaseModal type={ModalType.Value} header={message}>
        <Grid padded>
          <Grid.Row>
            <Input defaultValue={value} onChange={(_, { value }) => this.setState({ value })} />
          </Grid.Row>
          <Grid.Row>
            <Button onClick={this.onSuccess} disabled={!value}>
              {buttonMessage}
            </Button>
          </Grid.Row>
        </Grid>
      </BaseModal>
    )
  }

  onSuccess = () => {
    const { onSuccess, closeModal } = this.props
    const { value } = this.state
    if (value) onSuccess(value)
    closeModal()
  }
}

const mapStateToProps = (state: AppState) => {
  const data = state.ui.modals[ModalType.Value]
  return {
    message: data?.message ?? '',
    onSuccess: data?.onSuccess ?? noop,
    initial: data?.initial ?? '',
    buttonMessage: data?.buttonMessage ?? ''
  }
}

const actions = { closeModal }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends S, D {}

export default connect(mapStateToProps, actions)(ModalValue)
