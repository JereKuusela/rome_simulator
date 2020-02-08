import * as manager from 'managers/country'
import { Country, Countries } from 'types'
import { getDefaultCountryDefinitions } from 'data'
import { ReducerParams } from 'state'
import { makeActionRemoveFirst, ActionToFunction, Action, makeReducer } from './utils'

const actionToFunction: ActionToFunction<Country> = {}

export const clearSelection = makeActionRemoveFirst(manager.clearSelection, 'clearSelection', actionToFunction)
export const enableSelection = makeActionRemoveFirst(manager.enableSelection, 'enableSelection', actionToFunction)
export const selectCulture = makeActionRemoveFirst(manager.selectCulture, 'selectCulture', actionToFunction)
export const selectGovernment = makeActionRemoveFirst(manager.selectGovernment, 'selectGovernment', actionToFunction)
export const selectReligion = makeActionRemoveFirst(manager.selectReligion, 'selectReligion', actionToFunction)
export const setMilitaryPower = makeActionRemoveFirst(manager.setMilitaryPower, 'setMilitaryPower', actionToFunction)
export const setOfficeDiscipline = makeActionRemoveFirst(manager.setOfficeDiscipline, 'setOfficeDiscipline', actionToFunction)
export const setOfficeMorale = makeActionRemoveFirst(manager.setOfficeMorale, 'setOfficeMorale', actionToFunction)
export const setOmenPower = makeActionRemoveFirst(manager.setOmenPower, 'setOmenPower', actionToFunction)

const getEntity = (draft: Countries, _: Action, params: ReducerParams) => draft[params.country]

export const countryReducer = makeReducer(getDefaultCountryDefinitions(), actionToFunction, getEntity)
