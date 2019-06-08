import React, { Component } from 'react'
import { connect } from 'react-redux'
import { UnitType, setGlobalValue, ArmyName, ValueType } from '../store/units'
import { AppState } from '../store/'
import { ValuesType } from '../base_definition'
import { OrderedSet } from 'immutable'
import UnitDetail from '../components/UnitDetail'

const CUSTOM_VALUE_KEY = 'Global'

class ModalGlobalStatsDetail extends Component<IProps> {
  render() {
    if (!this.props.army || this.props.unit)
      return null
    const unit_types = this.props.unit_types.reduce((previous, current) => previous.merge(current.toOrderedSet()), OrderedSet<UnitType>())
    return (
      <UnitDetail
        identifier={this.props.army}
        terrains={this.props.terrains}
        custom_value_key={CUSTOM_VALUE_KEY}
        unit={this.props.global_stats.get(this.props.army)!}
        units={this.props.units}
        unit_types={unit_types}
        onCustomBaseValueChange={this.props.setGlobalBaseValue}
        onCustomModifierValueChange={this.props.setGlobalModifierValue}
        onCustomLossValueChange={this.props.setGlobalLossValue}
        show_statistics={false}
      />
    )
  }
}

const mapStateToProps = (state: AppState) => ({
  global_stats: state.global_stats,
  terrains: state.terrains.types,
  units: state.units.definitions,
  unit_types: state.units.types,
})

const mapDispatchToProps = (dispatch: any) => ({
  setGlobalBaseValue: (army: ArmyName, _: UnitType, key: string, attribute: ValueType, value: number) => (
    !Number.isNaN(value) && dispatch(setGlobalValue(army, ValuesType.Base, key, attribute, value))
  ),
  setGlobalModifierValue: (army: ArmyName, _: UnitType, key: string, attribute: ValueType, value: number) => (
    !Number.isNaN(value) && dispatch(setGlobalValue(army, ValuesType.Modifier, key, attribute, value))
  ),
  setGlobalLossValue: (army: ArmyName, _: UnitType, key: string, attribute: ValueType, value: number) => (
    !Number.isNaN(value) && dispatch(setGlobalValue(army, ValuesType.Loss, key, attribute, value))
  )
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
  army: ArmyName | null
  unit: UnitType | null
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalGlobalStatsDetail)
