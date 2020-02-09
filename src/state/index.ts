import { Reducer } from 'redux'
import { armyReducer, countriesReducer, unitsReducer, tacticsReducer, terrainsReducer, battleReducer, transferReducer, importReducer, dataReducer, settingsReducer, combatReducer } from 'reducers'
import { composeReducers } from 'immer-reducer'
import { combine, compose } from 'reducers/utils'

const combined = combine({
  tactics: tacticsReducer,
  terrains: terrainsReducer,
  battle: battleReducer,
  transfer: transferReducer,
  countries: compose(countriesReducer, armyReducer, unitsReducer),
  data: dataReducer,
  settings: settingsReducer
})

export const rootReducer: Reducer<AppState, any> = composeReducers(combined, combatReducer, importReducer)

export type AppState = ReturnType<typeof combined>
export * from './transforms'
export * from './utils'
