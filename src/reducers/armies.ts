
import { Concat } from 'typescript-tuple'
import { Army, Mode, CountryName } from 'types'
import { ArmyName } from 'types/armies'
import * as manager from 'managers/army_manager'
import { getDefaultCountryDefinitions } from 'data'

const actionToFunction: { [key: string]: (army: Army, ...args: any) => void | undefined } = {}

const makeAction = <T extends any[], S extends string>(func: (state: Army, ...args: T) => any, type: S) => {
  const ret = (country: CountryName, mode: Mode, ...args: T) => ({
    type,
    payload: [country, mode, ...args] as any as Concat<[CountryName, Mode], T>
  })
  actionToFunction[type] = func
  return ret
}

export const selectCohort = makeAction(manager.selectCohort, 'selectCohort')
export const toggleCohortLoyality = makeAction(manager.toggleCohortLoyality, 'toggleCohortLoyality')
export const setCohortValue = makeAction(manager.setCohortValue, 'setCohortValue')
export const changeCohortType = makeAction(manager.changeCohortType, 'changeCohortType')
export const editCohort = makeAction(manager.editCohort, 'editCohort')
export const deleteCohort = makeAction(manager.deleteCohort, 'deleteCohort')
export const removeFromReserve = makeAction(manager.removeFromReserve, 'removeFromReserve')
export const addToReserve = makeAction(manager.addToReserve, 'addToReserve')
export const clearCohorts = makeAction(manager.clearCohorts, 'clearCohorts')
export const selectTactic = makeAction(manager.selectTactic, 'selectTactic')
export const setFlankSize = makeAction(manager.setFlankSize, 'setFlankSize')
export const setUnitPreference = makeAction(manager.setUnitPreference, 'setUnitPreference')

export const armyReducer = (state = getDefaultCountryDefinitions(), action: Actions) => {
  const [country, mode, ...payload] = action.payload
  const sub = { type: action.type, payload }
  const func = actionToFunction[sub.type]
  if (func)
    func(state[country].armies[mode][ArmyName.Army1], ...sub.payload)
}

type Actions = {
  type: string,
  payload: [CountryName, Mode, ...any[]]
}
