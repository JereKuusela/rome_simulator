import { combineReducers } from 'redux'
import { layoutReducer } from './layout'
import { unitsReducer } from './units/reducer'
import { tacticsReducer } from './tactics'

export const rootReducer = combineReducers({
  layout: layoutReducer,
  units: unitsReducer,
  tactics: tacticsReducer
})

export type AppState = ReturnType<typeof rootReducer>
