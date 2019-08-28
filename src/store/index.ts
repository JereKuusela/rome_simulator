import { combineReducers, AnyAction, Reducer } from 'redux'
import { unitsReducer, globalStatsReducer } from './units'
import { tacticsReducer } from './tactics'
import { terrainsReducer } from './terrains'
import { battleReducer } from './battle'
import { combatReducer } from './combat'
import { transferReducer, importReducer } from './transfer'
import { settingsReducer } from './settings'
import { selectionsReducer } from './countries'
import { dataReducer } from './data'
import { composeReducers } from 'immer-reducer'

const combined = combineReducers({
  units: unitsReducer,
  tactics: tacticsReducer,
  terrains: terrainsReducer,
  battle: battleReducer,
  transfer: transferReducer,
  global_stats: globalStatsReducer,
  countries: selectionsReducer,
  data: dataReducer,
  settings: settingsReducer
})

export const rootReducer:Reducer<AppState, AnyAction> = composeReducers(combined, combatReducer, importReducer) as Reducer<AppState, AnyAction>

export type AppState = ReturnType<typeof combined>
