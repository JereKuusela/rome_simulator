import * as manager from 'managers/settings'
import { makeActionRemoveFirst, makeContainerReducer, ActionToFunction } from './utils'
import { SettingsAndOptions } from 'types'
import { getDefaultSettings } from 'data'

const mapping: ActionToFunction<SettingsAndOptions> = {}

export const changeCombatParameter = makeActionRemoveFirst(manager.changeCombatParameter, mapping)
export const changeSiteParameter = makeActionRemoveFirst(manager.changeSiteParameter, mapping)
export const selectCountry = makeActionRemoveFirst(manager.selectCountry, mapping)
export const selectArmy = makeActionRemoveFirst(manager.selectArmy, mapping)
export const setMode = makeActionRemoveFirst(manager.setMode, mapping)

export const settingsReducer = makeContainerReducer(getDefaultSettings(), mapping)
