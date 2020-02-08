
import { Army, CountryName, Countries } from 'types'
import { ArmyName } from 'types/armies'
import * as manager from 'managers/army_manager'
import { getDefaultCountryDefinitions } from 'data'
import { ReducerParams } from 'state'
import { ActionToFunction, makeActionReplaceFirst, makeReducer, Action } from './utils'

const actionToFunction: ActionToFunction<Army> = {}

export const selectCohort = makeActionReplaceFirst(manager.selectCohort, 'selectCohort' as CountryName, actionToFunction)
export const toggleCohortLoyality = makeActionReplaceFirst(manager.toggleCohortLoyality, 'toggleCohortLoyality' as CountryName, actionToFunction)
export const setCohortValue = makeActionReplaceFirst(manager.setCohortValue, 'setCohortValue' as CountryName, actionToFunction)
export const changeCohortType = makeActionReplaceFirst(manager.changeCohortType, 'changeCohortType' as CountryName, actionToFunction)
export const editCohort = makeActionReplaceFirst(manager.editCohort, 'editCohort' as CountryName, actionToFunction)
export const deleteCohort = makeActionReplaceFirst(manager.deleteCohort, 'deleteCohort' as CountryName, actionToFunction)
export const removeFromReserve = makeActionReplaceFirst(manager.removeFromReserve, 'removeFromReserve' as CountryName, actionToFunction)
export const addToReserve = makeActionReplaceFirst(manager.addToReserve, 'addToReserve' as CountryName, actionToFunction)
export const clearCohorts = makeActionReplaceFirst(manager.clearCohorts, 'clearCohorts' as CountryName, actionToFunction)
export const selectTactic = makeActionReplaceFirst(manager.selectTactic, 'selectTactic' as CountryName, actionToFunction)
export const setFlankSize = makeActionReplaceFirst(manager.setFlankSize, 'setFlankSize' as CountryName, actionToFunction)
export const setUnitPreference = makeActionReplaceFirst(manager.setUnitPreference, 'setUnitPreference' as CountryName, actionToFunction)
export const setGeneralMartial = makeActionReplaceFirst(manager.setGeneralMartial, 'setGeneralMartial' as CountryName, actionToFunction)
export const setHasGeneral = makeActionReplaceFirst(manager.setHasGeneral, 'setHasGeneral' as CountryName, actionToFunction)
export const clearGeneralModifiers = makeActionReplaceFirst(manager.clearGeneralModifiers, 'clearGeneralModifiers' as CountryName, actionToFunction)
export const enableGeneralModifiers = makeActionReplaceFirst(manager.enableGeneralModifiers, 'enableGeneralModifiers' as CountryName, actionToFunction)

const getEntity = (draft: Countries, action: Action<CountryName>, params: ReducerParams) => {
  const [country] = action.payload
  return draft[country].armies[params.mode][ArmyName.Army1]
}

const getEntityPayload = (action: Action<CountryName>) => {
  const [, ...payload] = action.payload
  return payload
}

export const armyReducer = makeReducer(getDefaultCountryDefinitions(), actionToFunction, getEntity, getEntityPayload)
