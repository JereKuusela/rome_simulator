import { produce } from 'immer'
import { Mode } from 'types'
import { Reducer, CombinedState } from 'redux'

export type Action<T1 = any, T2 = any> = {
  type: string
  payload: [T1, T2, ...any[]]
}

let typeCounter = 0
// eslint-disable-next-line @typescript-eslint/ban-types
const getActionType = (func: Function) => (process.env.NODE_ENV === 'production' ? 'action' + typeCounter++ : func.name)

export type ActionToFunction<T, K1 = any, K2 = any> = { [key: string]: (entity: T, ...args: any) => void | undefined }

export const makeActionRemoveFirst = <T extends any[], E>(
  func: (entity: E, ...args: T) => any,
  actionToFunction: ActionToFunction<E>
) => {
  const type = getActionType(func)
  actionToFunction[type] = func
  return (...payload: T) => ({ type, payload } as unknown)
}

export const makeActionReplaceFirst = <T extends any[], K extends string, E>(
  func: (entity: E, ...args: T) => any,
  actionToFunction: ActionToFunction<E, K>
) => {
  const type = getActionType(func)
  actionToFunction[type] = func
  const ret = (key: K, ...args: T) => ({ type, payload: [key, ...args] } as unknown)
  return ret
}

export const makeActionReplaceFirstTwice = <T extends any[], K1 extends string, K2 extends string, E>(
  func: (entity: E, ...args: T) => any,
  actionToFunction: ActionToFunction<E, K1, K2>
) => {
  const type = getActionType(func)
  actionToFunction[type] = func
  const ret = (key1: K1, key2: K2, ...args: T) => ({ type, payload: [key1, key2, ...args] } as unknown)
  return ret
}

type GetEntity<S, E> = (draft: S, action: Action, params: ReducerParams, state: S) => E
type GetPayload = (action: Action) => any[]

const getDefaultEntity = (draft: any, action: Action<any>) => draft[action.payload[0]]

const getEntityPayload = (action: Action) => {
  const [, ...payload] = action.payload
  return payload
}

const getDefaultContainer = (draft: any) => draft

export const makeReducer = <S, E>(
  initial: S,
  actionToFunction: ActionToFunction<E>,
  getEntity: GetEntity<S, E>,
  getPayload?: GetPayload
) => {
  return (state = initial, action: Action, params: ReducerParams) => {
    const func = actionToFunction[action.type]
    if (!func) return state
    return produce(state, (draft: S) => {
      func(getEntity(draft, action, params, state), ...(getPayload ? getPayload(action) : action.payload))
    })
  }
}

export function makeEntityReducer<S extends { [key in K]: E }, E, K extends string>(
  initial: S,
  actionToFunction: ActionToFunction<E, K>
): ReducerWithParam<S>
export function makeEntityReducer<S, E>(
  initial: S,
  actionToFunction: ActionToFunction<E>,
  getEntity: GetEntity<S, E>
): ReducerWithParam<S>
export function makeEntityReducer<S, E>(
  initial: S,
  actionToFunction: ActionToFunction<E>,
  getEntity?: GetEntity<S, E>
) {
  return makeReducer(initial, actionToFunction, getEntity ? getEntity : getDefaultEntity, getEntityPayload)
}

export function makeContainerReducer<S>(initial: S, actionToFunction: ActionToFunction<S>): ReducerWithParam<S>
export function makeContainerReducer<S, E>(
  initial: S,
  actionToFunction: ActionToFunction<E>,
  getContainer: GetEntity<S, E>
): ReducerWithParam<S>
export function makeContainerReducer<S, E>(
  initial: S,
  actionToFunction: ActionToFunction<E>,
  getContainer?: GetEntity<S, E>
) {
  return makeReducer(initial, actionToFunction, getContainer ? getContainer : getDefaultContainer)
}

export type ReducerParams = { mode: Mode }

export const compose = <State>(...reducers: ReducerWithParam<State>[]): ReducerWithParam<State> => {
  const initial = reducers[0](undefined, { payload: [] }, {} as ReducerParams)
  const reducer = (state = initial, action: { type: string; payload: any[] }, params: ReducerParams) => {
    if (!action.payload || !Array.isArray(action.payload)) return state
    return reducers.reduce((prev, curr: any) => curr(prev, action, params), state)
  }
  return reducer as any
}

type ReducerWithParam<State> = (state: State | undefined, action: any, params: ReducerParams) => State

export function combine<S>(reducers: { [K in keyof S]: ReducerWithParam<S[K]> }): Reducer<CombinedState<S>> {
  const reducerKeys = Object.keys(reducers) as (keyof S)[]

  return function combination(state: S = {} as S, action) {
    let nextState: S = {} as S
    const settings: ReducerParams = { mode: (state as any)?.settings?.mode }

    let invalidated = false
    for (const key of reducerKeys) {
      const reducer = reducers[key] as any
      nextState[key] = reducer(state[key], action, settings)
      if (action.type && nextState[key] !== state[key] && key !== 'ui' && key !== 'transfer') invalidated = true
    }
    if (invalidated) {
      nextState = produce(nextState, (draft: any) => {
        draft['battle'][settings.mode].outdated = true
      })
    }
    return nextState
  }
}
