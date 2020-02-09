import { getDefaultTacticState } from 'data'
import { Tactics, Tactic, TacticType } from 'types'
import * as manager from 'managers/tactics'
import { makeActionRemoveFirst, makeContainerReducer, ActionToFunction, makeActionReplaceFirst, makeEntityReducer, compose } from './utils'

const tacticsMapping: ActionToFunction<Tactics> = {}

export const createTactic = makeActionRemoveFirst(manager.createTactic, tacticsMapping)
export const setTacticType = makeActionRemoveFirst(manager.setTacticType, tacticsMapping)
export const deleteTactic = makeActionRemoveFirst(manager.deleteTactic, tacticsMapping)

const tactics = makeContainerReducer(getDefaultTacticState(), tacticsMapping)

const tacticMapping: ActionToFunction<Tactic, TacticType> = {}

export const setTacticBaseValue = makeActionReplaceFirst(manager.setTacticBaseValue, tacticMapping)
export const setTacticImage = makeActionReplaceFirst(manager.setTacticImage, tacticMapping)
export const setTacticMode = makeActionReplaceFirst(manager.setTacticMode, tacticMapping)

const tactic = makeEntityReducer(getDefaultTacticState(), tacticMapping)

export const tacticsReducer = compose(tactic, tactics)
