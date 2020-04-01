import React, { Component } from 'react'
import { connect } from 'react-redux'

import ItemRemover from 'components/ItemRemover'
import UnitDetail from 'components/UnitDetail'

import { AppState, filterTerrainTypes, findCohortById, getCombatUnitForEachRound, getMode, getCombatParticipant, getSiteSettings, getCountryName } from 'state'
import { ValuesType, CountryName, UnitType, Cohort, UnitAttribute, UnitValueType, CombatCohort, ModalType, SiteSettings } from 'types'
import { addValues } from 'definition_values'
import { editCohort, deleteCohort, invalidate, setCohortValue, changeCohortType, toggleCohortLoyality, closeModal } from 'reducers'
import { applyDynamicAttributes } from 'managers/units'
import BaseModal from './BaseModal'
import { getActualUnits } from 'managers/army'
const CUSTOM_VALUE_KEY = 'Unit'

class ModalCohortDetail extends Component<IProps> {

  render() {
    const { mode, unit_types, terrain_types, cohort, settings } = this.props
    if (!cohort)
      return null
    return (
      <BaseModal basic type={ModalType.CohortDetail}>
        <ItemRemover onRemove={this.removeUnit} />
        <UnitDetail
          mode={mode}
          settings={settings}
          terrain_types={terrain_types}
          custom_value_key={CUSTOM_VALUE_KEY}
          unit={cohort}
          unit_types={unit_types}
          unit_types_as_dropdown={true}
          onTypeChange={this.changeType}
          onCustomBaseValueChange={this.setBaseValue}
          onCustomModifierValueChange={this.setModifierValue}
          onCustomLossModifierValueChange={this.setLossModifierValue}
          onIsLoyalToggle={this.toggleIsLoyal}
          show_statistics={true}
          disable_base_values={true}
        />
      </BaseModal>
    )
  }

  removeUnit = () => {
    const { id, country, deleteCohort, invalidate, closeModal } = this.props
    deleteCohort(country, id)
    invalidate()
    closeModal(ModalType.CohortDetail)
  }

  setBaseValue = (key: string, attribute: UnitValueType, value: number) => {
    const { country, id, setCohortValue, invalidate } = this.props
    setCohortValue(country, id, ValuesType.Base, key, attribute, value)
    invalidate()
  }

  setModifierValue = (key: string, attribute: UnitValueType, value: number) => {
    const { country, id, setCohortValue, invalidate } = this.props
    setCohortValue(country, id, ValuesType.Modifier, key, attribute, value)
    invalidate()
  }

  setLossModifierValue = (key: string, attribute: UnitValueType, value: number) => {
    const { country, id, setCohortValue, invalidate } = this.props
    setCohortValue(country, id, ValuesType.LossModifier, key, attribute, value)
    invalidate()
  }

  changeType = (type: UnitType) => {
    const { country, id, changeCohortType, invalidate } = this.props
    changeCohortType(country, id, type)
    invalidate()
  }

  toggleIsLoyal = () => {
    const { country, id, toggleCohortLoyality, invalidate } = this.props
    toggleCohortLoyality(country, id)
    invalidate()
  }
}


const convertCohort = (settings: SiteSettings, definition: Cohort | null, rounds: (CombatCohort | null)[]): Cohort | null => {
  if (!definition)
    return null
  rounds.forEach((combat, round) => {
    if (!combat)
      return
    const lossValues: [string, number][] = [
      [UnitAttribute.Morale, combat.state.morale_loss],
      [UnitAttribute.Strength, combat.state.strength_loss]
    ]
    const dealtValues: [string, number][] = [
      [UnitAttribute.MoraleDepleted, combat.state.morale_dealt],
      [UnitAttribute.StrengthDepleted, combat.state.strength_dealt]
    ]
    definition = addValues(definition!, ValuesType.Loss, 'Round ' + (round - 1), lossValues)
    definition = addValues(definition!, ValuesType.Base, 'Round ' + (round - 1), dealtValues)

  })
  return applyDynamicAttributes(definition, settings)
}

const mapStateToProps = (state: AppState) => {
  const data = state.ui[ModalType.CohortDetail]
  const settings = getSiteSettings(state)
  const mode = getMode(state)
  if (data) {
    return {
      id: data.id,
      terrain_types: filterTerrainTypes(state),
      country: getCountryName(state, data.side),
      unit_types: getActualUnits(getCombatParticipant(state, data.side).unit_types, mode).map(unit => unit.type),
      mode,
      cohort: convertCohort(settings, findCohortById(state, data.side, data.id), getCombatUnitForEachRound(state, data.side, data.id)),
      settings
    }
  }
  return {
    id: 0,
    terrain_types: filterTerrainTypes(state),
    country: CountryName.Country1,
    mode,
    settings,
    cohort: null,
    unit_types: [],
  }
}

const actions = { editCohort, deleteCohort, invalidate, setCohortValue, changeCohortType, toggleCohortLoyality, closeModal }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends S, D { }

export default connect(mapStateToProps, actions)(ModalCohortDetail)
