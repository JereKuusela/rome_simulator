import { Units, Unit, Countries, UnitType } from 'types'
import { getDefaultCountryDefinitions } from 'data'
import * as manager from 'managers/units'
import { ActionToFunction, makeActionRemoveFirst, makeContainerReducer, Action, makeActionReplaceFirst, ReducerParams, compose, makeEntityReducer } from './utils'

const unitsMapping: ActionToFunction<Units> = {}

export const createUnit = makeActionRemoveFirst(manager.createUnit, unitsMapping)
export const deleteUnit = makeActionRemoveFirst(manager.deleteUnit, unitsMapping)
export const changeUnitType = makeActionRemoveFirst(manager.changeUnitType, unitsMapping)
export const enableUnitModifiers = makeActionRemoveFirst(manager.enableUnitModifiers, unitsMapping)
export const clearUnitModifiers = makeActionRemoveFirst(manager.clearUnitModifiers, unitsMapping)

const getUnits = (draft: Countries, _: Action, params: ReducerParams) => draft[params.country].units

const units = makeContainerReducer(getDefaultCountryDefinitions(), unitsMapping, getUnits)

const unitMapping: ActionToFunction<Unit, UnitType> = {}

export const setUnitValue = makeActionReplaceFirst(manager.setUnitValue, unitMapping)
export const changeUnitImage = makeActionReplaceFirst(manager.changeUnitImage, unitMapping)
export const changeUnitDeployment = makeActionReplaceFirst(manager.changeUnitDeployment, unitMapping)
export const toggleUnitLoyality = makeActionReplaceFirst(manager.toggleUnitLoyality, unitMapping)
export const changeUnitBaseType = makeActionReplaceFirst(manager.changeUnitBaseType, unitMapping)

const getUnit = (draft: Countries, action: Action<UnitType>, params: ReducerParams) => {
  const [key] = action.payload
  return draft[params.country].units[key]
}

const unit = makeEntityReducer(getDefaultCountryDefinitions(), unitMapping, getUnit)

export const unitsReducer = compose(unit, units)
