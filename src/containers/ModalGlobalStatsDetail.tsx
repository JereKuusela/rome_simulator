import React, { Component } from 'react'
import { connect } from 'react-redux'
import { UnitType, setGlobalValue, ArmyName, ValueType, UnitDefinition } from '../store/units'
import { AppState } from '../store/'
import { ValuesType, DefinitionType } from '../base_definition'
import { mergeUnitTypes, filterTerrainTypes } from '../utils'
import UnitDetail from '../components/UnitDetail'

const CUSTOM_VALUE_KEY = 'Global'

class ModalGlobalStatsDetail extends Component<IProps> {
  render(): JSX.Element | null {
    if (!this.props.army || this.props.unit)
      return null
    return (
      <UnitDetail
        mode={this.props.mode}
        name={this.props.army}
        terrain_types={this.props.terrain_types}
        custom_value_key={CUSTOM_VALUE_KEY}
        unit={this.props.global_stats.getIn([this.props.army, this.props.mode])}
        units={this.props.units}
        unit_types={this.props.unit_types}
        onCustomBaseValueChange={this.setGlobalBaseValue}
        onCustomModifierValueChange={this.setGlobalModifierValue}
        onCustomLossValueChange={this.setGlobalLossValue}
        show_statistics={false}
      />
    )
  }

  setGlobalBaseValue = (army: ArmyName, _: UnitType, key: string, attribute: ValueType, value: number) => {
    !Number.isNaN(value) && this.props.setGlobalValue(army, this.props.mode, ValuesType.Base, key, attribute, value)
  }

  setGlobalModifierValue = (army: ArmyName, _: UnitType, key: string, attribute: ValueType, value: number) => {
    !Number.isNaN(value) && this.props.setGlobalValue(army, this.props.mode, ValuesType.Modifier, key, attribute, value)
  }

  setGlobalLossValue = (army: ArmyName, _: UnitType, key: string, attribute: ValueType, value: number) => {
    !Number.isNaN(value) && this.props.setGlobalValue(army, this.props.mode, ValuesType.Loss, key, attribute, value)
  }
}

const mapStateToProps = (state: AppState) => ({
  global_stats: state.global_stats,
  terrain_types: filterTerrainTypes(state),
  units: state.units.definitions,
  unit_types: mergeUnitTypes(state),
  mode: state.settings.mode
})

const mapDispatchToProps = (dispatch: any) => ({
  setGlobalValue: (army: ArmyName, mode: DefinitionType, type: ValuesType, key: string, attribute: ValueType, value: number) => (
    dispatch(setGlobalValue(army, mode, type, key, attribute, value))
  )
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
  army: ArmyName | null
  unit: UnitType | null
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalGlobalStatsDetail)
