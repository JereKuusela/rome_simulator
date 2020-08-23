import React, { Component } from 'react'
import { connect } from 'react-redux'
import { ValuesType, CountryName, UnitType, CohortDefinition, UnitRole, UnitValueType, ModalType, ArmyName } from 'types'
import UnitDetail from 'components/UnitDetail'
import { AppState, getUnitDefinition, getTerrainTypes, getMode, getUnitTypeList, getSiteSettings } from 'state'
import { openModal, changeUnitType, deleteUnit, setUnitValue, changeUnitImage, changeParent, changeUnitDeployment, toggleUnitLoyality, closeModal } from 'reducers'
import BaseModal from './BaseModal'
import { getRootParent } from 'managers/units'
import ItemRemover from 'components/ItemRemover'

const CUSTOM_VALUE_KEY = 'Custom'

class ModalUnitDetail extends Component<IProps> {
  render() {
    const { mode, unit, settings, remove, unitType, unitTypesWithParent, terrainTypes, unitTypes } = this.props
    if (!unit)
      return null
    return (
      <BaseModal basic type={ModalType.UnitDetail}>
        {
          remove && unitType !== getRootParent(mode) ?
            <ItemRemover onRemove={this.remove} />
            : null
        }
        <UnitDetail
          mode={mode}
          settings={settings}
          terrainTypes={terrainTypes}
          customValueKey={CUSTOM_VALUE_KEY}
          unit={unit as CohortDefinition}
          unitTypes={unitTypes}
          unitTypesWithParent={unitTypesWithParent}
          onCustomBaseValueChange={this.setBaseValue}
          onCustomModifierValueChange={this.setModifierValue}
          onCustomLossModifierValueChange={this.setLossModifierValue}
          showStatistics={false}
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
    const { country, army, changeUnitType, unitType, openModal } = this.props
    changeUnitType(country, unitType, type)
    openModal(ModalType.UnitDetail, { country, army, type })
  }

  remove = () => {
    const { country, deleteUnit, unitType, closeModal } = this.props
    deleteUnit(country, unitType)
    closeModal()
  }

  setBaseValue = (key: string, attribute: UnitValueType, value: number) => this.setValue(ValuesType.Base, key, attribute, value)
  setModifierValue = (key: string, attribute: UnitValueType, value: number) => this.setValue(ValuesType.Modifier, key, attribute, value)
  setLossModifierValue = (key: string, attribute: UnitValueType, value: number) => this.setValue(ValuesType.LossModifier, key, attribute, value)

  setValue = (type: ValuesType, key: string, attribute: UnitValueType, value: number) => {
    const { setUnitValue, unitType, country } = this.props
    setUnitValue(country!, unitType, type, key, attribute, value)
  }

  changeImage = (image: string) => {
    const { changeUnitImage, unitType, country } = this.props
    changeUnitImage(country!, unitType, image)
  }

  changeParent = (type: UnitType) => {
    const { changeParent, unitType, country } = this.props
    changeParent(country!, unitType, type)
  }

  changeDeployment = (deployment: UnitRole) => {
    const { changeUnitDeployment, unitType, country } = this.props
    changeUnitDeployment(country!, unitType, deployment)
  }

  toggleIsLoyal = () => {
    const { toggleUnitLoyality, unitType, country } = this.props
    toggleUnitLoyality(country!, unitType)
  }
}

const mapStateToProps = (state: AppState) => {
  const data = state.ui.modals[ModalType.UnitDetail]
  return {
    remove: data?.remove,
    country: data ? data.country : CountryName.Country1,
    army: data ? data.army : ArmyName.Army,
    unitType: data ? data.type : UnitType.Land,
    unit: data ? getUnitDefinition(state, data.type, data.country) : null,
    unitTypes: getUnitTypeList(state, true, data?.country),
    unitTypesWithParent: getUnitTypeList(state, false, data?.country).filter(type => type !== data?.type),
    terrainTypes: getTerrainTypes(state),
    mode: getMode(state),
    settings: getSiteSettings(state)
  }
}

const actions = { closeModal, openModal, deleteUnit, changeUnitType, setUnitValue, changeUnitImage, changeParent, changeUnitDeployment, toggleUnitLoyality }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends S, D { }

export default connect(mapStateToProps, actions)(ModalUnitDetail)
