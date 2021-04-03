/* eslint-disable @typescript-eslint/no-explicit-any */
import * as manager from 'managers/combat'
import { ActionToFunction, makeActionRemoveFirst, makeReducer } from './utils'
import type { AppState } from 'reducers'

const mapping: ActionToFunction<[AppState, AppState]> = {}

export const battle = makeActionRemoveFirst(manager.battle, mapping)
export const refreshBattle = makeActionRemoveFirst(manager.refreshBattle, mapping)
export const undo = makeActionRemoveFirst(manager.undo, mapping)

const getState = (draft: AppState, _2: any, _3: any, state: AppState) => [state, draft]

export const combatReducer = makeReducer({} as AppState, mapping, getState as any)
