import { combineReducers, AnyAction, Reducer } from 'redux'
import { unitsReducer, tacticsReducer, terrainsReducer, battleReducer, transferReducer, importReducer, selectionsReducer, dataReducer, settingsReducer, combatReducer } from 'reducers'
import { composeReducers } from 'immer-reducer'

const combined = combineReducers({
  units: unitsReducer,
  tactics: tacticsReducer,
  terrains: terrainsReducer,
  battle: battleReducer,
  transfer: transferReducer,
  countries: selectionsReducer,
  data: dataReducer,
  settings: settingsReducer
})

export const rootReducer:Reducer<AppState, AnyAction> = composeReducers(combined, combatReducer, importReducer) as Reducer<AppState, AnyAction>

export type AppState = ReturnType<typeof combined>
export * from './transforms'
export * from './utils'
