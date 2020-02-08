import { Units, Unit, Countries, UnitType } from 'types'
import { getDefaultCountryDefinitions } from 'data'
import * as manager from 'managers/units'
import { ActionToFunction, makeActionRemoveFirst, makeReducer, Action, makeActionReplaceFirst } from './utils'
import { ReducerParams } from 'state'

const unitsMapping: ActionToFunction<Units> = {}

export const createUnit = makeActionRemoveFirst(manager.createUnit, 'createUnit', unitsMapping)
export const deleteUnit = makeActionRemoveFirst(manager.deleteUnit, 'deleteUnit', unitsMapping)
export const changeUnitType = makeActionRemoveFirst(manager.changeUnitType, 'changeUnitType', unitsMapping)
export const enableUnitModifiers = makeActionRemoveFirst(manager.enableUnitModifiers, 'enableUnitModifiers', unitsMapping)
export const clearUnitModifiers = makeActionRemoveFirst(manager.clearUnitModifiers, 'clearUnitModifiers', unitsMapping)

const getUnits = (draft: Countries, _: Action, params: ReducerParams) => draft[params.country].units

export const unitsReducer = makeReducer(getDefaultCountryDefinitions(), unitsMapping, getUnits)

const unitMapping: ActionToFunction<Unit> = {}

export const setUnitValue = makeActionReplaceFirst(manager.setUnitValue, 'setUnitValue' as UnitType, unitMapping)
export const changeUnitImage = makeActionReplaceFirst(manager.changeUnitImage, 'changeUnitImage' as UnitType, unitMapping)
export const changeUnitDeployment = makeActionReplaceFirst(manager.changeUnitDeployment, 'changeUnitDeployment' as UnitType, unitMapping)
export const toggleUnitLoyality = makeActionReplaceFirst(manager.toggleUnitLoyality, 'toggleUnitLoyality' as UnitType, unitMapping)
export const changeUnitMode = makeActionReplaceFirst(manager.changeUnitMode, 'changeUnitMode' as UnitType, unitMapping)

const getUnit = (draft: Countries, action: Action<UnitType>, params: ReducerParams) => {
  const [key] = action.payload
  return draft[params.country].units[key]
}

export const unitReducer = makeReducer(getDefaultCountryDefinitions(), unitMapping, getUnit)
