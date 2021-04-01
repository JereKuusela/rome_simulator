import { getDefaultTacticState } from 'data'
import { TacticsData, TacticData, TacticType } from 'types'
import * as manager from 'managers/tactics'
import {
  makeActionRemoveFirst,
  makeContainerReducer,
  ActionToFunction,
  makeActionReplaceFirst,
  makeEntityReducer,
  compose
} from './utils'

const tacticsMapping: ActionToFunction<TacticsData> = {}

export const createTactic = makeActionRemoveFirst(manager.createTactic, tacticsMapping)
export const setTacticType = makeActionRemoveFirst(manager.setTacticType, tacticsMapping)
export const deleteTactic = makeActionRemoveFirst(manager.deleteTactic, tacticsMapping)

const tactics = makeContainerReducer(getDefaultTacticState(), tacticsMapping)

const tacticMapping: ActionToFunction<TacticData, TacticType> = {}

export const setTacticValue = makeActionReplaceFirst(manager.setTacticValue, tacticMapping)
export const setTacticImage = makeActionReplaceFirst(manager.setTacticImage, tacticMapping)
export const setTacticMode = makeActionReplaceFirst(manager.setTacticMode, tacticMapping)

const tactic = makeEntityReducer(getDefaultTacticState(), tacticMapping)

export const tacticsReducer = compose(tactic, tactics)
