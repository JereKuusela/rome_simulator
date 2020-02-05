import { combineReducers, AnyAction, Reducer } from 'redux'
import { armyReducer, countriesReducer, countryReducer, unitsReducer, tacticsReducer, terrainsReducer, battleReducer, transferReducer, importReducer, dataReducer, settingsReducer, combatReducer } from 'reducers'
import { composeReducers } from 'immer-reducer'

const combine = <T>(...reducers: Reducer<T, any>[]): Reducer<T, any> => {
  const initial = reducers[0](undefined, { payload: [] })
  return (state = initial, action: { type: string, payload: any[] }) => {
    if (!action.payload || !Array.isArray(action.payload))
      return state
    return reducers.reduce((prev, curr) => curr(prev, action), state)
  }
}

const combined = combineReducers({
  units: unitsReducer,
  tactics: tacticsReducer,
  terrains: terrainsReducer,
  battle: battleReducer,
  transfer: transferReducer,
  countries: combine(countryReducer, countriesReducer, armyReducer),
  data: dataReducer,
  settings: settingsReducer
})

export const rootReducer: Reducer<AppState, AnyAction> = composeReducers(combined, combatReducer, importReducer) as Reducer<AppState, AnyAction>

export type AppState = ReturnType<typeof combined>
export * from './transforms'
export * from './utils'
