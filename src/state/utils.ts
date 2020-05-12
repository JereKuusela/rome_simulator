import { AppState } from './index'
import { toArr, filter, arrGet, toObj, keys } from 'utils'
import { filterUnitDefinitions, getArmyPart, convertReserveDefinitions, convertUnitDefinitions, convertUnitDefinition, shrinkUnits } from '../army_utils'
import { Mode, CountryName, SideType, CohortDefinition, ArmyPart, UnitType, TerrainType, LocationType, TacticType, TacticDefinition, UnitPreferences, Participant, TerrainDefinition, Settings, Battle, TerrainDefinitions, TacticDefinitions, ArmyName, GeneralDefinition, Countries, Setting, ReserveDefinition, CountryAttribute, Units, UnitDefinition, GeneralData, Country, CountryDefinition, Cohort, Cohorts, SideData, Side, Environment, ArmyDefinition } from 'types'
import { getDefaultBattle, getDefaultMode, getDefaultCountryDefinitions, getDefaultSettings, getDefaultTacticState, getDefaultTerrainState } from 'data'
import { uniq, flatten } from 'lodash'
import * as manager from 'managers/army'
import { getCountryModifiers, getGeneralModifiers, getSecondaryCountryModifiers } from 'managers/modifiers'
import { convertCountryDefinition, applyCountryModifiers, filterArmies } from 'managers/countries'
import { applyUnitModifiers } from 'managers/units'
import { convertArmy, convertSide } from 'managers/battle'
import { iterateCohorts } from 'combat'

/**
 * Returns settings of the current mode.
 * @param state Application state.
 */
export const getSettings = (state: AppState, mode?: Mode): Settings => {
  const settings = { ...state.settings.combatSettings[mode || state.settings.mode], ...state.settings.siteSettings }
  const attacker = getCountry(state, getParticipant(state, SideType.Attacker, 0).countryName)
  const defender = getCountry(state, getParticipant(state, SideType.Defender, 0).countryName)
  settings[Setting.CombatWidth] += Math.max(attacker[CountryAttribute.CombatWidth], defender[CountryAttribute.CombatWidth])
  settings[Setting.Precision] = Math.pow(10, settings[Setting.Precision])
  return settings
}

export const getSiteSettings = (state: AppState) => state.settings.siteSettings

export const getCohort = (state: AppState, country: CountryName, army: ArmyName, index: number): CohortDefinition => getReserve(state, country, army)[index]

/** Returns combat unit  */
export const getCombatUnit = (state: AppState, side: SideType, part: ArmyPart, row: number, column: number): Cohort | null => getArmyPart(getCurrentCombat(state, side), part)[row][column]

