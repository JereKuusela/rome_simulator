import { combineReducers } from 'redux'
import { layoutReducer } from './layout'
import { unitsReducer } from './units'
import { tacticsReducer } from './tactics'
import { terrainsReducer } from './terrains'

export const rootReducer = combineReducers({
  layout: layoutReducer,
  units: unitsReducer,
  tactics: tacticsReducer,
  terrains: terrainsReducer
})

export type AppState = ReturnType<typeof rootReducer>
