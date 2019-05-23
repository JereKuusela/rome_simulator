import React, { Component } from 'react'
import { connect } from 'react-redux'
import { UnitType, setGlobalBaseValue, setGlobalModifierValue, setGlobalLossValue, ArmyType, ValueType } from '../store/units'
import { AppState } from '../store/'
import UnitDetail from '../components/UnitDetail'

const CUSTOM_VALUE_KEY = 'Global'

class ModalGlobalStatsDetail extends Component<IProps> {
  render() {
    if (!this.props.army || this.props.unit)
      return null
    return (
      <UnitDetail
        army={this.props.army}
        custom_value_key={CUSTOM_VALUE_KEY}
        unit={this.props.global_stats.get(this.props.army)!}
        onCustomBaseValueChange={this.props.setGlobalBaseValue}
        onCustomModifierValueChange={this.props.setGlobalModifierValue}
        onCustomLossValueChange={this.props.setGlobalLossValue}
      />
    )
  }
}

const mapStateToProps = (state: AppState) => ({
  global_stats: state.units.global_stats
})

const mapDispatchToProps = (dispatch: any) => ({
  setGlobalBaseValue: (army: ArmyType, _: UnitType, key: string, attribute: ValueType, value: number) => (
    !Number.isNaN(value) && dispatch(setGlobalBaseValue(army, key, attribute, value))
  ),
  setGlobalModifierValue: (army: ArmyType, _: UnitType, key: string, attribute: ValueType, value: number) => (
    !Number.isNaN(value) && dispatch(setGlobalModifierValue(army, key, attribute, value))
  ),
  setGlobalLossValue: (army: ArmyType, _: UnitType, key: string, attribute: ValueType, value: number) => (
    !Number.isNaN(value) && dispatch(setGlobalLossValue(army, key, attribute, value))
  )
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
  army: ArmyType | null
  unit: UnitType | null
 }

export default connect(mapStateToProps, mapDispatchToProps)(ModalGlobalStatsDetail)
