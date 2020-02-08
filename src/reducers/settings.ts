
import * as manager from 'managers/settings'
import { makeActionRemoveFirst, makeContainerReducer, ActionToFunction } from './utils'
import { SettingsAndOptions } from 'types'
import { getDefaultSettings } from 'data'

const actionToFunction: ActionToFunction<SettingsAndOptions> = {}

export const changeCombatParameter = makeActionRemoveFirst(manager.changeCombatParameter, 'changeCombatParameter', actionToFunction)
export const changeSiteParameter = makeActionRemoveFirst(manager.changeSiteParameter, 'changeSiteParameter', actionToFunction)
export const changeWeariness = makeActionRemoveFirst(manager.changeWeariness, 'changeWeariness', actionToFunction)
export const selectCountry = makeActionRemoveFirst(manager.selectCountry, 'selectCountry', actionToFunction)
export const toggleAccordion = makeActionRemoveFirst(manager.toggleAccordion, 'toggleAccordion', actionToFunction)
export const toggleMode = makeActionRemoveFirst(manager.toggleMode, 'toggleMode', actionToFunction)

export const settingsReducer = makeContainerReducer(getDefaultSettings(), actionToFunction)
