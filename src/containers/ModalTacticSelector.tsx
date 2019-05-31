import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Modal } from 'semantic-ui-react'
import { AppState } from '../store/'
import { selectTactic } from '../store/land_battle'
import ItemSelector from '../components/ItemSelector'
import { ArmyName } from '../store/units'
import { TacticType } from '../store/tactics'

export interface ModalInfo {
  army: ArmyName
}

class ModalTacticSelector extends Component<IProps> {
  render() {
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
            can_remove={false}
            can_select={true}
          />
        </Modal.Content>
      </Modal>
    )
  }

  selectTactic = (type: TacticType | undefined) => (
    this.props.info && type && this.props.selectTactic(this.props.info.army, type)
  )
}

const mapStateToProps = (state: AppState) => ({
  tactics: state.tactics.tactics
})

const mapDispatchToProps = (dispatch: any) => ({
  selectTactic: (army: ArmyName, type: TacticType) => dispatch(selectTactic(army, type))
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
  info: ModalInfo | null
  onClose: () => void
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalTacticSelector)
