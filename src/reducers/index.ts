import { Reducer } from 'react'
import { armyReducer } from './army'
import { battleReducer } from './battle'
import { combatReducer } from './combat'
import { countriesReducer } from './countries'
import { settingsReducer } from './settings'
import { tacticsReducer } from './tactics'
import { terrainsReducer } from './terrains'
import { transferReducer, importReducer } from './transfer'
import { uiReducer } from './ui'
import { unitsReducer } from './units'
import { combineRoot, compose } from './utils'

const combined = combineRoot({
  tactics: tacticsReducer,
  terrains: terrainsReducer,
  battle: battleReducer,
  transfer: transferReducer,
  countries: compose(countriesReducer, armyReducer, unitsReducer),
  settings: settingsReducer,
  ui: uiReducer
})

export const rootReducer = compose(combined, combatReducer, importReducer) as Reducer<unknown, unknown>

export type AppState = ReturnType<typeof combined>

export * from './army'
export * from './battle'
export * from './combat'
export * from './countries'
export * from './settings'
export * from './tactics'
export * from './terrains'
export * from './transfer'
export * from './ui'
export * from './units'
