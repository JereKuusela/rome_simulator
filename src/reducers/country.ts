import { produce } from 'immer'
import * as manager from 'managers/country'
import { CountryName, Country } from 'types'
import { getDefaultCountryDefinitions } from 'data'
import { Concat } from 'typescript-tuple'

const actionToFunction: { [key: string]: (country: Country, ...args: any) => void | undefined } = {}

const makeAction = <T extends any[], S extends string>(func: (country: Country, ...args: T) => any, type: S) => {
  const ret = (country: CountryName, ...args: T) => ({
    type,
    payload: [country, ...args] as any as Concat<[CountryName], T>
  })
  actionToFunction[type] = func
  ret['type'] = type
  return ret
}

export const clearModifiers = makeAction(manager.clearModifiers, 'clearModifiers')
export const enableModifiers = makeAction(manager.enableModifiers, 'enableModifiers')
export const selectCulture = makeAction(manager.selectCulture, 'selectCulture')
export const selectGovernment = makeAction(manager.selectGovernment, 'selectGovernment')
export const selectReligion = makeAction(manager.selectReligion, 'selectReligion')
export const setGeneralMartial = makeAction(manager.setGeneralMartial, 'setGeneralMartial')
export const setHasGeneral = makeAction(manager.setHasGeneral, 'setHasGeneral')
export const setMilitaryPower = makeAction(manager.setMilitaryPower, 'setMilitaryPower')
export const setOfficeDiscipline = makeAction(manager.setOfficeDiscipline, 'setOfficeDiscipline')
export const setOfficeMorale = makeAction(manager.setOfficeMorale, 'setOfficeMorale')
export const setOmenPower = makeAction(manager.setOmenPower, 'setOmenPower')

export const countryReducer = (state = getDefaultCountryDefinitions(), action: Action) => {
  const func = actionToFunction[action.type]
  if (!func)
    return state
  return produce(state, draft => {
    const [country, ...payload] = action.payload
    const sub = { type: action.type, payload }
    func(draft[country], ...sub.payload)
  })
}

type Action = {
  type: string,
  payload: [CountryName, ...any[]]
}
