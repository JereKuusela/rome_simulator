
import * as manager from 'managers/battle'
import { ModeState, Battle } from 'types'
import { getDefaultBattle } from 'data'
import { ActionToFunction, makeActionRemoveFirst, Action, ReducerParams, makeReducer } from './utils'

const mapping: ActionToFunction<Battle> = {}

export const selectParticipantCountry = makeActionRemoveFirst(manager.selectParticipantCountry, mapping)
export const selectParticipantArmy = makeActionRemoveFirst(manager.selectParticipantArmy, mapping)
export const selectTerrain = makeActionRemoveFirst(manager.selectTerrain, mapping)
export const setDice = makeActionRemoveFirst(manager.setDice, mapping)
export const setPhaseDice = makeActionRemoveFirst(manager.setPhaseDice, mapping)
export const toggleRandomDice = makeActionRemoveFirst(manager.toggleRandomDice, mapping)
export const setSeed = makeActionRemoveFirst(manager.setSeed, mapping)

const getEntity = (draft: ModeState, _: Action, params: ReducerParams) => draft[params.mode]

export const battleReducer = makeReducer(getDefaultBattle(), mapping, getEntity)
