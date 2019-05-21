import React, { Component } from 'react'
import { connect } from 'react-redux'
import { setBaseValue, ValueType, TacticType } from '../store/tactics'
import { AppState } from '../store/'
import { ModalTacticDetail as DisplayComponent } from '../components/ModalTacticDetail'

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

const mapStateToProps = (state: AppState) => ({
  tactics: state.tactics.tactics
})

const mapDispatchToProps = (dispatch: any) => ({
  setBaseValue: (tactic: TacticType,  key: string, attribute: ValueType, value: number) => (
    !Number.isNaN(value) && dispatch(setBaseValue(tactic, key, attribute, value))
  )
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
  tactic: TacticType | null
  onClose: () => void
 }

export default connect(mapStateToProps, mapDispatchToProps)(ModalTacticDetail)
