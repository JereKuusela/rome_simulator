import { AppState } from './index'
import { toArr, toObj, keys } from 'utils'
import {
  filterUnitDefinitions,
  getArmyPart,
  convertReserveDefinitions,
  convertUnitDefinitions,
  convertUnitDefinition,
  shrinkUnits
} from '../army_utils'
import {
  Mode,
  CountryName,
  SideType,
  CohortDefinition,
  ArmyPart,
  UnitType,
  UnitPreferences,
  Participant,
  CombatSettings,
  ArmyName,
  GeneralDefinition,
  Setting,
  ReserveDefinition,
  CountryAttribute,
  UnitDefinitions,
  UnitDefinition,
  GeneralData,
  Cohort,
  SideData,
  Side,
  Environment,
  ArmyDefinition
} from 'types'
import {
  getDefaultBattle,
  getDefaultMode,
  getDefaultCountryDefinitions,
  getDefaultSettings,
  getDefaultTacticState,
  getDefaultTerrainState
} from 'data'
import { uniq, flatten } from 'lodash'
import * as manager from 'managers/army'
import { getGeneralModifiers } from 'managers/modifiers'
import { convertUnitsData } from 'managers/units'
import { convertArmy, convertSide, getRound, getAttacker } from 'managers/battle'
import { iterateCohorts } from 'combat'
import { calculateValue } from 'data_values'
import { useSelector } from 'react-redux'
import * as selectors from 'selectors/units'
import {
  getBattle,
  getMode,
  getSide,
  getCombatSettings,
  getTacticsData,
  getCountry,
  getSelectedTerrains,
  getSelectedArmy,
  getSelectedCountry,
  getArmyNames,
  getCohorts
} from 'selectors'

export const useTechLevel = (countryName: CountryName): number => {
  return useSelector((state: AppState) => {
    const country = getCountry(state, countryName)
    return country[CountryAttribute.MartialTech]
  })
}

export const getCohortDefinition = (
  state: AppState,
  country: CountryName,
  army: ArmyName,
  index: number
): CohortDefinition => getReserve(state, country, army)[index]

export const getCohort = (
  state: AppState,
  side: SideType,
  part: ArmyPart,
  row: number,
  column: number
): Cohort | null => getArmyPart(getCohorts(state, side), part)[row][column]

export const getCohortForEachRound = (state: AppState, side: SideType, participantIndex: number, index: number) => {
  const rounds = getSide(state, side).days
  return rounds.map(side => {
    let result = null
    iterateCohorts(side.cohorts, true, cohort => {
      if (cohort && cohort.properties.participantIndex === participantIndex && cohort.properties.index === index)
        result = cohort
    })
    return result
  })
}

/**
 * Returns unit types for the current mode from all armies.
 * @param state Application state.
 */
export const mergeUnitTypes = (state: AppState): UnitType[] => {
  const mode = getMode(state)
  return Array.from(
    keys(state.countries).reduce((previous, countryName) => {
      return getArmyNames(state, countryName).reduce((previous, armyName) => {
        const units = manager.getActualUnits(getUnitDefinitions(state, countryName, armyName), mode)
        units.filter(unit => unit.mode === mode).forEach(unit => previous.add(unit.type))
        return previous
      }, previous)
    }, new Set<UnitType>())
  )
}

const getArmy = (state: AppState, countryName: CountryName, armyName: ArmyName): ArmyDefinition => {
  const army = getArmyDefinition(state, countryName, armyName)
  const unitDefinitions = getUnitDefinitions(state, countryName, armyName)
  const reserve = getReserve(state, countryName, armyName)
  const general = getGeneral(state, countryName, armyName)
  const settings = getCombatSettings(state)
  const unitPreferences = settings[Setting.CustomDeployment] ? army.unitPreferences : ({} as UnitPreferences)
  const flankRatio = calculateValue(state.countries[countryName].modifiers, CountryAttribute.FlankRatio)
  return { reserve, general, flankSize: army.flankSize, unitPreferences, unitDefinitions, flankRatio }
}

