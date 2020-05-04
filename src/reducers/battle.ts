
import * as manager from 'managers/battle'
import { ModeState, Battle } from 'types'
import { getDefaultBattle } from 'data'
import { ActionToFunction, makeActionRemoveFirst, Action, ReducerParams, makeReducer } from './utils'

const battleMapping: ActionToFunction<Battle> = {}

export const selectParticipantCountry = makeActionRemoveFirst(manager.selectParticipantCountry, battleMapping)
export const selectParticipantArmy = makeActionRemoveFirst(manager.selectParticipantArmy, battleMapping)
export const addParticipant = makeActionRemoveFirst(manager.addParticipant, battleMapping)
export const deleteParticipant = makeActionRemoveFirst(manager.deleteParticipant, battleMapping)
export const selectTerrain = makeActionRemoveFirst(manager.selectTerrain, battleMapping)
export const setDice = makeActionRemoveFirst(manager.setDice, battleMapping)
export const setPhaseDice = makeActionRemoveFirst(manager.setPhaseDice, battleMapping)
export const toggleRandomDice = makeActionRemoveFirst(manager.toggleRandomDice, battleMapping)
export const undo = makeActionRemoveFirst(manager.undo, battleMapping)
export const setSeed = makeActionRemoveFirst(manager.setSeed, battleMapping)

const getEntity = (draft: ModeState, _: Action, params: ReducerParams) => draft[params.mode]

export const battleReducer = makeReducer(getDefaultBattle(), battleMapping, getEntity)
