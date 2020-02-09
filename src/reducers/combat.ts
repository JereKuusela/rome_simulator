import * as manager from 'managers/combat'
import { ActionToFunction, makeActionRemoveFirst, makeReducer } from './utils'
import { AppState } from 'state'

const combatMapping: ActionToFunction<[AppState, AppState]> = {}

export const battle = makeActionRemoveFirst(manager.battle, combatMapping)
export const refreshBattle = makeActionRemoveFirst(manager.refreshBattle, combatMapping)

const getState = (draft: AppState, _2: any, _3: any, state: AppState) => [state, draft]

export const combatReducer = makeReducer({} as AppState, combatMapping, getState as any)
