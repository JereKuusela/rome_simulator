import React, { Component } from 'react'
import { connect } from 'react-redux'
import { ModalType } from 'types'
import { AppState } from 'state'
import { closeModal } from 'reducers'
import { Modal } from 'semantic-ui-react'

type Props = {
  type: ModalType
  basic?: boolean
  header?: string
}

class BaseModal extends Component<IProps> {
  shouldComponentUpdate(prevProps: IProps) {
    return !(!this.props.visible && !prevProps.visible)
  }

  render() {
    const { basic, visible, children, closeModal, header } = this.props
    return (
      <Modal basic={basic} onClose={() => closeModal()} open={visible} centered={false}>
        {header && <Modal.Header>{header}</Modal.Header>}
        <Modal.Content>{children}</Modal.Content>
      </Modal>
    )
  }
}

const mapStateToProps = (state: AppState, props: Props) => ({
  visible: !!state.ui.modals[props.type]
})

const actions = { closeModal }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends React.PropsWithChildren<Props>, S, D {}

export default connect(mapStateToProps, actions)(BaseModal)