export const convertSides = (state: AppState): Side[] => {
  const sideA = getSide(state, SideType.A)
  const sideD = getSide(state, SideType.B)
  const armyA = sideA.participants.map(participant => getArmy(state, participant.countryName, participant.armyName))
  const armyD = sideD.participants.map(participant => getArmy(state, participant.countryName, participant.armyName))
  const settings = getCombatSettings(state)
  return [convertSidesSub(state, sideA, armyA, armyD, settings), convertSidesSub(state, sideD, armyD, armyA, settings)]
}

const convertSidesSub = (
  state: AppState,
  side: SideData,
  armyDefinitions: ArmyDefinition[],
  enemyDefinitions: ArmyDefinition[],
  settings: CombatSettings
): Side => {
  const terrains = getSelectedTerrains(state)
  const enemyTypes = uniq(flatten(enemyDefinitions.map(army => army.reserve.map(unit => unit.type))))
  const armies = side.participants.map((participant, index) =>
    convertArmy(index, participant, armyDefinitions[index], enemyTypes, terrains, settings)
  )
  // Ascending + reverse ensures that smaller index gets at end.
  armies.sort((a, b) => a.arrival - b.arrival).reverse()
  return convertSide(side, armies, settings)
}

export const getCombatEnvironment = (state: AppState): Environment => {
  const battle = getBattle(state)
  const terrains = battle.terrains.map(value => state.terrains[value])
  const settings = getCombatSettings(state)
  return {
    day: 0,
    round: getRound(battle),
    terrains,
    settings,
    attacker: getAttacker(battle),
    mode: getMode(state)
  }
}

export const getUnitPreferences = (state: AppState, countryName: CountryName, armyName: ArmyName): UnitPreferences =>
  getArmyDefinition(state, countryName, armyName).unitPreferences

export const getFlankSize = (state: AppState, countryName: CountryName, armyName: ArmyName): number =>
  getArmyDefinition(state, countryName, armyName).flankSize

const getArmyDefinition = (state: AppState, countryName: CountryName, armyName: ArmyName) =>
  state.countries[countryName].armies[armyName]

export const getGeneralDefinition = (state: AppState, countryName: CountryName, armyName: ArmyName): GeneralData => {
  const general = getArmyDefinition(state, countryName, armyName).general
  const modifiers = getGeneralModifiers(general)
  return manager.applyGeneralModifiers(general, modifiers)
}
export const getGeneral = (state: AppState, countryName: CountryName, armyName: ArmyName): GeneralDefinition =>
  manager.convertGeneralDefinition(
    getCombatSettings(state),
    getGeneralDefinition(state, countryName, armyName),
    getTacticsData(state)
  )

export const getOverridenReserveDefinitions = (
  state: AppState,
  countryName: CountryName,
  armyName: ArmyName,
  originals?: boolean
) => {
  const army = getArmyDefinition(state, countryName, armyName)
  if (originals) return army.reserve
  const units = getUnitDefinitions(state, countryName, armyName)
  const country = getCountry(state, countryName)
  const latest = manager.getLatestUnits(units, country[CountryAttribute.MartialTech])
  return manager.overrideRoleWithPreferences(army, units, latest)
}

export const getReserve = (
  state: AppState,
  countryName: CountryName,
  armyName: ArmyName,
  originals?: boolean
): ReserveDefinition => {
  const settings = getCombatSettings(state)
  const definition = getOverridenReserveDefinitions(state, countryName, armyName, originals)
  const units = getUnitDefinitions(state, countryName, armyName)
  return convertReserveDefinitions(settings, definition as ReserveDefinition, units)
}

export const useParticipant = (type: SideType): Participant => {
  return useSelector((state: AppState) => {
    const index = state.ui.selectedParticipantIndex[SideType.A]
    const participants = getBattle(state).sides[type].participants
    return participants.length < index ? participants[index] : participants[0]
  })
}

const getUnitDefinitionsSub = (state: AppState, countryName: CountryName, armyName: ArmyName) => {
  const country = state.countries[countryName]
  const general = getGeneralDefinition(state, countryName, armyName)
  return convertUnitsData(country.units, country, general)
}

