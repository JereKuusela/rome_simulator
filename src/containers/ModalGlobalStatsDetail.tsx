import React, { Component } from 'react'
import { Map } from 'immutable'
import { connect } from 'react-redux'
import { UnitType, UnitDefinition, setGlobalBaseValue, setGlobalModifierValue, setGlobalLossValue, ArmyType, ValueType } from '../store/units'
import { AppState } from '../store/'
import { ModalUnitDetail as DisplayComponent } from '../components/ModalUnitDetail'

interface IStateFromProps {
  units: Map<ArmyType, Map<UnitType, UnitDefinition>>
}
interface IDispatchFromProps {
  setGlobalBaseValue: (army: ArmyType, type: UnitType, key: string, attribute: ValueType, value: number) => void
  setGlobalModifierValue: (army: ArmyType, type: UnitType, key: string, attribute: ValueType, value: number) => void
  setGlobalLossValue: (army: ArmyType, type: UnitType, key: string, attribute: ValueType, value: number) => void
}
interface IProps extends IStateFromProps, IDispatchFromProps {
  army: ArmyType | null
  unit: UnitType | null
  onClose: () => void
 }

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

const mapStateToProps = (state: AppState): IStateFromProps => ({
  units: state.units.units
})

const mapDispatchToProps = (dispatch: any): IDispatchFromProps => ({
  setGlobalBaseValue: (army, _, key, attribute, value) => (
    !Number.isNaN(value) && dispatch(setGlobalBaseValue(army, key, attribute, value))
  ),
  setGlobalModifierValue: (army, _, key, attribute, value) => (
    !Number.isNaN(value) && dispatch(setGlobalModifierValue(army, key, attribute, value))
  ),
  setGlobalLossValue: (army, _, key, attribute, value) => (
    !Number.isNaN(value) && dispatch(setGlobalLossValue(army, key, attribute, value))
  )
})

export default connect(mapStateToProps, mapDispatchToProps)(ModalGlobalStatsDetail)
