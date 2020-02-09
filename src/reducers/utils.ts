import { produce } from 'immer'
import { ReducerParams } from 'state'

export type Action<T = any> = {
  type: string,
  payload: [T, ...any[]]
}

export type ActionToFunction<T, K = any> = { [key: string]: (entity: T, ...args: any) => void | undefined }

export const makeActionRemoveFirst = <T extends any[], E>(func: (entity: E, ...args: T) => any, actionToFunction: ActionToFunction<E>) => {
  actionToFunction[func.name] = func
  return (...payload: T) => ({ type: func.name, payload } as {})
}

export const makeActionReplaceFirst = <T extends any[], K extends string, E>(func: (entity: E, ...args: T) => any, actionToFunction: ActionToFunction<E, K>) => {
  actionToFunction[func.name] = func
  const ret = (key: K, ...args: T) => ({ type: func.name, payload: [key, ...args] } as {})
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

export const makeReducer = <S, K extends string, E>(initial: S, actionToFunction: ActionToFunction<E, K>, getEntity: GetEntity<S, E, K>, getPayload?: GetPayload<K>) => {
  return (state = initial, action: Action<K>, params: ReducerParams) => {
    const func = actionToFunction[action.type]
    if (!func)
      return state
    return produce(state, (draft: S) => {
      func(getEntity(draft, action, params), ...(getPayload ? getPayload(action) : action.payload))
    })
  }
}

export const makeEntityReducer = <S extends { [key in K]: E }, K extends string, E>(initial: S, actionToFunction: ActionToFunction<E, K>) => (
  makeReducer(initial, actionToFunction, getEntity, getEntityPayload)
)

export const makeContainerReducer = <E>(initial: E, actionToFunction: ActionToFunction<E>) => (
  makeReducer(initial, actionToFunction, getDraft)
)
