import React, { Component } from 'react'
import { Map } from 'immutable'
import { connect } from 'react-redux'
import { AppState } from '../store/'
import { selectTactic } from '../store/land_battle'
import { ModalSelector } from '../components/ModalSelector'
import { ArmyType } from '../store/units'
import { TacticType, TacticDefinition } from '../store/tactics'

interface IStateFromProps {
  tactics : Map<TacticType, TacticDefinition>
}
interface IDispatchFromProps {
  selectTactic: (army: ArmyType, tactic: TacticDefinition) => void
}
interface IProps extends IStateFromProps, IDispatchFromProps {
  info: ModalInfo | null
  onClose: () => void
 }
export interface ModalInfo {
  army: ArmyType
}

class ModalTacticSelector extends Component<IProps> {
  render() {
    if (!this.props.info)
      return null
    return (
      <ModalSelector
        onClose={this.props.onClose}
        onSelection={this.selectTactic}
        items={this.props.tactics.toList()}
        attributes={[]}
        can_remove={false}
      />
    )
  }

  selectTactic = (type: TacticType | null) => (
    this.props.info && type && this.props.selectTactic(this.props.info.army, this.props.tactics.get(type)!)
  )
}

const mapStateToProps = (state: AppState): IStateFromProps => ({
  tactics: state.tactics.tactics
})

const mapDispatchToProps = (dispatch: any): IDispatchFromProps => ({
  selectTactic: (army, tactic) => dispatch(selectTactic(army, tactic))
})

export default connect(mapStateToProps, mapDispatchToProps)(ModalTacticSelector)
