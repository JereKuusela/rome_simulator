import React, { Component } from 'react'
import { connect } from 'react-redux'
import { UnitType, UnitDefinition, setGlobalBaseValue, setGlobalModifierValue, setGlobalLossValue, ArmyType, ValueType } from '../store/units'
import { AppState } from '../store/'
import { setUnitModal } from '../store/layout'
import { ModalUnitDetail as DisplayComponent } from '../components/ModalUnitDetail'

interface IStateFromProps {
  unit: UnitDefinition | null
  army: ArmyType | null
}
interface IDispatchFromProps {
  close: () => void
  setGlobalBaseValue: (army: ArmyType, type: UnitType, value_type: ValueType, key: string, value: number) => void
  setGlobalModifierValue: (army: ArmyType, type: UnitType, value_type: ValueType, key: string, value: number) => void
  setGlobalLossValue: (army: ArmyType, type: UnitType, value_type: ValueType, key: string, value: number) => void
}
interface IProps extends IStateFromProps, IDispatchFromProps { }

const CUSTOM_VALUE_KEY = 'global'

class ModalGlobalStatsDetail extends Component<IProps> {
  render() {
    if (this.props.unit === null || this.props.army === null || this.props.unit.type as String !== '')
      return null
    return (
      <DisplayComponent
        army={this.props.army}
        custom_value_key={CUSTOM_VALUE_KEY}
        unit={this.props.unit}
        onClose={this.props.close}
        onCustomBaseValueChange={this.props.setGlobalBaseValue}
        onCustomModifierValueChange={this.props.setGlobalModifierValue}
        onCustomLossValueChange={this.props.setGlobalLossValue}
      />
    )
  }
}

const mapStateToProps = (state: AppState): IStateFromProps => ({
  unit: state.layout.unit_modal,
  army: state.layout.army
})

const mapDispatchToProps = (dispatch: any): IDispatchFromProps => ({
  close: () => dispatch(setUnitModal(null, null)),
  setGlobalBaseValue: (army: ArmyType, _: UnitType, value_type: ValueType, key: string, value: number) => (
    !Number.isNaN(value) && dispatch(setGlobalBaseValue(army, value_type, key, value))
  ),
  setGlobalModifierValue: (army: ArmyType, _: UnitType, value_type: ValueType, key: string, value: number) => (
    !Number.isNaN(value) && dispatch(setGlobalModifierValue(army, value_type, key, value))
  ),
  setGlobalLossValue: (army: ArmyType, _: UnitType, value_type: ValueType, key: string, value: number) => (
    !Number.isNaN(value) && dispatch(setGlobalLossValue(army, value_type, key, value))
  )
})

export default connect(mapStateToProps, mapDispatchToProps)(ModalGlobalStatsDetail)
