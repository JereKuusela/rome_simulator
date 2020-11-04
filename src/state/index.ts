import {
  armyReducer,
  countriesReducer,
  unitsReducer,
  tacticsReducer,
  terrainsReducer,
  battleReducer,
  transferReducer,
  importReducer,
  settingsReducer,
  combatReducer,
  uiReducer
} from 'reducers'
import { combine, compose } from 'reducers/utils'
import { Reducer } from 'react'

const combined = combine({
  tactics: tacticsReducer,
  terrains: terrainsReducer,
  battle: battleReducer,
  transfer: transferReducer,
  countries: compose(countriesReducer, armyReducer, unitsReducer),
  settings: settingsReducer,
  ui: uiReducer
})

export const rootReducer = compose(combined, combatReducer, importReducer) as Reducer<any, any>

export type AppState = ReturnType<typeof combined>
export * from './transforms'
export * from './utils'
