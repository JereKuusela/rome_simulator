import { produce } from 'immer'
import * as manager from 'managers/countries'
import { Countries } from 'types'
import { getDefaultCountryDefinitions } from 'data'

const actionToFunction: { [key: string]: (countries: Countries, ...args: any) => void | undefined } = {}

const makeAction = <T extends any[], S extends string>(func: (countries: Countries, ...args: T) => any, type: S) => {
  const ret = (...args: T) => ({
    type,
    payload: args as T
  })
  actionToFunction[type] = func
  ret['type'] = type
  return ret
}

export const createCountry = makeAction(manager.createCountry, 'createCountry')
export const deleteCountry = makeAction(manager.deleteCountry, 'deleteCountry')
export const changeCountryName = makeAction(manager.changeCountryName, 'changeCountryName')

export const countriesReducer = (state = getDefaultCountryDefinitions(), action: Action) => {
  const func = actionToFunction[action.type]
  if (!func)
    return state
  return produce(state, draft => {
    func(draft, ...action.payload)
  })
}

type Action = {
  type: string,
  payload: [any[]]
}
