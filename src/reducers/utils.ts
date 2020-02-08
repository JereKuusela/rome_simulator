import { produce } from 'immer'
import { ReducerParams } from 'state'

export type Action<T = any> = {
  type: string,
  payload: [T, ...any[]]
}

export type ActionToFunction<T> = { [key: string]: (entity: T, ...args: any) => void | undefined }

export const makeActionRemoveFirst = <T extends any[], E>(func: (entity: E, ...args: T) => any, type: string, actionToFunction: ActionToFunction<E>) => {
  actionToFunction[type] = func
  return (...payload: T) => ({ type, payload } as {})
}

export const makeActionReplaceFirst = <T extends any[], K extends string, E>(func: (entity: E, ...args: T) => any, type: K, actionToFunction: ActionToFunction<E>) => {
  actionToFunction[type] = func
  const ret = (key: K, ...args: T) => ({ type, payload: [key, ...args] } as {})
  return ret
}

type GetEntity<S, E, T extends string> = (draft: S, action: Action<T>, params: ReducerParams) => E
type GetPayload<T extends string> = (action: Action<T>) => any[]

const getEntity = <S extends {[key in T]: E}, E, T extends string>(draft: S, action: Action<T>) => draft[action.payload[0]]

const getEntityPayload = (action: Action) => {
  const [, ...payload] = action.payload
  return payload
}

const getDraft = <E>(draft: E) => draft

export const makeReducer = <S, T extends string, E>(initial: S, actionToFunction: ActionToFunction<E>, getEntity: GetEntity<S, E, T>, getPayload?: GetPayload<T>) => {
  return (state = initial, action: Action<T>, params: ReducerParams) => {
    const func = actionToFunction[action.type]
    if (!func)
      return state
    return produce(state, (draft: S) => {
      func(getEntity(draft, action, params), ...(getPayload ? getPayload(action) : action.payload))
    })
  }
}

export const makeEntityReducer = <S extends { [key in T]: E }, T extends string, E>(initial: S, actionToFunction: ActionToFunction<E>) => (
  makeReducer(initial, actionToFunction, getEntity, getEntityPayload)
)

export const makeContainerReducer = <E>(initial: E, actionToFunction: ActionToFunction<E>) => (
  makeReducer(initial, actionToFunction, getDraft)
)
