import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Modal } from 'semantic-ui-react'
import { UnitType, ValueType, BaseUnit, Unit } from '../store/units'
import { editUnit, removeUnit } from '../store/battle'
import { AppState } from '../store/'
import { filterTerrainTypes, mergeUnitTypes } from '../store/utils'
import { addValues, ValuesType, Mode } from '../base_definition'
import ItemRemover from '../components/ItemRemover'
import UnitDetail from '../components/UnitDetail'
import { invalidateCountry } from '../store/battle'
import { CountryName } from '../store/countries'

const CUSTOM_VALUE_KEY = 'Unit'

export interface ModalInfo {
  readonly country: CountryName
  readonly unit: Unit
  readonly base_unit: BaseUnit
}

class ModalArmyUnitDetail extends Component<IProps> {

  render(): JSX.Element | null {
    if (!this.props.info)
      return null
    return (
      <Modal basic onClose={this.props.onClose} open>
        <Modal.Content>
          <ItemRemover
            onClose={this.props.onClose}
            onRemove={this.removeUnit}
          />
          <UnitDetail
            mode={this.props.mode}
            terrain_types={this.props.terrain_types}
            custom_value_key={CUSTOM_VALUE_KEY}
            unit={this.props.info.unit}
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

  setBaseValue = (key: string, attribute: ValueType, value: number): void => {
    if (!this.props.info)
      return
    const unit = addValues(this.props.info.base_unit, ValuesType.Base, key, [[attribute, value]])
    this.props.editUnit(this.props.mode, this.props.info.country, unit)
  }

  setModifierValue = (key: string, attribute: ValueType, value: number): void => {
    if (!this.props.info)
      return
    const unit = addValues(this.props.info.base_unit, ValuesType.Modifier, key, [[attribute, value]])
    this.props.editUnit(this.props.mode, this.props.info.country, unit)
  }

  setLossValue = (key: string, attribute: ValueType, value: number): void => {
    if (!this.props.info)
      return
    const unit = addValues(this.props.info.base_unit, ValuesType.Loss, key, [[attribute, value]])
    this.props.editUnit(this.props.mode, this.props.info.country, unit)
  }

  changeType = (new_type: UnitType): void => {
    if (!this.props.info)
      return
    const unit = { ...this.props.info.base_unit, type: new_type }
    this.props.editUnit(this.props.mode, this.props.info.country, unit)
  }
}

const mapStateToProps = (state: AppState) => ({
  unit_types: mergeUnitTypes(state),
  global_stats: state.global_stats,
  terrain_types: filterTerrainTypes(state),
  mode: state.settings.mode
})

const mapDispatchToProps = (dispatch: any) => ({
  editUnit: (mode: Mode, country: CountryName, unit: BaseUnit) => (
    dispatch(editUnit(mode, country, unit)) && dispatch(invalidateCountry(country))
  ),
  removeUnit: (mode: Mode, country: CountryName, unit: BaseUnit) => (
    dispatch(removeUnit(mode, country, unit)) && dispatch(invalidateCountry(country))
  )
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
  info: ModalInfo | null
  onClose: () => void
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalArmyUnitDetail)
