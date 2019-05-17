import React, { Component } from 'react'
import { Map } from 'immutable'
import { connect } from 'react-redux'
import { UnitType, UnitDefinition, setBaseValue, setModifierValue, setLossValue, ArmyType, ValueType } from '../store/units'
import { AppState } from '../store/'
import { ModalUnitDetail as DisplayComponent } from '../components/ModalUnitDetail'

interface IStateFromProps {
  units: Map<ArmyType, Map<UnitType, UnitDefinition>>
}
interface IDispatchFromProps {
  setBaseValue: (army: ArmyType, type: UnitType, key: string, value_type: ValueType, value: number) => void
  setModifierValue: (army: ArmyType, type: UnitType, key: string, value_type: ValueType, value: number) => void
  setLossValue: (army: ArmyType, type: UnitType, key: string, value_type: ValueType, value: number) => void
}
interface IProps extends IStateFromProps, IDispatchFromProps {
  army: ArmyType | null
  unit: UnitType | null
  onClose: () => void
 }

const CUSTOM_VALUE_KEY = 'Custom'

class ModalUnitDetail extends Component<IProps> {
  render() {
    if (!this.props.army ||!this.props.unit)
      return null
    return (
      <DisplayComponent
        army={this.props.army}
        custom_value_key={CUSTOM_VALUE_KEY}
        unit={this.props.units.getIn([this.props.army, this.props.unit])}
        onClose={this.props.onClose}
        onCustomBaseValueChange={this.props.setBaseValue}
        onCustomModifierValueChange={this.props.setModifierValue}
        onCustomLossValueChange={this.props.setLossValue}
      />
    )
  }
}

const mapStateToProps = (state: AppState): IStateFromProps => ({
  units: state.units.units
})

const mapDispatchToProps = (dispatch: any): IDispatchFromProps => ({
  setBaseValue: (army, unit, key, attribute, value) => (
    !Number.isNaN(value) && dispatch(setBaseValue(army, unit, key, attribute,value))
  ),
  setModifierValue: (army, unit, key, attribute, value) => (
    !Number.isNaN(value) && dispatch(setModifierValue(army, unit, key, attribute, value))
  ),
  setLossValue: (army, unit, key, attribute, value) => (
    !Number.isNaN(value) && dispatch(setLossValue(army, unit, key, attribute, value))
  )
})

export default connect(mapStateToProps, mapDispatchToProps)(ModalUnitDetail)
