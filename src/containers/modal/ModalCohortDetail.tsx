import React, { Component } from 'react'
import { connect } from 'react-redux'

import ItemRemover from 'components/ItemRemover'
import UnitDetail from 'components/UnitDetail'

import { AppState, filterTerrainTypes, findCohortById, getCombatUnitForEachRound, getMode, getCombatParticipant, getSiteSettings, getParticipant } from 'state'
import { ValuesType, CountryName, UnitType, Cohort, UnitAttribute, UnitValueType, CombatCohort, ModalType, SiteSettings, ArmyName } from 'types'
import { addValues } from 'definition_values'
import { editCohort, deleteCohort, setCohortValue, changeCohortType, toggleCohortLoyality, closeModal } from 'reducers'
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
    const { id, country, army, deleteCohort, closeModal } = this.props
    deleteCohort(country, army, id)
    closeModal()
  }

  setBaseValue = (key: string, attribute: UnitValueType, value: number) => {
    const { country, id, army, setCohortValue } = this.props
    setCohortValue(country, army, id, ValuesType.Base, key, attribute, value)
  }

  setModifierValue = (key: string, attribute: UnitValueType, value: number) => {
    const { country, id, army, setCohortValue } = this.props
    setCohortValue(country, army, id, ValuesType.Modifier, key, attribute, value)
  }

  setLossModifierValue = (key: string, attribute: UnitValueType, value: number) => {
    const { country, id, army, setCohortValue } = this.props
    setCohortValue(country, army, id, ValuesType.LossModifier, key, attribute, value)

  }

  changeType = (type: UnitType) => {
    const { country, id, army, changeCohortType } = this.props
    changeCohortType(country, army, id, type)
  }

  toggleIsLoyal = () => {
    const { country, id, army, toggleCohortLoyality } = this.props
    toggleCohortLoyality(country, army, id)
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
  const data = state.ui.modals[ModalType.CohortDetail]
  const settings = getSiteSettings(state)
  const mode = getMode(state)
  if (data) {
    const participant = getParticipant(state, data.side)
    return {
      id: data.id,
      terrain_types: filterTerrainTypes(state),
      country: participant.country,
      army: participant.army,
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
    army: ArmyName.Army,
    mode,
    settings,
    cohort: null,
    unit_types: [],
  }
}

const actions = { editCohort, deleteCohort, setCohortValue, changeCohortType, toggleCohortLoyality, closeModal }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends S, D { }

export default connect(mapStateToProps, actions)(ModalCohortDetail)
