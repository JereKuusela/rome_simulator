import React, { Component } from 'react'
import { connect } from 'react-redux'
import { UnitType, ValueType, setValue, changeImage, changeMode } from '../store/units'
import { AppState } from '../store/'
import { CountryName } from '../store/countries'
import { ValuesType, mergeValues, DefinitionType } from '../base_definition'
import UnitDetail from '../components/UnitDetail'
import { invalidateCountry } from '../store/battle'
import { mergeUnitTypes, filterTerrainTypes } from '../store/utils'

const CUSTOM_VALUE_KEY = 'Custom'

class ModalUnitDetail extends Component<IProps> {
  render(): JSX.Element | null {
    if (!this.props.country || !this.props.unit)
      return null
    return (
      <UnitDetail
        mode={this.props.mode}
        name={this.props.country}
        terrain_types={this.props.terrain_types}
        custom_value_key={CUSTOM_VALUE_KEY}
        unit={mergeValues(this.props.units.getIn([this.props.country, this.props.unit]), this.props.global_stats.getIn([this.props.country, this.props.mode]))}
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
  units: state.units,
  global_stats: state.global_stats,
  unit_types: mergeUnitTypes(state),
  terrain_types: filterTerrainTypes(state),
  mode: state.settings.mode
})

const mapDispatchToProps = (dispatch: any) => ({
  setBaseValue: (country: CountryName, unit: UnitType, key: string, attribute: ValueType, value: number) => (
    !Number.isNaN(value) && dispatch(setValue(country, ValuesType.Base, unit, key, attribute, value)) && dispatch(invalidateCountry(country))
  ),
  setModifierValue: (country: CountryName, unit: UnitType, key: string, attribute: ValueType, value: number) => (
    !Number.isNaN(value) && dispatch(setValue(country, ValuesType.Modifier, unit, key, attribute, value)) && dispatch(invalidateCountry(country))
  ),
  setLossValue: (country: CountryName, unit: UnitType, key: string, attribute: ValueType, value: number) => (
    !Number.isNaN(value) && dispatch(setValue(country, ValuesType.Loss, unit, key, attribute, value)) && dispatch(invalidateCountry(country))
  ),
  changeImage: (country: CountryName, type: UnitType, image: string) => dispatch(changeImage(country, type, image)),
  changeMode: (country: CountryName, type: UnitType, mode: DefinitionType) => dispatch(changeMode(country, type, mode))
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
  country: CountryName | null
  unit: UnitType | null
  changeType: (country: CountryName, old_type: UnitType, new_type: UnitType) => void
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalUnitDetail)
