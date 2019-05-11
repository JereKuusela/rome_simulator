import { combineReducers } from 'redux'
import { layoutReducer } from './layout'
import { unitsReducer } from './units/reducer'

export const rootReducer = combineReducers({
    layout: layoutReducer,
    units: unitsReducer
})

export type AppState = ReturnType<typeof rootReducer>
