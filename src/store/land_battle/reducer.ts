import { createReducer } from 'typesafe-actions'
import { getInitialArmy, getInitialTerrains } from './types'

export const initialState = {
  attacker: getInitialArmy(),
  defender: getInitialArmy(),
  terrains: getInitialTerrains(),
  day: 0
}

export const landBattleReducer = createReducer(initialState)
