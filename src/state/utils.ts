import { AppState } from './index'
import { toArr, toObj, keys, filter } from 'utils'
import {
  filterUnitDefinitions,
  getArmyPart,
  convertReserveDefinitions,
  convertUnitDefinitions,
  convertUnitDefinition,
  shrinkUnits,
  getOpponent
} from '../army_utils'
import {
  Mode,
  CountryName,
  SideType,
  CohortDefinition,
  ArmyPart,
  UnitType,
  TerrainType,
  LocationType,
  TacticType,
  TacticDefinition,
  UnitPreferences,
  Participant,
  Terrain,
  Settings,
  Battle,
  ArmyName,
  GeneralDefinition,
  Countries,
  Setting,
  ReserveDefinition,
  CountryAttribute,
  UnitDefinitions,
  UnitDefinition,
  GeneralData,
  Country,
  CountryDefinition,
  Cohort,
  Cohorts,
  SideData,
  Side,
  Environment,
  ArmyDefinition,
  ArmyData,
  WearinessAttributes,
  SiteSettings,
  CountryDefinitions,
  TacticDefinitions,
  Armies,
  TerrainDefinitions,
  TerrainCalc
} from 'types'
import {
  getDefaultBattle,
  getDefaultMode,
  getDefaultCountryDefinitions,
  getDefaultSettings,
  getDefaultTacticState,
  getDefaultTerrainState
} from 'data'
import { uniq, flatten, sumBy } from 'lodash'
import * as manager from 'managers/army'
import { getCountryModifiers, getGeneralModifiers } from 'managers/modifiers'
import { convertCountryDefinition, applyCountryModifiers, filterArmies } from 'managers/countries'
import { applyUnitModifiers } from 'managers/units'
import { convertArmy, convertSide, getRound, getAttacker, getLeadingArmy } from 'managers/battle'
import { iterateCohorts } from 'combat'
import { convertTactic } from 'managers/tactics'
import { calculateValue } from 'definition_values'
import { useSelector } from 'react-redux'
import { useMemo } from 'react'
import * as selectors from 'selectors/units'

export const useArmyData = (countryName: CountryName, armyName: ArmyName): ArmyData => {
  return useSelector((state: AppState) => state.countries[countryName].armies[armyName])
}

export const useWeariness = (countryName: CountryName): WearinessAttributes => {
  return useSelector((state: AppState) => state.countries[countryName].weariness)
}

export const useCountry = (countryName: CountryName): CountryDefinition => {
  return useSelector((state: AppState) => state.countries[countryName])
}

const calculateCombatWidth = (state: AppState) => {
  const settings = state.settings.siteSettings
  const attacker = getCountry(state, getParticipant(state, SideType.A, 0).countryName)
  const defender = getCountry(state, getParticipant(state, SideType.B, 0).countryName)
  const terrains = sumBy(getSelectedTerrains(state), terrain => calculateValue(terrain, TerrainCalc.CombatWidth))
  return (
    settings[Setting.BaseCombatWidth] +
    terrains +
    Math.max(attacker[CountryAttribute.CombatWidth], defender[CountryAttribute.CombatWidth])
  )
}

export const useCountries = (): CountryDefinitions => useSelector((state: AppState) => state.countries)
export const useSiteSettings = (): SiteSettings => useSelector((state: AppState) => state.settings.siteSettings)
export const useCombatWidth = (): number => useSelector(calculateCombatWidth)
export const useTechLevel = (countryName: CountryName): number => {
  return useSelector((state: AppState) => {
    const country = getCountry(state, countryName)
    return country[CountryAttribute.TechLevel]
  })
}

export const useMode = (): Mode => useSelector((state: AppState) => state.settings.mode)
export const useTactics = (): TacticDefinitions => useSelector((state: AppState) => state.tactics)
export const useGeneral = (countryName: CountryName, armyName: ArmyName): GeneralDefinition | undefined => {
  const props = { countryName, armyName }
  return useSelector((state: AppState) => selectors.getGeneralDefinition(state, props))
}

export const useArmies = (countryName: CountryName): Armies => {
  return useSelector((state: AppState) => filterArmies(state.countries[countryName], state.settings.mode))
}

export const useSide = (type: SideType): SideData => {
  return useSelector((state: AppState) => getBattle(state).sides[type])
}

/**
 * Returns settings of the current mode.
 * @param state Application state.
 */
export const getSettings = (state: AppState, mode?: Mode): Settings => {
  const settings = { ...state.settings.combatSettings[mode || state.settings.mode], ...state.settings.siteSettings }
  settings[Setting.BaseCombatWidth] = calculateCombatWidth(state)
  settings[Setting.Precision] = Math.pow(10, settings[Setting.Precision])
  return settings
}

