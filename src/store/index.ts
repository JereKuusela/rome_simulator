import { combineReducers, AnyAction, Reducer } from 'redux'
import { unitsReducer } from './units'
import reduceReducers from 'reduce-reducers'
import { tacticsReducer } from './tactics'
import { terrainsReducer } from './terrains'
import { landBattleReducer } from './land_battle'
import { battleReducer } from './battle'
import { transferReducer, importReducer } from './transfer'

const combined = combineReducers({
  units: unitsReducer,
  tactics: tacticsReducer,
  terrains: terrainsReducer,
  land: landBattleReducer,
  transfer: transferReducer
})

export const rootReducer:Reducer<AppState, AnyAction> = reduceReducers(combined, battleReducer, importReducer) as Reducer<AppState, AnyAction>

export type AppState = ReturnType<typeof combined>
