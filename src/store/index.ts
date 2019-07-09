import { combineReducers, AnyAction, Reducer } from 'redux'
import { unitsReducer, globalStatsReducer } from './units'
import reduceReducers from 'reduce-reducers'
import { tacticsReducer } from './tactics'
import { terrainsReducer } from './terrains'
import { battleReducer } from './battle'
import { combatReducer } from './combat'
import { transferReducer, importReducer } from './transfer'
import { armiesReducer } from './armies'
import { settingsReducer } from './settings'
import { selectionsReducer } from './countries'
import { dataReducer } from './data'

const armyReducer = reduceReducers(battleReducer, armiesReducer) as Reducer<any, AnyAction>

const combined = combineReducers({
  units: unitsReducer,
  tactics: tacticsReducer,
  terrains: terrainsReducer,
  battle: armyReducer,
  transfer: transferReducer,
  global_stats: globalStatsReducer,
  countries: selectionsReducer,
  data: dataReducer,
  settings: settingsReducer
})

export const rootReducer:Reducer<AppState, AnyAction> = reduceReducers(combined, combatReducer, importReducer) as Reducer<AppState, AnyAction>

export type AppState = ReturnType<typeof combined>