export const getSiteSettings = (state: AppState) => state.settings.siteSettings

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
  const rounds = state.battle[state.settings.mode].sides[side].days
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
      return keys(getArmies(state, countryName)).reduce((previous, armyName) => {
        const units = manager.getActualUnits(getUnitDefinitions(state, countryName, armyName), mode)
        units.filter(unit => unit.mode === mode).forEach(unit => previous.add(unit.type))
        return previous
      }, previous)
    }, new Set<UnitType>())
  )
}

//#region Terrains

/**
 * Returns terrain types.
 * @param location Location filter (ignored if not given).
 * @param mode Mode filter (current mode if not given).
 */
export const getTerrainTypes = (state: AppState, location?: LocationType, mode?: Mode): TerrainType[] =>
  getTerrains(state, location, mode).map(terrain => terrain.type)

/**
 * Returns terrain .
 * @param location Location filter (ignored if not given).
 * @param mode Mode filter (current mode if not given).
 */
export const getTerrains = (state: AppState, location?: LocationType, mode?: Mode): Terrain[] => {
  const terrains = toArr(state.terrains)
  mode = mode ?? state.settings.mode
  return terrains.filter(terrain => terrain.mode === mode && (!location || terrain.location === location))
}

//#endregion

//#region Tactics

/**
 * Returns tactic types.
 * @param mode Mode filter (current mode if not given).
 */
export const getTacticTypes = (state: AppState, mode?: Mode): TacticType[] =>
  getTacticDefinitions(state, mode).map(tactic => tactic.type)

/**
 * Returns tactics.
 * @param mode Mode filter (current mode if not given).
 */
export const getTacticDefinitions = (state: AppState, mode?: Mode): TacticDefinition[] => {
  const tactics = toArr(state.tactics)
  mode = mode ?? state.settings.mode
  return tactics.filter(tactic => tactic.mode === state.settings.mode)
}

export const getTactics = (state: AppState, side: SideType) => {
  const cohorts = getCohorts(state, side)
  const opponent = getLeadingArmy(getCombatSide(state, getOpponent(side)))
  return opponent ? getTacticDefinitions(state).map(tactic => convertTactic(tactic, cohorts, opponent.tactic)) : []
}

////#endregion

/**
 * Returns armies of the current mode.
 * @param state Application state.
 */
export const useBattle = (): Battle => useSelector((state: AppState) => state.battle[state.settings.mode])
export const useTimestamp = (): number => useSelector((state: AppState) => state.battle[state.settings.mode].timestamp)
export const getBattle = (state: AppState, mode?: Mode): Battle => state.battle[mode ?? state.settings.mode]

export const getCountries = (state: AppState): Countries => state.countries

export const getCohorts = (state: AppState, sideType: SideType): Cohorts => getCombatSide(state, sideType).cohorts

export const getCombatSide = (state: AppState, sideType: SideType): Side => {
  const side = getSide(state, sideType)
  return side.days[side.days.length - 1]
}

const getArmy = (state: AppState, countryName: CountryName, armyName: ArmyName): ArmyDefinition => {
  const army = getArmyDefinition(state, countryName, armyName)
  const unitDefinitions = getUnitDefinitions(state, countryName, armyName)
  const reserve = getReserve(state, countryName, armyName)
  const general = getGeneral(state, countryName, armyName)
  const settings = getSiteSettings(state)
  const unitPreferences = settings[Setting.CustomDeployment] ? army.unitPreferences : ({} as UnitPreferences)
  const flankRatio = calculateValue(state.countries[countryName].modifiers, CountryAttribute.FlankRatio)
  return { reserve, general, flankSize: army.flankSize, unitPreferences, unitDefinitions, flankRatio }
}

export const convertSides = (state: AppState): Side[] => {
  const sideA = getSide(state, SideType.A)
  const sideD = getSide(state, SideType.B)
  const armyA = sideA.participants.map(participant => getArmy(state, participant.countryName, participant.armyName))
  const armyD = sideD.participants.map(participant => getArmy(state, participant.countryName, participant.armyName))
  const settings = getSettings(state)
  return [convertSidesSub(state, sideA, armyA, armyD, settings), convertSidesSub(state, sideD, armyD, armyA, settings)]
}

const convertSidesSub = (
  state: AppState,
  side: SideData,
  armyDefinitions: ArmyDefinition[],
  enemyDefinitions: ArmyDefinition[],
  settings: Settings
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
  const settings = getSettings(state)
  return {
    day: 0,
    round: getRound(battle),
    terrains,
    settings,
    attacker: getAttacker(battle),
    mode: getMode(state)
  }
}

export const getSelectedTactic = (state: AppState, side: SideType, index: number): TacticDefinition => {
  const participant = getParticipant(state, side, index)
  const general = getGeneralDefinition(state, participant.countryName, participant.armyName)
  return state.tactics[general.tactic]
}

export const getUnitPreferences = (state: AppState, countryName: CountryName, armyName: ArmyName): UnitPreferences =>
  getArmyDefinition(state, countryName, armyName).unitPreferences

