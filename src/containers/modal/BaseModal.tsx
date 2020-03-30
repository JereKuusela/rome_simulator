import React, { Component } from 'react'
import { connect } from 'react-redux'
import { ModalType } from 'types'
import { AppState } from 'state'
import { closeModal } from 'reducers'
import { Modal } from 'semantic-ui-react'

type Props = {
  type: ModalType
  basic?: boolean
}

class BaseModal extends Component<IProps> {
  render() {
    const { type, basic, visible, children, closeModal } = this.props
    return (
      <Modal basic={basic} onClose={() => closeModal(type)} open={visible} centered={false} >
        <Modal.Content>
          {children}
        </Modal.Content>
      </Modal>
    )
  }
}

const mapStateToProps = (state: AppState, props: Props) => ({
  visible: !!state.ui[props.type]
})

const actions = { closeModal }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends React.PropsWithChildren<Props>, S, D { }

export default connect(mapStateToProps, actions)(BaseModal)
