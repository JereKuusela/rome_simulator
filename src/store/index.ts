import { combineReducers } from 'redux'
import { unitsReducer } from './units'
import { tacticsReducer } from './tactics'
import { terrainsReducer } from './terrains'
import { landBattleReducer } from './land_battle'
import undoable from 'redux-undo';

export const rootReducer = combineReducers({
  units: unitsReducer,
  tactics: tacticsReducer,
  terrains: terrainsReducer,
  land: undoable(landBattleReducer)
})

export type AppState = ReturnType<typeof rootReducer>
