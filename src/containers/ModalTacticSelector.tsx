import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Modal } from 'semantic-ui-react'
import { AppState } from '../store/'
import { selectTactic } from '../store/land_battle'
import ItemSelector from '../components/ItemSelector'
import { ArmyType } from '../store/units'
import { TacticType, TacticDefinition } from '../store/tactics'

export interface ModalInfo {
  army: ArmyType
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

  selectTactic = (type: TacticType | null) => (
    this.props.info && type && this.props.selectTactic(this.props.info.army, this.props.tactics.get(type)!)
  )
}

const mapStateToProps = (state: AppState) => ({
  tactics: state.tactics.tactics
})

const mapDispatchToProps = (dispatch: any) => ({
  selectTactic: (army: ArmyType, tactic: TacticDefinition) => dispatch(selectTactic(army, tactic))
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
  info: ModalInfo | null
  onClose: () => void
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalTacticSelector)
