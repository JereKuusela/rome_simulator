import { convertUnitDefinitions, filterUnitDefinitions } from 'army_utils'
import { uniq } from 'lodash'
import { convertUnitDefinitionsToList, getActualUnits } from 'managers/army'
import { applyUnitModifiers, getRootParent } from 'managers/units'
import createCachedSelector from 're-reselect'
import { createSelector } from 'reselect'
import type { AppState } from 'reducers'
import { ArmyName, CountryName, UnitType } from 'types'
import { toObj, toArr } from 'utils'
import { getArmyNames, getCountryModifiers, getCountryNames } from './countries'
import { getGeneralData, getGeneralModifiers } from './general'
import { getCombatSettings } from './settings'
import { getMode, getSelectedArmy, getSelectedCountry } from './ui'
import { ArmyKey, getArmyKey, getState, useSelector } from './utils'

const getUnits = (state: AppState, key: ArmyKey) => state.countries[key.countryName].units

const getCountryModifiersWithKey = (state: AppState, key: ArmyKey) => getCountryModifiers(state, key.countryName)

const getSubDefinitions = createCachedSelector(
  [getUnits, getCountryModifiersWithKey, getGeneralModifiers],
  (units, countryModifiers, generalModifiers) => {
    return applyUnitModifiers(units, countryModifiers.concat(generalModifiers))
  }
)(getArmyKey)

export const getUnitDefinitions = createCachedSelector(
  [getMode, getGeneralData, getCombatSettings, getSubDefinitions],
  (mode, generalData, settings, subDefinitions) => {
    const general = generalData.definitions
    const units = convertUnitDefinitions(settings, subDefinitions, general)
    return filterUnitDefinitions(mode, units)
  }
)(getArmyKey)

export const getUnitTypeList = (
  state: AppState,
  filterParent: boolean,
  countryName?: CountryName,
  armyName?: ArmyName
) => getUnitList(state, filterParent, countryName, armyName).map(unit => unit.type)

export const getUnitList = (state: AppState, filterParent: boolean, countryName?: CountryName, armyName?: ArmyName) => {
  const mode = getMode(state)
  countryName = countryName ?? getSelectedCountry(state)
  armyName = armyName ?? getSelectedArmy(state)
  const units = getUnitDefinitions(state, { countryName, armyName })
  return convertUnitDefinitionsToList(units, mode, filterParent, getCombatSettings(state))
}

/**
 * Returns unit types for the current mode from all armies.
 * @param state Application state.
 */
export const getMergedUnitTypes = createSelector([getState], (state): UnitType[] => {
  const mode = getMode(state)
  return Array.from(
    getCountryNames(state).reduce((previous, countryName) => {
      return getArmyNames(state, countryName).reduce((previous, armyName) => {
        const units = getActualUnits(getUnitDefinitions(state, { countryName, armyName }), mode)
        units.filter(unit => unit.mode === mode).forEach(unit => previous.add(unit.type))
        return previous
      }, previous)
    }, new Set<UnitType>())
  )
})

export const getUnitImages = createSelector(
  [getState],
  (state: AppState): Record<UnitType, string[]> => {
    const definitions = toArr(state.countries)
      .map(definitions => toArr(definitions.units))
      .flat(1)
    const unitTypes = getMergedUnitTypes(state)
    return toObj(
      unitTypes,
      type => type,
      type => uniq(definitions.filter(value => value.type === type).map(value => value.image))
    )
  }
)

export const getUnitDefinition = (state: AppState, countryName: CountryName, armyName: ArmyName, unitType: UnitType) =>
  getUnitDefinitions(state, { countryName, armyName })[unitType]

const getRootUnitDefinition = (state: AppState, countryName: CountryName, armyName: ArmyName) => {
  const mode = getMode(state)
  return getUnitDefinition(state, countryName, armyName, getRootParent(mode))
}
export const useUnitDefinitions = (countryName: CountryName, armyName: ArmyName) =>
  useSelector(state => getUnitDefinitions(state, { countryName, armyName }))

export const useUnitDefinition = (countryName: CountryName, armyName: ArmyName, unitType: UnitType) =>
  useSelector(state => getUnitDefinition(state, countryName, armyName, unitType))

export const useRootUnitDefinition = (countryName: CountryName, armyName: ArmyName) =>
  useSelector(state => getRootUnitDefinition(state, countryName, armyName))
export const useUnitImages = () => useSelector(getUnitImages)
export const useMergedUnitTypes = () => useSelector(getMergedUnitTypes)
