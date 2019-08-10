import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Modal } from 'semantic-ui-react'
import { UnitType, ValueType, Unit, UnitDefinition } from '../store/units'
import { editUnit, removeUnit } from '../store/battle'
import { AppState } from '../store/'
import { filterTerrainTypes, mergeUnitTypes } from '../store/utils'
import { addValues, ValuesType, DefinitionType } from '../base_definition'
import ItemRemover from '../components/ItemRemover'
import UnitDetail from '../components/UnitDetail'
import { invalidateCountry } from '../store/battle'
import { CountryName } from '../store/countries'

const CUSTOM_VALUE_KEY = 'Unit'

export interface ModalInfo {
  readonly country: CountryName
  readonly current_unit: Unit & UnitDefinition
  readonly base_unit: Unit
}

class ModalArmyUnitDetail extends Component<IProps> {

  unit: Unit = undefined!

  render(): JSX.Element | null {
    if (!this.props.info)
      return null
    const country = this.props.info.country
    return (
      <Modal basic onClose={this.props.onClose} open>
        <Modal.Content>
          <ItemRemover
            onClose={this.props.onClose}
            onRemove={this.removeUnit}
          />
          <UnitDetail
            mode={this.props.mode}
            name={country}
            terrain_types={this.props.terrain_types}
            custom_value_key={CUSTOM_VALUE_KEY}
            unit={this.props.info.current_unit}
            units={this.props.units}
            unit_types={this.props.unit_types}
            unit_types_as_dropdown={true}
            onTypeChange={this.changeType}
            onCustomBaseValueChange={this.setBaseValue}
            onCustomModifierValueChange={this.setModifierValue}
            onCustomLossValueChange={this.setLossValue}
            show_statistics={true}
          />
        </Modal.Content>
      </Modal>
    )
  }

  removeUnit = (): void => (
    this.props.info && 
    this.props.removeUnit(this.props.mode, this.props.info.country, this.props.info.base_unit)
  )

  setBaseValue = (country: CountryName, _type: UnitType, key: string, attribute: ValueType, value: number): void => {
    if (!this.props.info)
      return
    const unit = addValues(this.props.info.base_unit, ValuesType.Base, key, [[attribute, value]])
    this.props.editUnit(this.props.mode, country, unit)
  }

  setModifierValue = (country: CountryName, _type: UnitType, key: string, attribute: ValueType, value: number): void => {
    if (!this.props.info)
      return
    const unit = addValues(this.props.info.base_unit, ValuesType.Modifier, key, [[attribute, value]])
    this.props.editUnit(this.props.mode, country, unit)
  }

  setLossValue = (country: CountryName, _type: UnitType, key: string, attribute: ValueType, value: number): void => {
    if (!this.props.info)
      return
    const unit = addValues(this.props.info.base_unit, ValuesType.Loss, key, [[attribute, value]])
    this.props.editUnit(this.props.mode, country, unit)
  }

  changeType = (country: CountryName, _old_type: UnitType, new_type: UnitType): void => {
    if (!this.props.info)
      return
    const unit = { ...this.props.info.base_unit, type: new_type }
    this.props.editUnit(this.props.mode, country, unit)
  }
}

const mapStateToProps = (state: AppState) => ({
  units: state.units,
  unit_types: mergeUnitTypes(state),
  global_stats: state.global_stats,
  terrain_types: filterTerrainTypes(state),
  mode: state.settings.mode
})

const mapDispatchToProps = (dispatch: any) => ({
  editUnit: (mode: DefinitionType, country: CountryName, unit: Unit) => (
    dispatch(editUnit(mode, country, unit)) && dispatch(invalidateCountry(country))
  ),
  removeUnit: (mode: DefinitionType, country: CountryName, unit: Unit) => (
    dispatch(removeUnit(mode, country, unit)) && dispatch(invalidateCountry(country))
  )
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
  info: ModalInfo | null
  onClose: () => void
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalArmyUnitDetail)
