import React, { Component } from 'react'
import { Map } from 'immutable'
import { connect } from 'react-redux'
import { setBaseValue, ValueType, TacticType, TacticDefinition } from '../store/tactics'
import { AppState } from '../store/'
import { ModalTacticDetail as DisplayComponent } from '../components/ModalTacticDetail'

interface IStateFromProps {
  readonly tactics: Map<TacticType, TacticDefinition>
}
interface IDispatchFromProps {
  setBaseValue: (type: TacticType,  key: string, attribute: ValueType, value: number) => void
}
interface IProps extends IStateFromProps, IDispatchFromProps {
  tactic: TacticType | null
  onClose: () => void
 }

const CUSTOM_VALUE_KEY = 'Custom'

class ModalTacticDetail extends Component<IProps> {
  render() {
    if (!this.props.tactic)
      return null
    return (
      <DisplayComponent
        custom_value_key={CUSTOM_VALUE_KEY}
        tactic={this.props.tactics.get(this.props.tactic)}
        onClose={this.props.onClose}
        onCustomBaseValueChange={this.props.setBaseValue}
      />
    )
  }
}

const mapStateToProps = (state: AppState): IStateFromProps => ({
  tactics: state.tactics.tactics
})

const mapDispatchToProps = (dispatch: any): IDispatchFromProps => ({
  setBaseValue: (type, key, attribute, value) => (
    !Number.isNaN(value) && dispatch(setBaseValue(type, key, attribute, value))
  )
})

export default connect(mapStateToProps, mapDispatchToProps)(ModalTacticDetail)
