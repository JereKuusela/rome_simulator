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
  cacheReducer,
  uiReducer
} from 'reducers'
import { combineRoot, compose } from 'reducers/utils'
import { Reducer } from 'react'

const combined = combineRoot({
  tactics: tacticsReducer,
  terrains: terrainsReducer,
  battle: battleReducer,
  transfer: transferReducer,
  countries: compose(countriesReducer, armyReducer, unitsReducer),
  settings: settingsReducer,
  ui: uiReducer,
  cache: cacheReducer
})

export const rootReducer = compose(combined, combatReducer, importReducer) as Reducer<any, any>

export type AppState = ReturnType<typeof combined>
export * from './transforms'
export * from './utils'
