
import { Army, CountryName, Countries } from 'types'
import { ArmyName } from 'types/armies'
import * as manager from 'managers/army_manager'
import { getDefaultCountryDefinitions } from 'data'
import { ReducerParams } from 'state'
import { ActionToFunction, makeActionReplaceFirst, makeReducer, Action } from './utils'

const actionToFunction: ActionToFunction<Army, CountryName> = {}

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
export const setGeneralMartial = makeActionReplaceFirst(manager.setGeneralMartial, actionToFunction)
export const setHasGeneral = makeActionReplaceFirst(manager.setHasGeneral, actionToFunction)
export const clearGeneralModifiers = makeActionReplaceFirst(manager.clearGeneralModifiers, actionToFunction)
export const enableGeneralModifiers = makeActionReplaceFirst(manager.enableGeneralModifiers, actionToFunction)

const getEntity = (draft: Countries, action: Action<CountryName>, params: ReducerParams) => {
  const [country] = action.payload
  return draft[country].armies[params.mode][ArmyName.Army1]
}

const getEntityPayload = (action: Action<CountryName>) => {
  const [, ...payload] = action.payload
  return payload
}

export const armyReducer = makeReducer(getDefaultCountryDefinitions(), actionToFunction, getEntity, getEntityPayload)
