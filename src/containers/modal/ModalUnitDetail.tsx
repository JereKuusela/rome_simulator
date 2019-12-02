import React, { Component } from 'react'
import { connect } from 'react-redux'
import { UnitType, ValueType, setValue, changeImage, changeMode, Unit, toggleIsFlank, toggleCanAssault, toggleIsLoyal } from '../../store/units'
import { AppState } from '../../store/'
import { CountryName } from '../../store/countries'
import { ValuesType, mergeValues, DefinitionType } from '../../base_definition'
import UnitDetail from '../../components/UnitDetail'
import { invalidateCountry } from '../../store/battle'
import { mergeUnitTypes, filterTerrainTypes } from '../../store/utils'

const CUSTOM_VALUE_KEY = 'Custom'

class ModalUnitDetail extends Component<IProps> {
  render(): JSX.Element | null {
    if (!this.props.country || !this.props.unit)
      return null
    const country = this.props.country
    const definition = this.props.units[this.props.country][this.props.unit]
    const unit = mergeValues(definition, this.props.global_stats[this.props.country][this.props.mode])
    const type = unit.type
    return (
      <UnitDetail
        mode={this.props.mode}
        terrain_types={this.props.terrain_types}
        custom_value_key={CUSTOM_VALUE_KEY}
        unit={unit as Unit}
        unit_types={this.props.unit_types}
        onCustomBaseValueChange={(key, attribute, value) => this.props.setBaseValue(country, type, key, attribute, value)}
        onCustomModifierValueChange={(key, attribute, value) => this.props.setModifierValue(country, type, key, attribute, value)}
        onCustomLossValueChange={(key, attribute, value) => this.props.setLossValue(country, type, key, attribute, value)}
        show_statistics={false}
        onTypeChange={new_type => this.props.changeType(country, type, new_type)}
        onImageChange={image => this.props.changeImage(country, type, image)}
        onModeChange={mode => this.props.changeMode(country, type, mode)}
        onCanAssaultToggle={() => this.props.toggleCanAssault(country, type)}
        onIsFlankToggle={() => this.props.toggleIsFlank(country, type)}
        onIsLoyalToggle={() => this.props.toggleIsLoyal(country, type)}
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
  changeMode: (country: CountryName, type: UnitType, mode: DefinitionType) => dispatch(changeMode(country, type, mode)),
  toggleIsFlank: (country: CountryName, type: UnitType) => dispatch(toggleIsFlank(country, type)),
  toggleCanAssault: (country: CountryName, type: UnitType) => dispatch(toggleCanAssault(country, type)),
  toggleIsLoyal: (country: CountryName, type: UnitType) => dispatch(toggleIsLoyal(country, type)) && dispatch(invalidateCountry(country))
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
  country: CountryName | null
  unit: UnitType | null
  changeType: (country: CountryName, old_type: UnitType, new_type: UnitType) => void
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalUnitDetail)