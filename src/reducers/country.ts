import { produce } from 'immer'
import * as manager from 'managers/country'
import { Country } from 'types'
import { getDefaultCountryDefinitions } from 'data'
import { ReducerParams } from 'state'

const actionToFunction: { [key: string]: (country: Country, ...args: any) => void | undefined } = {}

const makeAction = <T extends any[], S extends string>(func: (country: Country, ...args: T) => any, type: S) => {
  const ret = (...args: T) => ({
    type,
    payload: args
  })
  actionToFunction[type] = func
  return ret
}

export const clearSelection = makeAction(manager.clearSelection, 'clearSelection')
export const enableSelection = makeAction(manager.enableSelection, 'enableSelection')
export const selectCulture = makeAction(manager.selectCulture, 'selectCulture')
export const selectGovernment = makeAction(manager.selectGovernment, 'selectGovernment')
export const selectReligion = makeAction(manager.selectReligion, 'selectReligion')
export const setMilitaryPower = makeAction(manager.setMilitaryPower, 'setMilitaryPower')
export const setOfficeDiscipline = makeAction(manager.setOfficeDiscipline, 'setOfficeDiscipline')
export const setOfficeMorale = makeAction(manager.setOfficeMorale, 'setOfficeMorale')
export const setOmenPower = makeAction(manager.setOmenPower, 'setOmenPower')

type Action = {
  type: string,
  payload: any[]
}

export const countryReducer = (state = getDefaultCountryDefinitions(), action: Action, params: ReducerParams) => {
  const func = actionToFunction[action.type]
  if (!func)
    return state
  return produce(state, draft => {
    func(draft[params.country], ...action.payload)
  })
}
