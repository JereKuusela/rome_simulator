import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Modal } from 'semantic-ui-react'
import { AppState } from '../store/'
import { selectTactic } from '../store/land_battle'
import ItemSelector from '../components/ItemSelector'
import { TacticType } from '../store/tactics'
import { ArmyName } from '../store/units'

export interface ModalInfo {
  name: ArmyName
}

class ModalTacticSelector extends Component<IProps> {
  render(): JSX.Element | null {
    if (!this.props.info)
      return null
    return (
      <Modal basic onClose={this.props.onClose} open>
        <Modal.Content>
          <ItemSelector
            onClose={this.props.onClose}
            onSelection={this.selectTactic}
            items={this.props.tactics.toList()}
            attributes={[]}
          />
        </Modal.Content>
      </Modal>
    )
  }

  selectTactic = (type: TacticType | undefined): void => (
    this.props.info && type && this.props.selectTactic(this.props.info.name, type)
  )
}

const mapStateToProps = (state: AppState) => ({
  tactics: state.tactics.definitions
})

const mapDispatchToProps = (dispatch: any) => ({
  selectTactic: (name: ArmyName, type: TacticType) => dispatch(selectTactic(name, type))
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
  info: ModalInfo | null
  onClose: () => void
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalTacticSelector)
