import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Modal } from 'semantic-ui-react'

import ItemRemover from '../components/ItemRemover'
import UnitDetail from '../components/UnitDetail'

import { AppState } from '../store/'
import { UnitType, ValueType } from '../store/units'
import { editUnit, deleteUnit, setValue, changeType, invalidateCountry, Side } from '../store/battle'
import { CountryName } from '../store/countries'
import { filterTerrainTypes, filterUnitTypesByCountry, findUnit } from '../store/utils'

import { ValuesType } from '../base_definition'

const CUSTOM_VALUE_KEY = 'Unit'

interface Props {
  side: Side
  country: CountryName
  id: number
  onClose: () => void
}

class ModalArmyUnitDetail extends Component<IProps> {

  render() {
    const { onClose, mode, unit_types, terrain_types, unit } = this.props
    if (!unit)
      return null
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
    const { mode, id, country } = this.props
    this.props.deleteUnit(mode, country, id)
    this.props.invalidateCountry(country)
    this.props.onClose()
  }

  setBaseValue = (key: string, attribute: ValueType, value: number) => {
    const { mode, country, id } = this.props
    this.props.setValue(mode, country, id, ValuesType.Base, key, attribute, value)
    this.props.invalidateCountry(country)
  }

  setModifierValue = (key: string, attribute: ValueType, value: number) => {
    const { mode, country, id } = this.props
    this.props.setValue(mode, country, id, ValuesType.Modifier, key, attribute, value)
    this.props.invalidateCountry(country)
  }

  setLossValue = (key: string, attribute: ValueType, value: number) => {
    const { mode, country, id } = this.props
    this.props.setValue(mode, country, id, ValuesType.Loss, key, attribute, value)
    this.props.invalidateCountry(country)
  }

  changeType = (type: UnitType) => {
    const { mode, country, id } = this.props
    this.props.changeType(mode, country, id, type)
    this.props.invalidateCountry(country)
  }
}

const mapStateToProps = (state: AppState, props: Props) => ({
  unit_types: filterUnitTypesByCountry(state, props.country),
  global_stats: state.global_stats,
  terrain_types: filterTerrainTypes(state),
  mode: state.settings.mode,
  unit: findUnit(state, props.side, props.id)
})

const actions = { editUnit, deleteUnit, invalidateCountry, setValue, changeType }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends Props, S, D { }

export default connect(mapStateToProps, actions)(ModalArmyUnitDetail)
