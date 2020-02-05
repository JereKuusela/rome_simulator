import { Reducer, CombinedState } from 'redux'
import { armyReducer, countriesReducer, countryReducer, unitsReducer, tacticsReducer, terrainsReducer, battleReducer, transferReducer, importReducer, dataReducer, settingsReducer, combatReducer } from 'reducers'
import { composeReducers } from 'immer-reducer'
import { Mode, CountryName } from 'types'

export type ReducerParams = { mode: Mode, country: CountryName}

const compose = <State>(...reducers: ReducerWithParam<State>[]): ReducerWithParam<State> => {
  const initial = reducers[0](undefined, { payload: [] }, {} as ReducerParams)
  const reducer = (state = initial, action: { type: string, payload: any[] }, params: ReducerParams) => {
    if (!action.payload || !Array.isArray(action.payload))
      return state
    return reducers.reduce((prev, curr: any) => curr(prev, action, params), state)
  }
  return reducer as any
}

type ReducerWithParam<State> = (state: State | undefined, action: any, params: ReducerParams) => State

function combine<S>(reducers: {[K in keyof S]: ReducerWithParam<S[K]>}): Reducer<CombinedState<S>> {
  const reducerKeys = Object.keys(reducers) as (keyof S)[];

  return function combination(state: S = {} as S, action) {
    const nextState: S = {} as S
    const settings: ReducerParams =  { mode: (state as any)?.settings?.mode, country: (state as any)?.settings?.country }

    for (let key of reducerKeys) {
      const reducer = reducers[key] as any
      nextState[key] = reducer(state[key], action, settings)
    }
    return nextState
  }
}

const combined = combine({
  units: unitsReducer,
  tactics: tacticsReducer,
  terrains: terrainsReducer,
  battle: battleReducer,
  transfer: transferReducer,
  countries: compose(countryReducer, countriesReducer, armyReducer),
  data: dataReducer,
  settings: settingsReducer
})

export const rootReducer: Reducer<AppState, any> = composeReducers(combined, combatReducer, importReducer)

export type AppState = ReturnType<typeof combined>
export * from './transforms'
export * from './utils'