// Note this doesn't work because units may move (should use participant index and index to search..., from all parts).
export const getCombatUnitForEachRound = (state: AppState, side: SideType, participantIndex: number, index: number) => {
  const rounds = state.battle[state.settings.mode].sides[side].rounds
  return rounds.map(side => {
    let result = null
    iterateCohorts(side.cohorts, cohort => {
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
  return Array.from(keys(state.countries).reduce((previous, countryName) => {
    return keys(getArmies(state, countryName)).reduce((previous, armyName) => {
      const units = manager.getActualUnits(getUnits(state, countryName, armyName), mode)
      units.filter(unit => unit.mode === mode).forEach(unit => previous.add(unit.type))
      return previous
    }, previous)
  }, new Set<UnitType>()))
}

/**
 * Returns terrain types for the current mode.
 * @param state Application state.
 */
export const filterTerrainTypes = (state: AppState): TerrainType[] => {
  return toArr(filterTerrains(state), terrain => terrain.type)
}

/**
 * Returns terrains for the current mode.
 * @param state Application state.
 */
export const filterTerrains = (state: AppState, location?: LocationType): TerrainDefinitions => {
  return filter(state.terrains, terrain => terrain.mode === state.settings.mode && (!location || terrain.location === location))
}

/**
 * Returns tactic types for the current mode.
 * @param state Application state.
 */
export const filterTacticTypes = (state: AppState): TacticType[] => {
  return toArr(filterTactics(state), tactic => tactic.type)
}

/**
 * Returns tactics for the current mode.
 * @param state Application state.
 */
export const filterTactics = (state: AppState): TacticDefinitions => {
  return filter(state.tactics, tactic => tactic.mode === state.settings.mode)
}

/**
 * Returns armies of the current mode.
 * @param state Application state.
 */
export const getBattle = (state: AppState, mode?: Mode): Battle => state.battle[mode ?? state.settings.mode]

export const getCountries = (state: AppState): Countries => state.countries

export const getUnitDefinitions = (state: AppState, countryName: CountryName, armyName: ArmyName) => {
  const country = state.countries[countryName]
  const units = country.units
  const general = getGeneralDefinition(state, countryName, armyName)
  const countryModifiers = getCountryModifiers(country)
  const secondaryCountryModifiers = getSecondaryCountryModifiers(applyCountryModifiers(country, countryModifiers))
  const generalModifiers = getGeneralModifiers(general)
  return applyUnitModifiers(units, countryModifiers.concat(secondaryCountryModifiers).concat(generalModifiers))
}

const getUnitTypes = (state: AppState, countryName: CountryName) => toArr(state.countries[countryName].units, unit => unit).filter(unit => unit.mode === state.settings.mode).map(unit => unit.type)

export const getCurrentCombat = (state: AppState, sideType: SideType): Cohorts => {
  const side = getSide(state, sideType)
  return arrGet(side.rounds, -1)?.cohorts ?? { frontline: [], reserve: { front: [], flank: [], support: [] }, defeated: [] }
}

export const getCombatSide = (state: AppState, sideType: SideType, round?: number): Side => {
  const side = getSide(state, sideType)
  return side.rounds[round ? round + 1 : side.rounds.length - 1]
}

const getArmy = (state: AppState, countryName: CountryName, armyName: ArmyName): ArmyDefinition => {
  const army = getArmyDefinition(state, countryName, armyName)
  const reserve = getReserve(state, countryName, armyName)
  const general = getGeneral(state, countryName, armyName)
  const settings = getSiteSettings(state)
  const unitPreferences = settings[Setting.CustomDeployment] ? army.unitPreferences : {} as UnitPreferences
  //const flankRatio = calculateValue(state.countries[countryName], CountryAttribute.FlankRatio)
  return { reserve, general, flankSize: army.flankSize, unitPreferences }
}

export const convertSides = (state: AppState): Side[] => {
  const attacker = getSide(state, SideType.Attacker)
  const defender = getSide(state, SideType.Defender)
  const settings = getSettings(state)
  return [
    convertSidesSub(state, attacker, defender, settings),
    convertSidesSub(state, defender, attacker, settings)
  ]
}

const convertSidesSub = (state: AppState, side: SideData, enemy: SideData, settings: Settings): Side => {
  const terrains = getSelectedTerrains(state)
  const enemyTypes = uniq(flatten(enemy.participants.map(participant => getUnitTypes(state, participant.countryName))))
  const armies = side.participants.map((participant, index) => convertArmy(index, participant, getArmy(state, participant.countryName, participant.armyName), enemyTypes, terrains, settings))
  armies.sort((a, b) => b.arrival - a.arrival)
  return convertSide(side, armies, settings)
}

export const getCombatField = (state: AppState): Environment => {
  const battle = getBattle(state)
  const terrains = battle.terrains.map(value => state.terrains[value])
  const settings = getSettings(state)
  return {
    round: 0,
    terrains,
    settings
  }
}

export const getSelectedTactic = (state: AppState, side: SideType, index: number): TacticDefinition => {
  const participant = getParticipant(state, side, index)
  const general = getGeneralDefinition(state, participant.countryName, participant.armyName)
  return state.tactics[general.tactic]
}

export const getUnitPreferences = (state: AppState, countryName: CountryName, armyName: ArmyName): UnitPreferences => getArmyDefinition(state, countryName, armyName).unitPreferences

export const getFlankSize = (state: AppState, countryName: CountryName, armyName: ArmyName): number => getArmyDefinition(state, countryName, armyName).flankSize

export const getCountry = (state: AppState, countryName: CountryName): Country => {
  const country = getCountryDefinition(state, countryName)
  return convertCountryDefinition(country, state.settings.siteSettings)
}
export const getCountryDefinition = (state: AppState, countryName: CountryName): CountryDefinition => {
  let country = state.countries[countryName]
  const modifiers = getCountryModifiers(country)
  country = applyCountryModifiers(country, modifiers)
  return applyCountryModifiers(country, getSecondaryCountryModifiers(country))
}
const getArmyDefinition = (state: AppState, countryName: CountryName, armyName: ArmyName) => state.countries[countryName].armies[armyName]

export const getGeneralDefinition = (state: AppState, countryName: CountryName, armyName: ArmyName): GeneralData => {
  const army = getArmyDefinition(state, countryName, armyName).general
  const modifiers = getGeneralModifiers(army)
  return manager.applyGeneralModifiers(army, modifiers)

}
export const getGeneral = (state: AppState, countryName: CountryName, armyName: ArmyName): GeneralDefinition => manager.convertGeneralDefinition(getSiteSettings(state), getGeneralDefinition(state, countryName, armyName), state.tactics)

export const getMode = (state: AppState): Mode => state.settings.mode
export const getSelectedArmy = (state: AppState): ArmyName => keys(getArmies(state))[state.settings.army]

export const getArmies = (state: AppState, countryName?: CountryName) => filterArmies(state.countries[countryName ?? state.settings.country], state.settings.mode)

export const getTactic = (state: AppState, countryName: CountryName, armyName: ArmyName): TacticDefinition => state.tactics[getGeneralDefinition(state, countryName, armyName).tactic]

export const getOverridenReserveDefinitions = (state: AppState, countryName: CountryName, armyName: ArmyName, originals?: boolean) => {
  const army = getArmyDefinition(state, countryName, armyName)
  if (originals)
    return army.reserve
  const units = getUnits(state, countryName, armyName)
  const country = getCountry(state, countryName)
  const latest = manager.getLatestUnits(units, country[CountryAttribute.TechLevel])
  return manager.overrideRoleWithPreferences(army, units, latest)
}

export const getReserve = (state: AppState, countryName: CountryName, armyName: ArmyName, originals?: boolean): ReserveDefinition => {
  const settings = getSettings(state)
  const definition = getOverridenReserveDefinitions(state, countryName, armyName, originals)
  const units = getUnits(state, countryName, armyName)
  return convertReserveDefinitions(settings, definition as ReserveDefinition, units)
}

export const getParticipant = (state: AppState, type: SideType, index: number, mode?: Mode): Participant => getSide(state, type, mode).participants[index]
export const getFirstParticipant = (state: AppState, type: SideType, mode?: Mode): Participant => getSide(state, type, mode).participants[0]

export const getSide = (state: AppState, type: SideType, mode?: Mode): SideData => getBattle(state, mode).sides[type]

export const getSelectedTerrains = (state: AppState): TerrainDefinition[] => getBattle(state).terrains.map(value => state.terrains[value])

export const getUnits = (state: AppState, countryName?: CountryName, armyName?: ArmyName, mode?: Mode): Units => {
  const settings = getSiteSettings(state)
  countryName = countryName ?? state.settings.country
  armyName = armyName ?? getSelectedArmy(state)
  mode = mode ?? state.settings.mode

  const definitions = getUnitDefinitions(state, countryName, armyName)
  const general = getGeneralDefinition(state, countryName, armyName).definitions
  const units = convertUnitDefinitions(settings, definitions, general)
  return filterUnitDefinitions(mode, units)
}

export const getUnitTypeList = (state: AppState, filterParent: boolean, countryName?: CountryName) => getUnitList(state, filterParent, countryName).map(unit => unit.type)

export const getUnitList = (state: AppState, filterParent: boolean, countryName?: CountryName, armyName?: ArmyName): UnitDefinition[] => {
  const mode = getMode(state)
  countryName = countryName ?? state.settings.country
  armyName = armyName ?? getSelectedArmy(state)
  const units = getUnits(state, countryName, armyName)
  return manager.getUnitList2(units, mode, filterParent, getSiteSettings(state))
}

export const getUnit = (state: AppState, unitType: UnitType, countryName?: CountryName, armyName?: ArmyName): UnitDefinition => {
  const settings = getSiteSettings(state)
  countryName = countryName ?? state.settings.country
  armyName = armyName ?? getSelectedArmy(state)
  const general = getGeneralDefinition(state, countryName, armyName).definitions
  const units = getUnitDefinitions(state, countryName, armyName)
  return convertUnitDefinition(settings, units, shrinkUnits(units), general, unitType)
}

export const getUnitImages = (state: AppState): { [key in UnitType]: string[] } => {
  const definitions = toArr(state.countries).map(definitions => toArr(definitions.units)).flat(1)
  const unitTypes = mergeUnitTypes(state)
  return toObj(unitTypes, type => type, type => uniq(definitions.filter(value => value.type === type).map(value => value.image)))
}

/**
 * Resets missing data by using the default data.
 * @param data 
 */
export const resetMissing = (data: AppState) => {
  data.tactics = data.tactics || getDefaultTacticState()
  data.terrains = data.terrains || getDefaultTerrainState()
  data.battle = data.battle || getDefaultBattle()
  if (!data.battle[Mode.Land])
    data.battle[Mode.Land] = getDefaultMode(Mode.Land)
  if (!data.battle[Mode.Naval])
    data.battle[Mode.Naval] = getDefaultMode(Mode.Naval)
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
