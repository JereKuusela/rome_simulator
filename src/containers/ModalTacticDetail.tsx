import React, { Component } from 'react'
import { connect } from 'react-redux'
import { setBaseValue, ValueType, TacticType, changeImage, changeMode } from '../store/tactics'
import { AppState } from '../store/'
import TacticDetail from '../components/TacticDetail'
import { DefinitionType } from '../base_definition'
import { mergeUnitTypes, filterTacticTypes, filterTactics } from '../store/utils'

const CUSTOM_VALUE_KEY = 'Custom'

class ModalTacticDetail extends Component<IProps> {
  render(): JSX.Element | null {
    if (!this.props.tactic)
      return null
    return (
      <TacticDetail
        tactics={this.props.tactics}
        tactic_types={this.props.tactic_types}
        unit_types={this.props.unit_types}
        units={this.props.units}
        custom_value_key={CUSTOM_VALUE_KEY}
        tactic={this.props.tactics.get(this.props.tactic)!}
        onCustomBaseValueChange={this.props.setBaseValue}
        onTypeChange={this.props.changeType}
        onImageChange={this.props.changeImage}
        onModeChange={this.props.changeMode}
      />
    )
  }
}

const mapStateToProps = (state: AppState) => ({
  tactics: filterTactics(state),
  tactic_types: filterTacticTypes(state),
  units: state.units,
  unit_types: mergeUnitTypes(state)
})

const mapDispatchToProps = (dispatch: any) => ({
  setBaseValue: (tactic: TacticType,  key: string, attribute: ValueType, value: number) => (
    !Number.isNaN(value) && dispatch(setBaseValue(tactic, key, attribute, value))
  ),
  changeImage: (type: TacticType, image: string) => dispatch(changeImage(type, image)),
  changeMode: (type: TacticType, mode: DefinitionType) => dispatch(changeMode(type, mode))
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
  tactic: TacticType | null
  changeType: (old_type: TacticType, new_type: TacticType) => void
 }

export default connect(mapStateToProps, mapDispatchToProps)(ModalTacticDetail)
