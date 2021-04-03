// Intended for complex selectors that cause dependency issues.
import { convertReserveDefinitions, convertArmyData } from 'army_utils'
import { uniq, flatten } from 'lodash'
import { getLatestUnits, overrideRoleWithPreferences } from 'managers/army'
import { convertArmy, convertSide } from 'managers/battle'
import createCachedSelector from 're-reselect'
import { createSelector } from 'reselect'
import type { AppState } from 'reducers'
import {
  ArmyDefinition,
  ArmyName,
  CombatSettings,
  CountryAttribute,
  CountryName,
  SideData,
  SideType,
  TerrainData,
  UnitPreferences
} from 'types'
import { getArmyData } from './armies'
import { getSelectedTerrains, getSideData } from './battle'
import { getCountryAttribute } from './countries'
import { getGeneralDefinition } from './general'
import { getCombatSettings } from './settings'
import { getUnitDefinitions } from './units'
import { ArmyKey, getArmyKey, useSelector } from './utils'

const convertSidesSub = (
  side: SideData,
  armyDefinitions: ArmyDefinition[],
  enemyDefinitions: ArmyDefinition[],
  terrains: TerrainData[],
  settings: CombatSettings
) => {
  const enemyTypes = uniq(flatten(enemyDefinitions.map(army => army.reserve.map(unit => unit.type))))
  const armies = side.participants.map((participant, index) =>
    convertArmy(index, participant, armyDefinitions[index], enemyTypes, terrains, settings)
  )
  // Ascending + reverse ensures that smaller index gets at end.
  armies.sort((a, b) => a.arrival - b.arrival).reverse()
  return convertSide(side, armies, settings)
}

const getSideDataA = (state: AppState) => getSideData(state, SideType.A)
const getArmyDefinitionsA = (state: AppState) =>
  getSideDataA(state).participants.map(participant => getArmyDefinition(state, participant))
const getSideDataB = (state: AppState) => getSideData(state, SideType.B)
const getArmyDefinitionsB = (state: AppState) =>
  getSideDataB(state).participants.map(participant => getArmyDefinition(state, participant))

export const getInitialSides = createSelector(
  [getSideDataA, getSideDataB, getArmyDefinitionsA, getArmyDefinitionsB, getSelectedTerrains, getCombatSettings],
  (sideA, sideB, armyA, armyB, terrains, settings) => [
    convertSidesSub(sideA, armyA, armyB, terrains, settings),
    convertSidesSub(sideB, armyB, armyA, terrains, settings)
  ]
)

const getOverridenReserveData = (
  state: AppState,
  countryName: CountryName,
  armyName: ArmyName,
  originals?: boolean
) => {
  const army = getArmyData(state, { countryName, armyName })
  if (originals) return army.reserve
  const units = getUnitDefinitions(state, { countryName, armyName })
  const tech = getCountryAttribute(state, countryName, CountryAttribute.MartialTech)
  const latest = getLatestUnits(units, tech)
  return overrideRoleWithPreferences(army, units, latest)
}

const getReserveDefinition = (state: AppState, key: ArmyKey, originals?: boolean) => {
  const settings = getCombatSettings(state)
  const definition = getOverridenReserveData(state, key.countryName, key.armyName, originals)
  const units = getUnitDefinitions(state, key)
  return convertReserveDefinitions(settings, definition, units)
}
export const getCohortDefinition = (state: AppState, countryName: CountryName, armyName: ArmyName, index: number) =>
  getReserveDefinition(state, { countryName, armyName })[index]

const getFlankRatio = (state: AppState, key: ArmyKey) =>
  getCountryAttribute(state, key.countryName, CountryAttribute.FlankRatio)

export const getArmyDefinition = createCachedSelector(
  [getArmyData, getUnitDefinitions, getReserveDefinition, getGeneralDefinition, getCombatSettings, getFlankRatio],
  convertArmyData
)(getArmyKey)

export const getUnitPreferences = (state: AppState, countryName: CountryName, armyName: ArmyName): UnitPreferences =>
  getArmyDefinition(state, { countryName, armyName }).unitPreferences

export const getFlankSize = (state: AppState, countryName: CountryName, armyName: ArmyName): number =>
  getArmyDefinition(state, { countryName, armyName }).flankSize

export const useUnitPrefences = (countryName: CountryName, armyName: ArmyName) =>
  useSelector(state => getUnitPreferences(state, countryName, armyName))
