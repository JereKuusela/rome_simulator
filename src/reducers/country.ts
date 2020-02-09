import * as manager from 'managers/country'
import { Country, Countries } from 'types'
import { getDefaultCountryDefinitions } from 'data'
import { ReducerParams } from 'state'
import { makeActionRemoveFirst, ActionToFunction, Action, makeReducer } from './utils'

const actionToFunction: ActionToFunction<Country> = {}

export const clearSelection = makeActionRemoveFirst(manager.clearSelection, actionToFunction)
export const enableSelection = makeActionRemoveFirst(manager.enableSelection, actionToFunction)
export const selectCulture = makeActionRemoveFirst(manager.selectCulture, actionToFunction)
export const selectGovernment = makeActionRemoveFirst(manager.selectGovernment, actionToFunction)
export const selectReligion = makeActionRemoveFirst(manager.selectReligion, actionToFunction)
export const setMilitaryPower = makeActionRemoveFirst(manager.setMilitaryPower, actionToFunction)
export const setOfficeDiscipline = makeActionRemoveFirst(manager.setOfficeDiscipline, actionToFunction)
export const setOfficeMorale = makeActionRemoveFirst(manager.setOfficeMorale, actionToFunction)
export const setOmenPower = makeActionRemoveFirst(manager.setOmenPower, actionToFunction)

const getEntity = (draft: Countries, _: Action, params: ReducerParams) => draft[params.country]

export const countryReducer = makeReducer(getDefaultCountryDefinitions(), actionToFunction, getEntity)
