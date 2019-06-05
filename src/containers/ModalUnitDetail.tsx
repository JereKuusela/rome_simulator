import React, { Component } from 'react'
import { connect } from 'react-redux'
import { UnitType, ArmyName, ValueType, setValue } from '../store/units'
import { AppState } from '../store/'
import { ValuesType, merge_values } from '../base_definition'
import UnitDetail from '../components/UnitDetail'

const CUSTOM_VALUE_KEY = 'Custom'

class ModalUnitDetail extends Component<IProps> {
  render() {
    if (!this.props.army || !this.props.unit)
      return null
    return (
      <UnitDetail
        army={this.props.army}
        custom_value_key={CUSTOM_VALUE_KEY}
        unit={merge_values(this.props.units.getIn([this.props.army, this.props.unit]), this.props.global_stats.get(this.props.army)!)}
        onCustomBaseValueChange={this.props.setBaseValue}
        onCustomModifierValueChange={this.props.setModifierValue}
        onCustomLossValueChange={this.props.setLossValue}
        show_statistics={false}
      />
    )
  }
}

const mapStateToProps = (state: AppState) => ({
  units: state.units,
  global_stats: state.global_stats
})

const mapDispatchToProps = (dispatch: any) => ({
  setBaseValue: (army: ArmyName, unit: UnitType, key: string, attribute: ValueType, value: number) => (
    !Number.isNaN(value) && dispatch(setValue(army, ValuesType.Base, unit, key, attribute,value))
  ),
  setModifierValue: (army: ArmyName, unit: UnitType, key: string, attribute: ValueType, value: number) => (
    !Number.isNaN(value) && dispatch(setValue(army, ValuesType.Modifier, unit, key, attribute, value))
  ),
  setLossValue: (army: ArmyName, unit: UnitType, key: string, attribute: ValueType, value: number) => (
    !Number.isNaN(value) && dispatch(setValue(army, ValuesType.Loss, unit, key, attribute, value))
  )
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
  army: ArmyName | null
  unit: UnitType | null
 }

export default connect(mapStateToProps, mapDispatchToProps)(ModalUnitDetail)
