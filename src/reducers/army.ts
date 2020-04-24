
import { Army, CountryName, Countries } from 'types'
import { ArmyName } from 'types/armies'
import * as manager from 'managers/army'
import { getDefaultCountryDefinitions } from 'data'
import { ActionToFunction, makeReducer, Action, ReducerParams, makeActionReplaceFirstTwice } from './utils'

const actionToFunction: ActionToFunction<Army, CountryName, ArmyName> = {}

export const clearGeneralSelection = makeActionReplaceFirstTwice(manager.clearGeneralSelection, actionToFunction)
export const clearGeneralSelections = makeActionReplaceFirstTwice(manager.clearGeneralSelections, actionToFunction)
export const enableGeneralSelection = makeActionReplaceFirstTwice(manager.enableGeneralSelection, actionToFunction)
export const selectCohort = makeActionReplaceFirstTwice(manager.selectCohort, actionToFunction)
export const toggleCohortLoyality = makeActionReplaceFirstTwice(manager.toggleCohortLoyality, actionToFunction)
export const setCohortValue = makeActionReplaceFirstTwice(manager.setCohortValue, actionToFunction)
export const changeCohortType = makeActionReplaceFirstTwice(manager.changeCohortType, actionToFunction)
export const editCohort = makeActionReplaceFirstTwice(manager.editCohort, actionToFunction)
export const deleteCohort = makeActionReplaceFirstTwice(manager.deleteCohort, actionToFunction)
export const removeFromReserve = makeActionReplaceFirstTwice(manager.removeFromReserve, actionToFunction)
export const addToReserve = makeActionReplaceFirstTwice(manager.addToReserve, actionToFunction)
export const clearCohorts = makeActionReplaceFirstTwice(manager.clearCohorts, actionToFunction)
export const selectTactic = makeActionReplaceFirstTwice(manager.selectTactic, actionToFunction)
export const setFlankSize = makeActionReplaceFirstTwice(manager.setFlankSize, actionToFunction)
export const setUnitPreference = makeActionReplaceFirstTwice(manager.setUnitPreference, actionToFunction)
export const setGeneralAttribute = makeActionReplaceFirstTwice(manager.setGeneralAttribute, actionToFunction)
export const clearGeneralAttributes = makeActionReplaceFirstTwice(manager.clearGeneralAttributes, actionToFunction)
export const setHasGeneral = makeActionReplaceFirstTwice(manager.setHasGeneral, actionToFunction)

const getEntity = (draft: Countries, action: Action<CountryName, ArmyName>, params: ReducerParams) => {
  const [country, army] = action.payload
  return draft[country].armies[params.mode][army]
}

const getEntityPayload = (action: Action<CountryName>) => {
  const [, ...payload] = action.payload
  return payload
}

export const armyReducer = makeReducer(getDefaultCountryDefinitions(), actionToFunction, getEntity, getEntityPayload)
