import React, { Component } from 'react'
import { connect } from 'react-redux'
import { UnitType, setBaseValue, setModifierValue, setLossValue, ArmyType, ValueType } from '../store/units'
import { AppState } from '../store/'
import { ModalUnitDetail as DisplayComponent } from '../components/ModalUnitDetail'

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

const mapStateToProps = (state: AppState) => ({
  units: state.units.units
})

const mapDispatchToProps = (dispatch: any) => ({
  setBaseValue: (army: ArmyType, unit: UnitType, key: string, attribute: ValueType, value: number) => (
    !Number.isNaN(value) && dispatch(setBaseValue(army, unit, key, attribute,value))
  ),
  setModifierValue: (army: ArmyType, unit: UnitType, key: string, attribute: ValueType, value: number) => (
    !Number.isNaN(value) && dispatch(setModifierValue(army, unit, key, attribute, value))
  ),
  setLossValue: (army: ArmyType, unit: UnitType, key: string, attribute: ValueType, value: number) => (
    !Number.isNaN(value) && dispatch(setLossValue(army, unit, key, attribute, value))
  )
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
  army: ArmyType | null
  unit: UnitType | null
  onClose: () => void
 }

export default connect(mapStateToProps, mapDispatchToProps)(ModalUnitDetail)
