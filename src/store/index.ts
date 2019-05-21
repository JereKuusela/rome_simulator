import { combineReducers } from 'redux'
import { unitsReducer } from './units'
import { tacticsReducer } from './tactics'
import { terrainsReducer } from './terrains'
import { landBattleReducer } from './land_battle'

export const rootReducer = combineReducers({
  units: unitsReducer,
  tactics: tacticsReducer,
  terrains: terrainsReducer,
  land: landBattleReducer
})

export type AppState = ReturnType<typeof rootReducer>
