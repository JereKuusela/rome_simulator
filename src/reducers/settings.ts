
import * as manager from 'managers/settings'
import { makeActionRemoveFirst, makeContainerReducer, ActionToFunction } from './utils'
import { SettingsAndOptions } from 'types'
import { getDefaultSettings } from 'data'

const actionToFunction: ActionToFunction<SettingsAndOptions> = {}

export const changeCombatParameter = makeActionRemoveFirst(manager.changeCombatParameter, actionToFunction)
export const changeSiteParameter = makeActionRemoveFirst(manager.changeSiteParameter, actionToFunction)
export const selectCountry = makeActionRemoveFirst(manager.selectCountry, actionToFunction)
export const selectArmy = makeActionRemoveFirst(manager.selectArmy, actionToFunction)
export const toggleMode = makeActionRemoveFirst(manager.toggleMode, actionToFunction)

export const settingsReducer = makeContainerReducer(getDefaultSettings(), actionToFunction)
