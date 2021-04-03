import React, { Component } from 'react'
import { connect, useSelector } from 'react-redux'
import { Modals, ModalType } from 'types'
import type { AppState } from 'reducers'
import { closeModal } from 'reducers'
import { Modal } from 'semantic-ui-react'

export const useModalData = <T extends ModalType>(type: T): Modals[T] => {
  return useSelector((state: AppState) => state.ui.modals[type])
}

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
