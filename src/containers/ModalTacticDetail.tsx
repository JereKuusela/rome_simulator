import React, { Component } from 'react'
import { connect } from 'react-redux'
import { setBaseValue, ValueType, TacticType, changeImage } from '../store/tactics'
import { AppState } from '../store/'
import TacticDetail from '../components/TacticDetail'
import { OrderedSet } from 'immutable'
import { UnitType } from '../store/units'

const CUSTOM_VALUE_KEY = 'Custom'

class ModalTacticDetail extends Component<IProps> {
  render() {
    if (!this.props.tactic)
      return null
    const unit_types = this.props.unit_types.reduce((previous, current) => previous.merge(current.toOrderedSet()), OrderedSet<UnitType>())
    return (
      <TacticDetail
        tactic_types={this.props.tactic_types}
        tactics={this.props.tactics}
        unit_types={unit_types}
        units={this.props.units}
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
  tactic_types: state.tactics.types.toOrderedSet(),
  units: state.units.definitions,
  unit_types: state.units.types
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
