import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Modal } from 'semantic-ui-react'

import ItemRemover from '../components/ItemRemover'
import UnitDetail from '../components/UnitDetail'

import { AppState } from '../store/'
import { UnitType, ValueType, BaseUnit, Unit } from '../store/units'
import { editUnit, removeUnit } from '../store/battle'
import { CountryName } from '../store/countries'
import { filterTerrainTypes, filterUnitTypesByCountry } from '../store/utils'

import { addValues, ValuesType } from '../base_definition'
import { invalidateCountry } from '../store/battle'

const CUSTOM_VALUE_KEY = 'Unit'

interface Props {
  info: ModalInfo | null
  onClose: () => void
}

export interface ModalInfo {
  readonly country: CountryName
  readonly unit: Unit
  readonly base_unit: BaseUnit
}

class ModalArmyUnitDetail extends Component<IProps> {

  render() {
    const { info, onClose, mode, unit_types, terrain_types } = this.props
    if (!info)
      return null
    const { unit } = info
    return (
      <Modal basic onClose={onClose} open>
        <Modal.Content>
          <ItemRemover onRemove={this.removeUnit} />
          <UnitDetail
            mode={mode}
            terrain_types={terrain_types}
            custom_value_key={CUSTOM_VALUE_KEY}
            unit={unit}
            unit_types={unit_types}
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

  removeUnit = () => {
    const { mode } = this.props
    const { base_unit, country } = this.props.info!
    this.props.removeUnit(mode, country, base_unit)
    this.props.invalidateCountry(country)
    this.props.onClose()
  }

  setBaseValue = (key: string, attribute: ValueType, value: number) => {
    const { base_unit, country } = this.props.info!
    const unit = addValues(base_unit, ValuesType.Base, key, [[attribute, value]])
    this.edit(unit, country)
  }

  setModifierValue = (key: string, attribute: ValueType, value: number) => {
    const { base_unit, country } = this.props.info!
    const unit = addValues(base_unit, ValuesType.Modifier, key, [[attribute, value]])
    this.edit(unit, country)
  }

  setLossValue = (key: string, attribute: ValueType, value: number) => {
    const { base_unit, country } = this.props.info!
    const unit = addValues(base_unit, ValuesType.Loss, key, [[attribute, value]])
    this.edit(unit, country)
  }

  edit = (unit: BaseUnit, country: CountryName) => {
    const { mode } = this.props
    this.props.editUnit(mode, country, unit)
    this.props.invalidateCountry(country)
  }

  changeType = (type: UnitType) => {
    const { base_unit, country } = this.props.info!
    const unit = { ...base_unit, type }
    this.edit(unit, country)
  }
}

const mapStateToProps = (state: AppState, props: Props) => ({
  unit_types: filterUnitTypesByCountry(state, props.info! && props.info!.country),
  global_stats: state.global_stats,
  terrain_types: filterTerrainTypes(state),
  mode: state.settings.mode
})

const actions = { editUnit, removeUnit, invalidateCountry }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends Props, S, D { }

export default connect(mapStateToProps, actions)(ModalArmyUnitDetail)
