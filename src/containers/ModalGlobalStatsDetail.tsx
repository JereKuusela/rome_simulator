import React, { Component } from 'react'
import { connect } from 'react-redux'
import { UnitType, setGlobalValue, ValueType } from '../store/units'
import { AppState } from '../store/'
import { ValuesType, DefinitionType } from '../base_definition'
import { mergeUnitTypes, filterTerrainTypes } from '../store/utils'
import { CountryName } from '../store/countries'
import { invalidateCountry } from '../store/battle'
import UnitDetail from '../components/UnitDetail'

const CUSTOM_VALUE_KEY = 'Global'

class ModalGlobalStatsDetail extends Component<IProps> {
  render(): JSX.Element | null {
    if (!this.props.country || this.props.unit)
      return null
    return (
      <UnitDetail
        mode={this.props.mode}
        name={this.props.country}
        terrain_types={this.props.terrain_types}
        custom_value_key={CUSTOM_VALUE_KEY}
        unit={this.props.global_stats.getIn([this.props.country, this.props.mode])}
        unit_types={this.props.unit_types}
        onCustomBaseValueChange={this.setGlobalBaseValue}
        onCustomModifierValueChange={this.setGlobalModifierValue}
        onCustomLossValueChange={this.setGlobalLossValue}
        show_statistics={false}
      />
    )
  }

  setGlobalBaseValue = (key: string, attribute: ValueType, value: number) => {
    !Number.isNaN(value) && this.props.country && this.props.setGlobalValue(this.props.country, this.props.mode, ValuesType.Base, key, attribute, value)
  }

  setGlobalModifierValue = (key: string, attribute: ValueType, value: number) => {
    !Number.isNaN(value) && this.props.country && this.props.setGlobalValue(this.props.country, this.props.mode, ValuesType.Modifier, key, attribute, value)
  }

  setGlobalLossValue = (key: string, attribute: ValueType, value: number) => {
    !Number.isNaN(value) && this.props.country && this.props.setGlobalValue(this.props.country, this.props.mode, ValuesType.Loss, key, attribute, value)
  }
}

const mapStateToProps = (state: AppState) => ({
  global_stats: state.global_stats,
  terrain_types: filterTerrainTypes(state),
  unit_types: mergeUnitTypes(state),
  mode: state.settings.mode
})

const mapDispatchToProps = (dispatch: any) => ({
  setGlobalValue: (country: CountryName, mode: DefinitionType, type: ValuesType, key: string, attribute: ValueType, value: number) => (
    dispatch(setGlobalValue(country, mode, type, key, attribute, value)) && dispatch(invalidateCountry(country))
  )
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
  country: CountryName | null
  unit: UnitType | null
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalGlobalStatsDetail)
