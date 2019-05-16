import React, { Component } from 'react'
import { connect } from 'react-redux'
import { UnitType, UnitDefinition, setBaseValue, setModifierValue, setLossValue, ArmyType, ValueType } from '../store/units'
import { AppState } from '../store/'
import { setUnitModal } from '../store/layout'
import { ModalUnitDetail as DisplayComponent } from '../components/ModalUnitDetail'

interface IStateFromProps { unit: UnitDefinition | null, army: ArmyType | null }
interface IDispatchFromProps {
  close: () => void
  setBaseValue: (army: ArmyType, type: UnitType, value_type: ValueType, key: string, value: number) => void
  setModifierValue: (army: ArmyType, type: UnitType, value_type: ValueType, key: string, value: number) => void
  setLossValue: (army: ArmyType, type: UnitType, value_type: ValueType, key: string, value: number) => void
}
interface IProps extends IStateFromProps, IDispatchFromProps { }

const CUSTOM_VALUE_KEY = 'custom'

class ModalUnitDetail extends Component<IProps> {
  render() {
    if (this.props.unit === null || this.props.army === null)
      return null
    return (
      <DisplayComponent
        army={this.props.army}
        custom_value_key={CUSTOM_VALUE_KEY}
        unit={this.props.unit}
        onClose={this.props.close}
        onCustomBaseValueChange={this.props.setBaseValue}
        onCustomModifierValueChange={this.props.setModifierValue}
        onCustomLossValueChange={this.props.setLossValue}
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
  setBaseValue: (army: ArmyType, type: UnitType, value_type: ValueType, key: string, value: number) => (
    !Number.isNaN(value) && dispatch(setBaseValue(army, type, value_type, key, value))
  ),
  setModifierValue: (army: ArmyType, type: UnitType, value_type: ValueType, key: string, value: number) => (
    !Number.isNaN(value) && dispatch(setModifierValue(army, type, value_type, key, value))
  ),
  setLossValue: (army: ArmyType, type: UnitType, value_type: ValueType, key: string, value: number) => (
    !Number.isNaN(value) && dispatch(setLossValue(army, type, value_type, key, value))
  )
})

export default connect(mapStateToProps, mapDispatchToProps)(ModalUnitDetail)
