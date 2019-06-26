import React, { Component } from 'react'
import { connect } from 'react-redux'
import { UnitType, ArmyName, ValueType, setValue, changeImage, changeMode } from '../store/units'
import { AppState } from '../store/'
import { ValuesType, mergeValues, DefinitionType } from '../base_definition'
import UnitDetail from '../components/UnitDetail'
import { mergeUnitTypes, filterTerrainTypes } from '../utils'

const CUSTOM_VALUE_KEY = 'Custom'

class ModalUnitDetail extends Component<IProps> {
  render(): JSX.Element | null {
    if (!this.props.army || !this.props.unit)
      return null
    return (
      <UnitDetail
        mode={this.props.mode}
        name={this.props.army}
        terrain_types={this.props.terrain_types}
        custom_value_key={CUSTOM_VALUE_KEY}
        unit={mergeValues(this.props.units.getIn([this.props.army, this.props.unit]), this.props.global_stats.getIn([this.props.army, this.props.mode]))}
        units={this.props.units}
        unit_types={this.props.unit_types}
        onCustomBaseValueChange={this.props.setBaseValue}
        onCustomModifierValueChange={this.props.setModifierValue}
        onCustomLossValueChange={this.props.setLossValue}
        show_statistics={false}
        onTypeChange={this.props.changeType}
        onImageChange={this.props.changeImage}
        onModeChange={this.props.changeMode}
      />
    )
  }
}

const mapStateToProps = (state: AppState) => ({
  units: state.units.definitions,
  global_stats: state.global_stats,
  unit_types: mergeUnitTypes(state),
  terrain_types: filterTerrainTypes(state),
  mode: state.settings.mode
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
  changeImage: (army: ArmyName, type: UnitType, image: string) => dispatch(changeImage(army, type, image)),
  changeMode: (army: ArmyName, type: UnitType, mode: DefinitionType) => dispatch(changeMode(army, type, mode))
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
  army: ArmyName | null
  unit: UnitType | null
  changeType: (army: ArmyName, old_type: UnitType, new_type: UnitType) => void
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalUnitDetail)
