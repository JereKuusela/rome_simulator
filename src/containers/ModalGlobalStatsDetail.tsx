import React, { Component } from 'react'
import { Map } from 'immutable'
import { connect } from 'react-redux'
import { UnitType, UnitDefinition, setGlobalBaseValue, setGlobalModifierValue, setGlobalLossValue, ArmyType, ValueType } from '../store/units'
import { AppState } from '../store/'
import { ModalUnitDetail as DisplayComponent } from '../components/ModalUnitDetail'

const CUSTOM_VALUE_KEY = 'Global'

class ModalGlobalStatsDetail extends Component<IProps> {
  render() {
    if (!this.props.army ||!this.props.unit)
      return null
    return (
      <DisplayComponent
        army={this.props.army}
        custom_value_key={CUSTOM_VALUE_KEY}
        unit={this.props.units.getIn([this.props.army, this.props.unit])}
        onClose={this.props.onClose}
        onCustomBaseValueChange={this.props.setGlobalBaseValue}
        onCustomModifierValueChange={this.props.setGlobalModifierValue}
        onCustomLossValueChange={this.props.setGlobalLossValue}
      />
    )
  }
}

const mapStateToProps = (state: AppState) => ({
  units: state.units.units
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
  onClose: () => void
 }

export default connect(mapStateToProps, mapDispatchToProps)(ModalGlobalStatsDetail)
