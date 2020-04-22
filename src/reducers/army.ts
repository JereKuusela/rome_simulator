
import { Army, CountryName, Countries } from 'types'
import { ArmyName } from 'types/armies'
import * as manager from 'managers/army'
import { getDefaultCountryDefinitions } from 'data'
import { ActionToFunction, makeActionReplaceFirst, makeReducer, Action, ReducerParams } from './utils'

const actionToFunction: ActionToFunction<Army, CountryName> = {}

export const clearAllGeneralSelections = makeActionReplaceFirst(manager.clearAllGeneralSelections, actionToFunction)
export const clearGeneralSelection = makeActionReplaceFirst(manager.clearGeneralSelection, actionToFunction)
export const clearGeneralSelections = makeActionReplaceFirst(manager.clearGeneralSelections, actionToFunction)
export const enableGeneralSelection = makeActionReplaceFirst(manager.enableGeneralSelection, actionToFunction)
export const selectCohort = makeActionReplaceFirst(manager.selectCohort, actionToFunction)
export const toggleCohortLoyality = makeActionReplaceFirst(manager.toggleCohortLoyality, actionToFunction)
export const setCohortValue = makeActionReplaceFirst(manager.setCohortValue, actionToFunction)
export const changeCohortType = makeActionReplaceFirst(manager.changeCohortType, actionToFunction)
export const editCohort = makeActionReplaceFirst(manager.editCohort, actionToFunction)
export const deleteCohort = makeActionReplaceFirst(manager.deleteCohort, actionToFunction)
export const removeFromReserve = makeActionReplaceFirst(manager.removeFromReserve, actionToFunction)
export const addToReserve = makeActionReplaceFirst(manager.addToReserve, actionToFunction)
export const clearCohorts = makeActionReplaceFirst(manager.clearCohorts, actionToFunction)
export const selectTactic = makeActionReplaceFirst(manager.selectTactic, actionToFunction)
export const setFlankSize = makeActionReplaceFirst(manager.setFlankSize, actionToFunction)
export const setUnitPreference = makeActionReplaceFirst(manager.setUnitPreference, actionToFunction)
export const setGeneralStat = makeActionReplaceFirst(manager.setGeneralStat, actionToFunction)
export const setGeneralValue = makeActionReplaceFirst(manager.setGeneralValue, actionToFunction)
export const setHasGeneral = makeActionReplaceFirst(manager.setHasGeneral, actionToFunction)

const getEntity = (draft: Countries, action: Action<CountryName>, params: ReducerParams) => {
  const [country] = action.payload
  return draft[country].armies[params.mode][ArmyName.Army1]
}

const getEntityPayload = (action: Action<CountryName>) => {
  const [, ...payload] = action.payload
  return payload
}

export const armyReducer = makeReducer(getDefaultCountryDefinitions(), actionToFunction, getEntity, getEntityPayload)
