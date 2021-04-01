import * as manager from 'managers/settings'
import { makeActionRemoveFirst, makeContainerReducer, ActionToFunction } from './utils'
import { Settings } from 'types'
import { getDefaultSettings } from 'data'

const mapping: ActionToFunction<Settings> = {}

export const changeCombatParameter = makeActionRemoveFirst(manager.changeCombatParameter, mapping)
export const changeSiteParameter = makeActionRemoveFirst(manager.changeSiteParameter, mapping)

export const settingsReducer = makeContainerReducer(getDefaultSettings(), mapping)
