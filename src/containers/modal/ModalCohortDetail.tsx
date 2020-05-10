import React, { Component } from 'react'
import { connect } from 'react-redux'

import ItemRemover from 'components/ItemRemover'
import UnitDetail from 'components/UnitDetail'

import { AppState, filterTerrainTypes, findCohortById, getCombatUnitForEachRound, getMode, getSiteSettings } from 'state'
import { ValuesType, CountryName, UnitType, Cohort, UnitAttribute, UnitValueType, CombatCohort, ModalType, SiteSettings, ArmyName } from 'types'
import { addValues } from 'definition_values'
import { editCohort, deleteCohort, setCohortValue, changeCohortType, toggleCohortLoyality, closeModal } from 'reducers'
import { applyDynamicAttributes } from 'managers/units'
import BaseModal from './BaseModal'
import { toArr } from 'utils'
const CUSTOM_VALUE_KEY = 'Unit'

class ModalCohortDetail extends Component<IProps> {

  render() {
    const { mode, unitTypes, terrainTypes, cohort, settings } = this.props
    if (!cohort)
      return null
    return (
      <BaseModal basic type={ModalType.CohortDetail}>
        <ItemRemover onRemove={this.removeUnit} />
        <UnitDetail
          mode={mode}
          settings={settings}
          terrainTypes={terrainTypes}
          customValueKey={CUSTOM_VALUE_KEY}
          unit={cohort}
          unitTypes={unitTypes}
          unitTypesAsDropdown={true}
          onTypeChange={this.changeType}
          onCustomBaseValueChange={this.setBaseValue}
          onCustomModifierValueChange={this.setModifierValue}
          onCustomLossModifierValueChange={this.setLossModifierValue}
          onIsLoyalToggle={this.toggleIsLoyal}
          showStatistics={true}
          disableBaseValues={true}
        />
      </BaseModal>
    )
  }

  removeUnit = () => {
    const { id, countryName, armyName, deleteCohort, closeModal } = this.props
    deleteCohort(countryName, armyName, id)
    closeModal()
  }

  setBaseValue = (key: string, attribute: UnitValueType, value: number) => {
    const { countryName, id, armyName, setCohortValue } = this.props
    setCohortValue(countryName, armyName, id, ValuesType.Base, key, attribute, value)
  }

  setModifierValue = (key: string, attribute: UnitValueType, value: number) => {
    const { countryName, id, armyName, setCohortValue } = this.props
    setCohortValue(countryName, armyName, id, ValuesType.Modifier, key, attribute, value)
  }

  setLossModifierValue = (key: string, attribute: UnitValueType, value: number) => {
    const { countryName, id, armyName, setCohortValue } = this.props
    setCohortValue(countryName, armyName, id, ValuesType.LossModifier, key, attribute, value)

  }

  changeType = (type: UnitType) => {
    const { countryName, id, armyName, changeCohortType } = this.props
    changeCohortType(countryName, armyName, id, type)
  }

  toggleIsLoyal = () => {
    const { countryName, id, armyName, toggleCohortLoyality } = this.props
    toggleCohortLoyality(countryName, armyName, id)
  }
}


const convertCohort = (settings: SiteSettings, definition: Cohort | null, rounds: (CombatCohort | null)[]): Cohort | null => {
  if (!definition)
    return null
  rounds.forEach((combat, round) => {
    if (!combat)
      return
    const lossValues: [string, number][] = [
      [UnitAttribute.Morale, combat.state.moraleLoss],
      [UnitAttribute.Strength, combat.state.strengthLoss]
    ]
    const dealtValues: [string, number][] = [
      [UnitAttribute.MoraleDepleted, combat.state.moraleDealt],
      [UnitAttribute.StrengthDepleted, combat.state.strengthDealt]
    ]
    definition = addValues(definition!, ValuesType.Loss, 'Round ' + (round - 1), lossValues)
    definition = addValues(definition!, ValuesType.Base, 'Round ' + (round - 1), dealtValues)

  })
  return applyDynamicAttributes(definition, settings)
}

const mapStateToProps = (state: AppState) => {
  const data = state.ui.modals[ModalType.CohortDetail]
  const settings = getSiteSettings(state)
  const mode = getMode(state)
  if (data) {
    const result = findCohortById(state, data.side, data.id)
    if (result) {
      const [countryName, armyName, cohort] = result
      return {
        id: data.id,
        terrainTypes: filterTerrainTypes(state),
        countryName,
        armyName,
        unitTypes: toArr(state.countries[CountryName.Country1].units, unit => unit.type),
        mode,
        cohort: convertCohort(settings, cohort, getCombatUnitForEachRound(state, data.side, data.id)),
        settings
      }

    }
  }
  return {
    id: 0,
    terrainTypes: filterTerrainTypes(state),
    countryName: CountryName.Country1,
    armyName: ArmyName.Army,
    mode,
    settings,
    cohort: null,
    unitTypes: [],
  }
}

const actions = { editCohort, deleteCohort, setCohortValue, changeCohortType, toggleCohortLoyality, closeModal }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends S, D { }

export default connect(mapStateToProps, actions)(ModalCohortDetail)
