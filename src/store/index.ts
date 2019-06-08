import { combineReducers, AnyAction, Reducer } from 'redux'
import { unitsReducer, globalStatsReducer } from './units'
import reduceReducers from 'reduce-reducers'
import { tacticsReducer } from './tactics'
import { terrainsReducer } from './terrains'
import { landBattleReducer } from './land_battle'
import { battleReducer } from './battle'
import { transferReducer, importReducer } from './transfer'
import { settingsReducer } from './settings'

const combined = combineReducers({
  units: unitsReducer,
  tactics: tacticsReducer,
  terrains: terrainsReducer,
  land: landBattleReducer,
  transfer: transferReducer,
  global_stats: globalStatsReducer,
  settings: settingsReducer
})

export const rootReducer:Reducer<AppState, AnyAction> = reduceReducers(combined, battleReducer, importReducer) as Reducer<AppState, AnyAction>

export type AppState = ReturnType<typeof combined>
