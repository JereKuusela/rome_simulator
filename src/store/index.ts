import { combineReducers, AnyAction, Reducer } from 'redux'
import { unitsReducer, globalStatsReducer } from './units'
import reduceReducers from 'reduce-reducers'
import { tacticsReducer } from './tactics'
import { terrainsReducer } from './terrains'
import { battleReducer } from './battle'
import { combatReducer } from './combat'
import { transferReducer, importReducer } from './transfer'
import { settingsReducer } from './settings'
import { governmentReducer } from './governments'

const combined = combineReducers({
  units: unitsReducer,
  tactics: tacticsReducer,
  terrains: terrainsReducer,
  battle: battleReducer,
  transfer: transferReducer,
  global_stats: globalStatsReducer,
  governments: governmentReducer,
  settings: settingsReducer
})

export const rootReducer:Reducer<AppState, AnyAction> = reduceReducers(combined, combatReducer, importReducer) as Reducer<AppState, AnyAction>

export type AppState = ReturnType<typeof combined>
