import React, { Component } from 'react'
import { connect } from 'react-redux'
import { ValuesType, CountryName, UnitType, Cohort, UnitRole, UnitValueType, ModalType } from 'types'
import UnitDetail from 'components/UnitDetail'
import { AppState, getUnit, filterTerrainTypes, getMode, getUnitTypeList, getSiteSettings } from 'state'
import { openModal, changeUnitType, deleteUnit, setUnitValue, changeUnitImage, changeParent, changeUnitDeployment, toggleUnitLoyality, invalidate, closeModal } from 'reducers'
import BaseModal from './BaseModal'
import { getRootParent } from 'managers/units'
import ItemRemover from 'components/ItemRemover'

const CUSTOM_VALUE_KEY = 'Custom'

class ModalUnitDetail extends Component<IProps> {
  render() {
    const { mode, unit, settings, remove, unit_type, unit_types_with_parent, terrain_types, unit_types } = this.props
    if (!unit)
      return null
    return (
      <BaseModal basic type={ModalType.UnitDetail}>
        {
          remove && unit_type !== getRootParent(mode) ?
            <ItemRemover
              onRemove={this.remove}
              confirm_remove={true}
              item={'item definition ' + unit_type}
            />
            : null
        }
        <UnitDetail
          mode={mode}
          settings={settings}
          terrain_types={terrain_types}
          custom_value_key={CUSTOM_VALUE_KEY}
          unit={unit as Cohort}
          unit_types={unit_types}
          unit_types_with_parent={unit_types_with_parent}
          onCustomBaseValueChange={this.setBaseValue}
          onCustomModifierValueChange={this.setModifierValue}
          onCustomLossModifierValueChange={this.setLossModifierValue}
          show_statistics={false}
          onTypeChange={this.changeType}
          onImageChange={this.changeImage}
          onParentChange={this.changeParent}
          onChangeDeployment={this.changeDeployment}
          onIsLoyalToggle={this.toggleIsLoyal}
        />
      </BaseModal>
    )
  }

  changeType = (type: UnitType) => {
    const { country, changeUnitType, invalidate, unit_type, openModal } = this.props
    changeUnitType(country, unit_type, type)
    openModal(ModalType.UnitDetail, { country, type })
    invalidate()
  }

  remove = () => {
    const { country, deleteUnit, invalidate, unit_type, closeModal } = this.props
    deleteUnit(country, unit_type)
    closeModal()
    invalidate()
  }

  setBaseValue = (key: string, attribute: UnitValueType, value: number) => this.setValue(ValuesType.Base, key, attribute, value)
  setModifierValue = (key: string, attribute: UnitValueType, value: number) => this.setValue(ValuesType.Modifier, key, attribute, value)
  setLossModifierValue = (key: string, attribute: UnitValueType, value: number) => this.setValue(ValuesType.LossModifier, key, attribute, value)

  setValue = (type: ValuesType, key: string, attribute: UnitValueType, value: number) => {
    const { setUnitValue, invalidate, unit_type, country } = this.props
    setUnitValue(country!, unit_type!, type, key, attribute, value)
    invalidate()
  }

  changeImage = (image: string) => {
    const { changeUnitImage, invalidate, unit_type, country } = this.props
    changeUnitImage(country!, unit_type, image)
    invalidate()
  }

  changeParent = (type: UnitType) => {
    const { changeParent, invalidate, unit_type, country } = this.props
    changeParent(country!, unit_type, type)
    invalidate()
  }

  changeDeployment = (deployment: UnitRole) => {
    const { changeUnitDeployment, invalidate, unit_type, country } = this.props
    changeUnitDeployment(country!, unit_type, deployment)
    invalidate()
  }

  toggleIsLoyal = () => {
    const { toggleUnitLoyality, invalidate, unit_type, country } = this.props
    toggleUnitLoyality(country!, unit_type)
    invalidate()
  }
}

const mapStateToProps = (state: AppState) => {
  const data = state.ui[ModalType.UnitDetail]
  return {
    remove: data?.remove,
    country: data ? data.country : CountryName.Country1,
    unit_type: data ? data.type : UnitType.Land,
    unit: data ? getUnit(state, data.type, data.country) : null,
    unit_types: getUnitTypeList(state, true, data?.country),
    unit_types_with_parent: getUnitTypeList(state, false, data?.country).filter(type => type !== data?.type),
    terrain_types: filterTerrainTypes(state),
    mode: getMode(state),
    settings: getSiteSettings(state)
  }
}

const actions = { closeModal, openModal, deleteUnit, changeUnitType, setUnitValue, changeUnitImage, changeParent, changeUnitDeployment, toggleUnitLoyality, invalidate }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends S, D { }

export default connect(mapStateToProps, actions)(ModalUnitDetail)