export const getFlankSize = (state: AppState, countryName: CountryName, armyName: ArmyName): number =>
  getArmyDefinition(state, countryName, armyName).flankSize

export const getCountry = (state: AppState, countryName: CountryName): Country => {
  const country = getCountryDefinition(state, countryName)
  return convertCountryDefinition(country, state.settings.siteSettings)
}
export const getCountryDefinition = (state: AppState, countryName: CountryName): CountryDefinition => {
  const country = state.countries[countryName]
  const modifiers = getCountryModifiers(country.modifiers)
  return { ...country, modifiers: applyCountryModifiers(country.modifiers, modifiers) }
}
const getArmyDefinition = (state: AppState, countryName: CountryName, armyName: ArmyName) =>
  state.countries[countryName].armies[armyName]

export const getGeneralDefinition = (state: AppState, countryName: CountryName, armyName: ArmyName): GeneralData => {
  const army = getArmyDefinition(state, countryName, armyName).general
  const modifiers = getGeneralModifiers(army)
  return manager.applyGeneralModifiers(army, modifiers)
}
export const getGeneral = (state: AppState, countryName: CountryName, armyName: ArmyName): GeneralDefinition =>
  manager.convertGeneralDefinition(
    getSiteSettings(state),
    getGeneralDefinition(state, countryName, armyName),
    state.tactics
  )

export const getMode = (state: AppState): Mode => state.settings.mode
export const getSelectedArmy = (state: AppState): ArmyName => keys(getArmies(state))[state.settings.army]

export const getArmies = (state: AppState, countryName?: CountryName) =>
  filterArmies(state.countries[countryName ?? state.settings.country], state.settings.mode)

export const getTacticDefinition = (state: AppState, countryName: CountryName, armyName: ArmyName): TacticDefinition =>
  state.tactics[getGeneralDefinition(state, countryName, armyName).tactic]

export const getTactic = (state: AppState, side: SideType) => {
  const cohorts = getCohorts(state, side)
  const tactic = getLeadingArmy(getCombatSide(state, side))?.tactic
  const opponent = getLeadingArmy(getCombatSide(state, getOpponent(side)))
  return tactic && opponent ? convertTactic(tactic, cohorts, opponent.tactic) : null
}

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
  const latest = manager.getLatestUnits(units, country[CountryAttribute.TechLevel])
  return manager.overrideRoleWithPreferences(army, units, latest)
}

export const getReserve = (
  state: AppState,
  countryName: CountryName,
  armyName: ArmyName,
  originals?: boolean
): ReserveDefinition => {
  const settings = getSettings(state)
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

export const getParticipant = (state: AppState, type: SideType, index: number, mode?: Mode): Participant =>
  getSide(state, type, mode).participants[index]
export const getParticipantSafely = (state: AppState, type: SideType, index: number, mode?: Mode): Participant =>
  getParticipant(state, type, index, mode) ?? getParticipant(state, type, 0, mode)

export const getSide = (state: AppState, type: SideType, mode?: Mode): SideData => getBattle(state, mode).sides[type]

export const useSelectedTerrains = (): Terrain[] => {
  const selected = useSelector((state: AppState) => getBattle(state).terrains)
  const terrains = useTerrains()
  return useMemo(() => selected.map(item => terrains[item]), [selected, terrains])
}

export const useTerrains = (): TerrainDefinitions => useSelector((state: AppState) => state.terrains)

export const useTerrainsAtLocation = (location: LocationType): Terrain[] => {
  const terrains = useTerrains()
  return useMemo(() => toArr(terrains).filter(item => item.location === location), [terrains, location])
}

export const getSelectedTerrains = (state: AppState): Terrain[] =>
  getBattle(state).terrains.map(value => state.terrains[value])

const getUnitDefinitionsSub = (state: AppState, countryName: CountryName, armyName: ArmyName) => {
  const country = state.countries[countryName]
  const units = country.units
  const general = getGeneralDefinition(state, countryName, armyName)
  const countryModifiers = getCountryModifiers(country.modifiers)
  const generalModifiers = getGeneralModifiers(general)
  return applyUnitModifiers(units, countryModifiers.concat(generalModifiers))
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
  const settings = getSiteSettings(state)
  countryName = countryName ?? state.settings.country
  armyName = armyName ?? getSelectedArmy(state)
  mode = mode ?? state.settings.mode

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
  countryName = countryName ?? state.settings.country
  armyName = armyName ?? getSelectedArmy(state)
  const units = getUnitDefinitions(state, countryName, armyName)
  return manager.getUnitList(units, mode, filterParent, getSiteSettings(state))
}

export const getUnitDefinition = (
  state: AppState,
  unitType: UnitType,
  countryName?: CountryName,
  armyName?: ArmyName
): UnitDefinition => {
  const settings = getSiteSettings(state)
  countryName = countryName ?? state.settings.country
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
