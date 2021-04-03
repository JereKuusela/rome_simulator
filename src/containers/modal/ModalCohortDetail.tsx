import React, { Component } from 'react'
import { connect } from 'react-redux'

import ItemRemover from 'components/ItemRemover'
import UnitDetail from 'components/UnitDetail'

import type { AppState } from 'reducers'
import {
  ValuesType,
  CountryName,
  UnitType,
  CohortDefinition,
  UnitAttribute,
  UnitValueType,
  Cohort,
  ModalType,
  CombatSharedSettings,
  ArmyName
} from 'types'
import { addValue, addValues } from 'data_values'
import { deleteCohort, setCohortValue, changeCohortType, toggleCohortLoyality, closeModal } from 'reducers'
import { applyDynamicAttributes } from 'managers/units'
import BaseModal from './BaseModal'
import { toArr } from 'utils'
import { getCohortDefinition, getCohortForEachRound, getCombatSettings, getMode, getTerrainTypes } from 'selectors'
const CUSTOM_VALUE_KEY = 'Unit'

class ModalCohortDetail extends Component<IProps> {
  render() {
    const { mode, unitTypes, terrainTypes, cohort, settings } = this.props
    if (!cohort) return null
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
        />
      </BaseModal>
    )
  }

  removeUnit = () => {
    const { index, country, army, deleteCohort, closeModal } = this.props
    deleteCohort(country, army, index)
    closeModal()
  }

  setBaseValue = (key: string, attribute: UnitValueType, value: number) => {
    const { country, index, army, setCohortValue } = this.props
    setCohortValue(country, army, index, ValuesType.Base, key, attribute, value)
  }

  setModifierValue = (key: string, attribute: UnitValueType, value: number) => {
    const { country, index, army, setCohortValue } = this.props
    setCohortValue(country, army, index, ValuesType.Modifier, key, attribute, value)
  }

  setLossModifierValue = (key: string, attribute: UnitValueType, value: number) => {
    const { country, index, army, setCohortValue } = this.props
    setCohortValue(country, army, index, ValuesType.LossModifier, key, attribute, value)
  }

  changeType = (type: UnitType) => {
    const { country, index, army, changeCohortType } = this.props
    changeCohortType(country, army, index, type)
  }

  toggleIsLoyal = () => {
    const { country, index, army, toggleCohortLoyality } = this.props
    toggleCohortLoyality(country, army, index)
  }
}

const convertCohort = (
  settings: CombatSharedSettings,
  definition: CohortDefinition | null,
  rounds: (Cohort | null)[]
): CohortDefinition | null => {
  if (!definition) return null
  rounds.forEach((combat, round) => {
    if (!combat || !definition) return
    const lossValues: [string, number][] = [
      [UnitAttribute.Morale, combat.state.moraleLoss],
      [UnitAttribute.Strength, combat.state.strengthLoss]
    ]
    const dealtValues: [string, number][] = [
      [UnitAttribute.MoraleDepleted, combat.state.moraleDealt],
      [UnitAttribute.StrengthDepleted, combat.state.strengthDealt]
    ]
    definition = addValues(definition, ValuesType.Loss, 'Round ' + round, lossValues)
    definition = addValues(definition, ValuesType.Base, 'Round ' + round, dealtValues)
    if (round === rounds.length - 1) {
      definition = addValue(
        definition,
        ValuesType.Gain,
        'Winning',
        UnitAttribute.Morale,
        combat.properties.winningMoraleBonus
      )
      definition = addValue(
        definition,
        ValuesType.LossModifier,
        'Late deployment',
        UnitAttribute.Morale,
        combat.properties.deploymentPenalty
      )
      definition = addValue(
        definition,
        ValuesType.LossModifier,
        'Non-secondary reinforcement',
        UnitAttribute.Morale,
        combat.properties.reinforcementPenalty
      )
    }
  })
  return applyDynamicAttributes(definition, settings)
}

const mapStateToProps = (state: AppState) => {
  const data = state.ui.modals[ModalType.CohortDetail]
  const settings = getCombatSettings(state)
  const mode = getMode(state)
  if (data) {
    const cohort = getCohortDefinition(state, data.country, data.army, data.index)
    if (cohort) {
      return {
        index: data.index,
        terrainTypes: getTerrainTypes(state, undefined),
        country: data.country,
        army: data.army,
        unitTypes: toArr(state.countries[CountryName.Country1].units, unit => unit.type),
        mode,
        cohort: convertCohort(
          settings,
          cohort,
          getCohortForEachRound(state, data.side, data.participantIndex, data.index)
        ),
        settings
      }
    }
  }
  return {
    index: 0,
    terrainTypes: getTerrainTypes(state, undefined),
    country: CountryName.Country1,
    army: ArmyName.Army,
    mode,
    settings,
    cohort: null,
    unitTypes: []
  }
}

const actions = { deleteCohort, setCohortValue, changeCohortType, toggleCohortLoyality, closeModal }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends S, D {}

export default connect(mapStateToProps, actions)(ModalCohortDetail)
