import React, { Component } from 'react'
import { connect } from 'react-redux'
import { setBaseValue, ValueType, TacticType, TacticDefinition } from '../store/tactics'
import { AppState } from '../store/'
import { setTacticModal } from '../store/layout'
import { ModalTacticDetail as DisplayComponent } from '../components/ModalTacticDetail'

interface IStateFromProps {
  tactic: TacticDefinition | null
}
interface IDispatchFromProps {
  close: () => void
  setBaseValue: (type: TacticType, value_type: ValueType, key: string, value: number) => void
}
interface IProps extends IStateFromProps, IDispatchFromProps { }

const CUSTOM_VALUE_KEY = 'custom'

class ModalTacticDetail extends Component<IProps> {
  render() {
    if (this.props.tactic === null)
      return null
    return (
      <DisplayComponent
        custom_value_key={CUSTOM_VALUE_KEY}
        tactic={this.props.tactic}
        onClose={this.props.close}
        onCustomBaseValueChange={this.props.setBaseValue}
      />
    )
  }
}

const mapStateToProps = (state: AppState): IStateFromProps => ({
  tactic: state.layout.tactic_modal
})

const mapDispatchToProps = (dispatch: any): IDispatchFromProps => ({
  close: () => dispatch(setTacticModal(null)),
  setBaseValue: (type: TacticType, value_type: ValueType, key: string, value: number) => (
    !Number.isNaN(value) && dispatch(setBaseValue(type, value_type, key, value))
  )
})

export default connect(mapStateToProps, mapDispatchToProps)(ModalTacticDetail)