export const useUnitDefinitions = (countryName: CountryName, armyName: ArmyName): UnitDefinitions | undefined => {
  const props = { countryName, armyName }
  return useSelector((state: AppState) => selectors.getUnitDefinitions(state, props))
}

export const useUnitDefinition = (
  countryName: CountryName,
  armyName: ArmyName,
  unitType: UnitType
): UnitDefinition | undefined => {
  const props = { countryName, armyName }
  return useSelector((state: AppState) => selectors.getUnitDefinitions(state, props)[unitType])
}

export const getUnitDefinitionsCached = (
  state: AppState,
  countryName: CountryName,
  armyName: ArmyName
): UnitDefinitions | undefined => {
  const props = { countryName, armyName }
  return selectors.getUnitDefinitions(state, props)
}

export const getUnitDefinitions = (
  state: AppState,
  countryName?: CountryName,
  armyName?: ArmyName,
  mode?: Mode
): UnitDefinitions => {
  const settings = getCombatSettings(state)
  countryName = countryName ?? getSelectedCountry(state)
  armyName = armyName ?? getSelectedArmy(state)
  mode = mode ?? getMode(state)

  const definitions = getUnitDefinitionsSub(state, countryName, armyName)
  const general = getGeneralDefinition(state, countryName, armyName).definitions
  const units = convertUnitDefinitions(settings, definitions, general)
  return filterUnitDefinitions(mode, units)
}

export const getUnitTypeList = (
  state: AppState,
  filterParent: boolean,
  countryName?: CountryName,
  armyName?: ArmyName
) => getUnitList(state, filterParent, countryName, armyName).map(unit => unit.type)

export const getUnitList = (
  state: AppState,
  filterParent: boolean,
  countryName?: CountryName,
  armyName?: ArmyName
): UnitDefinition[] => {
  const mode = getMode(state)
  countryName = countryName ?? getSelectedCountry(state)
  armyName = armyName ?? getSelectedArmy(state)
  const units = getUnitDefinitions(state, countryName, armyName)
  return manager.getUnitList(units, mode, filterParent, getCombatSettings(state))
}

export const getUnitDefinition = (
  state: AppState,
  unitType: UnitType,
  countryName?: CountryName,
  armyName?: ArmyName
): UnitDefinition => {
  const settings = getCombatSettings(state)
  countryName = countryName ?? getSelectedCountry(state)
  armyName = armyName ?? getSelectedArmy(state)
  const general = getGeneralDefinition(state, countryName, armyName).definitions
  const units = getUnitDefinitionsSub(state, countryName, armyName)
  return convertUnitDefinition(settings, units, shrinkUnits(units), general, unitType)
}

export const getUnitImages = (state: AppState): { [key in UnitType]: string[] } => {
  const definitions = toArr(state.countries)
    .map(definitions => toArr(definitions.units))
    .flat(1)
  const unitTypes = mergeUnitTypes(state)
  return toObj(
    unitTypes,
    type => type,
    type => uniq(definitions.filter(value => value.type === type).map(value => value.image))
  )
}

/**
 * Resets missing data by using the default data.
 * @param data
 */
export const resetMissing = (data: AppState) => {
  data.tactics = data.tactics || getDefaultTacticState()
  data.terrains = data.terrains || getDefaultTerrainState()
  data.battle = data.battle || getDefaultBattle()
  if (!data.battle[Mode.Land]) data.battle[Mode.Land] = getDefaultMode(Mode.Land)
  if (!data.battle[Mode.Naval]) data.battle[Mode.Naval] = getDefaultMode(Mode.Naval)
  data.settings = data.settings || getDefaultSettings()
  data.countries = data.countries || getDefaultCountryDefinitions()
  return data
}

/**
 * Resets all data.
 * @param data
 */
export const resetAll = (data: AppState) => {
  data.tactics = getDefaultTacticState()
  data.terrains = getDefaultTerrainState()
  data.battle = getDefaultBattle()
  data.settings = getDefaultSettings()
  data.countries = getDefaultCountryDefinitions()
}
