import React, { Component } from 'react'
import { connect } from 'react-redux'
import { UnitType, ArmyName, ValueType, setValue, changeImage } from '../store/units'
import { AppState } from '../store/'
import { ValuesType, mergeValues } from '../base_definition'
import { OrderedSet } from 'immutable'
import UnitDetail from '../components/UnitDetail'

const CUSTOM_VALUE_KEY = 'Custom'

class ModalUnitDetail extends Component<IProps> {
  render() {
    if (!this.props.army || !this.props.unit)
      return null
    const unit_types = this.props.unit_types.reduce((previous, current) => previous.merge(current.toOrderedSet()), OrderedSet<UnitType>())
    return (
      <UnitDetail
        army={this.props.army}
        terrains={this.props.terrains}
        custom_value_key={CUSTOM_VALUE_KEY}
        unit={mergeValues(this.props.units.getIn([this.props.army, this.props.unit]), this.props.global_stats.get(this.props.army)!)}
        units={this.props.units}
        unit_types={unit_types}
        onCustomBaseValueChange={this.props.setBaseValue}
        onCustomModifierValueChange={this.props.setModifierValue}
        onCustomLossValueChange={this.props.setLossValue}
        show_statistics={false}
        onTypeChange={this.props.changeType}
        onImageChange={this.props.changeImage}
      />
    )
  }
}

const mapStateToProps = (state: AppState) => ({
  units: state.units.definitions,
  global_stats: state.global_stats,
  unit_types: state.units.types,
  terrains: state.terrains.types
})

const mapDispatchToProps = (dispatch: any) => ({
  setBaseValue: (army: ArmyName, unit: UnitType, key: string, attribute: ValueType, value: number) => (
    !Number.isNaN(value) && dispatch(setValue(army, ValuesType.Base, unit, key, attribute, value))
  ),
  setModifierValue: (army: ArmyName, unit: UnitType, key: string, attribute: ValueType, value: number) => (
    !Number.isNaN(value) && dispatch(setValue(army, ValuesType.Modifier, unit, key, attribute, value))
  ),
  setLossValue: (army: ArmyName, unit: UnitType, key: string, attribute: ValueType, value: number) => (
    !Number.isNaN(value) && dispatch(setValue(army, ValuesType.Loss, unit, key, attribute, value))
  ),
  changeImage: (army: ArmyName, type: UnitType, image: string) => dispatch(changeImage(army, type, image))
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
  army: ArmyName | null
  unit: UnitType | null
  changeType: (army: ArmyName, old_type: UnitType, new_type: UnitType) => void
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalUnitDetail)
