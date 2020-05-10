
import { ArmyDefinition, CountryName, Countries } from 'types'
import { ArmyName } from 'types/armies'
import * as manager from 'managers/army'
import { getDefaultCountryDefinitions } from 'data'
import { ActionToFunction, makeReducer, Action, makeActionReplaceFirstTwice } from './utils'

const mapping: ActionToFunction<ArmyDefinition, CountryName, ArmyName> = {}

export const clearGeneralSelection = makeActionReplaceFirstTwice(manager.clearGeneralSelection, mapping)
export const clearGeneralSelections = makeActionReplaceFirstTwice(manager.clearGeneralSelections, mapping)
export const enableGeneralSelection = makeActionReplaceFirstTwice(manager.enableGeneralSelection, mapping)
export const enableGeneralSelections = makeActionReplaceFirstTwice(manager.enableGeneralSelections, mapping)
export const selectCohort = makeActionReplaceFirstTwice(manager.selectCohort, mapping)
export const toggleCohortLoyality = makeActionReplaceFirstTwice(manager.toggleCohortLoyality, mapping)
export const setCohortValue = makeActionReplaceFirstTwice(manager.setCohortValue, mapping)
export const changeCohortType = makeActionReplaceFirstTwice(manager.changeCohortType, mapping)
export const editCohort = makeActionReplaceFirstTwice(manager.editCohort, mapping)
export const deleteCohort = makeActionReplaceFirstTwice(manager.deleteCohort, mapping)
export const removeFromReserve = makeActionReplaceFirstTwice(manager.removeFromReserve, mapping)
export const addToReserve = makeActionReplaceFirstTwice(manager.addToReserve, mapping)
export const clearCohorts = makeActionReplaceFirstTwice(manager.clearCohorts, mapping)
export const selectTactic = makeActionReplaceFirstTwice(manager.selectTactic, mapping)
export const setFlankSize = makeActionReplaceFirstTwice(manager.setFlankSize, mapping)
export const setUnitPreference = makeActionReplaceFirstTwice(manager.setUnitPreference, mapping)
export const setGeneralAttribute = makeActionReplaceFirstTwice(manager.setGeneralAttribute, mapping)
export const clearGeneralAttributes = makeActionReplaceFirstTwice(manager.clearGeneralAttributes, mapping)
export const setHasGeneral = makeActionReplaceFirstTwice(manager.setHasGeneral, mapping)

const getEntity = (draft: Countries, action: Action<CountryName, ArmyName>) => {
  const [country, army] = action.payload
  return draft[country].armies[army]
}

const getEntityPayload = (action: Action<CountryName, ArmyName>) => {
  const [, , ...payload] = action.payload
  return payload
}

export const armyReducer = makeReducer(getDefaultCountryDefinitions(), mapping, getEntity, getEntityPayload)
