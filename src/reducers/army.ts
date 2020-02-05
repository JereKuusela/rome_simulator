
import { produce } from 'immer'
import { Prepend } from 'typescript-tuple'
import { Army, CountryName } from 'types'
import { ArmyName } from 'types/armies'
import * as manager from 'managers/army_manager'
import { getDefaultCountryDefinitions } from 'data'
import { ReducerParams } from 'state'

const actionToFunction: { [key: string]: (army: Army, ...args: any) => void | undefined } = {}

const makeAction = <T extends any[], S extends string>(func: (army: Army, ...args: T) => any, type: S) => {
  const ret = (country: CountryName, ...args: T) => ({
    type,
    payload: [country, ...args] as any as  Prepend<T, CountryName>
  })
  actionToFunction[type] = func
  ret['type'] = type
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
export const setGeneralMartial = makeAction(manager.setGeneralMartial, 'setGeneralMartial')
export const setHasGeneral = makeAction(manager.setHasGeneral, 'setHasGeneral')
export const clearModifiers = makeAction(manager.clearModifiers, 'clearModifiers')
export const enableModifiers = makeAction(manager.enableModifiers, 'enableModifiers')

export const armyReducer = (state = getDefaultCountryDefinitions(), action: Action, params: ReducerParams) => {
  const func = actionToFunction[action.type]
  if (!func)
    return state
  return produce(state, draft => {
    const [country, ...payload] = action.payload
    const army = draft[country].armies[params.mode]
    func(army[ArmyName.Army1], ...payload)
  })
}

type Action = {
  type: string,
  payload: [CountryName, ...any[]]
}
