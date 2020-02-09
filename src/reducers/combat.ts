import * as manager from 'managers/combat'
import { makeContainerReducer, ActionToFunction, makeActionRemoveFirst } from './utils'
import { AppState } from 'state'

const combatMapping: ActionToFunction<AppState> = {}

export const battle = makeActionRemoveFirst(manager.battle, combatMapping)
export const refreshBattle = makeActionRemoveFirst(manager.refreshBattle, combatMapping)

export const combatReducer = makeContainerReducer({} as AppState, combatMapping)
