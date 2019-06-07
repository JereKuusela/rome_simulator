import React, { Component } from 'react'
import { connect } from 'react-redux'
import { setBaseValue, ValueType, TacticType, changeImage } from '../store/tactics'
import { AppState } from '../store/'
import TacticDetail from '../components/TacticDetail'

const CUSTOM_VALUE_KEY = 'Custom'

class ModalTacticDetail extends Component<IProps> {
  render() {
    if (!this.props.tactic)
      return null
    return (
      <TacticDetail
        types={this.props.types}
        tactics={this.props.tactics}
        custom_value_key={CUSTOM_VALUE_KEY}
        tactic={this.props.tactics.get(this.props.tactic)!}
        onCustomBaseValueChange={this.props.setBaseValue}
        onTypeChange={this.props.changeType}
        onImageChange={this.props.changeImage}
      />
    )
  }
}

const mapStateToProps = (state: AppState) => ({
  tactics: state.tactics.definitions,
  types: state.tactics.types
})

const mapDispatchToProps = (dispatch: any) => ({
  setBaseValue: (tactic: TacticType,  key: string, attribute: ValueType, value: number) => (
    !Number.isNaN(value) && dispatch(setBaseValue(tactic, key, attribute, value))
  ),
  changeImage: (type: TacticType, image: string) => dispatch(changeImage(type, image))
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
  tactic: TacticType | null
  changeType: (old_type: TacticType, new_type: TacticType) => void
 }

export default connect(mapStateToProps, mapDispatchToProps)(ModalTacticDetail)
