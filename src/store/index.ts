import { combineReducers, AnyAction, Reducer } from 'redux'
import { unitsReducer, globalStatsReducer } from '../reducers/units'
import { composeReducers } from 'immer-reducer'
import { tacticsReducer } from 'reducers/tactics'
import { terrainsReducer } from 'reducers/terrains'
import { battleReducer } from 'reducers/battle'
import { transferReducer, importReducer } from 'reducers/transfer'
import { selectionsReducer } from 'reducers/countries'
import { dataReducer } from 'reducers/modifiers'
import { settingsReducer } from 'reducers/settings'
import { combatReducer } from 'reducers/combat'

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
