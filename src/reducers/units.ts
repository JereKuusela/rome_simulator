import { UnitsData, UnitData, Countries, UnitType, CountryName } from 'types'
import { getDefaultCountryDefinitions } from 'data'
import * as manager from 'managers/units'
import {
  ActionToFunction,
  makeActionReplaceFirst,
  makeEntityReducer,
  Action,
  makeActionReplaceFirstTwice,
  compose,
  makeReducer
} from './utils'

const unitsMapping: ActionToFunction<UnitsData, CountryName> = {}

export const createUnit = makeActionReplaceFirst(manager.createUnit, unitsMapping)
export const deleteUnit = makeActionReplaceFirst(manager.deleteUnit, unitsMapping)
export const changeUnitType = makeActionReplaceFirst(manager.changeUnitType, unitsMapping)

const getUnits = (draft: Countries, action: Action<CountryName>) => draft[action.payload[0]].units

const units = makeEntityReducer(getDefaultCountryDefinitions(), unitsMapping, getUnits)

const unitMapping: ActionToFunction<UnitData, CountryName, UnitType> = {}

export const setUnitValue = makeActionReplaceFirstTwice(manager.setUnitValue, unitMapping)
export const changeUnitImage = makeActionReplaceFirstTwice(manager.changeUnitImage, unitMapping)
export const changeUnitDeployment = makeActionReplaceFirstTwice(manager.changeUnitDeployment, unitMapping)
export const toggleUnitLoyality = makeActionReplaceFirstTwice(manager.toggleUnitLoyality, unitMapping)
export const changeParent = makeActionReplaceFirstTwice(manager.changeParent, unitMapping)

const getUnit = (draft: Countries, action: Action<CountryName>) => {
  const [country, key] = action.payload
  return draft[country].units[key as UnitType]
}

const getUnitPayload = (action: Action) => {
  const [, , ...payload] = action.payload
  return payload
}

const unit = makeReducer(getDefaultCountryDefinitions(), unitMapping, getUnit, getUnitPayload)

export const unitsReducer = compose(unit, units)
