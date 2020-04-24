import { AppState } from './index'
import { toArr, filter, arrGet, toObj, forEach2, keys } from 'utils'
import { filterUnitDefinitions, getArmyPart, convertCohortDefinitions, convertUnitDefinitions, convertUnitDefinition, shrinkUnits } from '../army_utils'
import { Mode, CountryName, Side, Cohort, ArmyType, UnitType, TerrainType, LocationType, TacticType, TacticDefinition, UnitPreferences, Participant, TerrainDefinition, Settings, Battle, TerrainDefinitions, TacticDefinitions, Cohorts, ArmyName, General, Countries, Setting, Reserve, Defeated, CountryAttribute, Units, Unit, GeneralDefinition, Country, CountryDefinition, CombatCohort, CombatCohorts, CombatParticipant } from 'types'
import { getDefaultBattle, getDefaultMode, getDefaultCountryDefinitions, getDefaultSettings, getDefaultTacticState, getDefaultTerrainState } from 'data'
import { uniq, flatten } from 'lodash'
import * as manager from 'managers/army'
import { calculateValue } from 'definition_values'
import { getCountryModifiers, getGeneralModifiers } from 'managers/modifiers'
import { convertCountryDefinition, applyCountryModifiers } from 'managers/countries'
import { applyUnitModifiers } from 'managers/units'
import { convertParticipant } from 'managers/battle'

/**
 * Returns settings of the current mode.
 * @param state Application state.
 */
export const getSettings = (state: AppState, mode?: Mode): Settings => {
  const settings = { ...state.settings.combatSettings[mode || state.settings.mode], ...state.settings.siteSettings }
  const attacker = getCountry(state, getParticipant(state, Side.Attacker).country)
  const defender = getCountry(state, getParticipant(state, Side.Defender).country)
  settings[Setting.CombatWidth] += Math.max(attacker[CountryAttribute.CombatWidth], defender[CountryAttribute.CombatWidth])
  settings[Setting.Precision] = Math.pow(10, settings[Setting.Precision])
  return settings
}

export const getSiteSettings = (state: AppState) => state.settings.siteSettings

export const findCohortById = (state: AppState, side: Side, id: number): Cohort | null => {
  const cohorts = getCohorts(state, side)
  let cohort = cohorts.reserve.find(unit => unit.id === id) || null
  if (cohort)
    return cohort
  cohort = flatten(cohorts.frontline).find(unit => unit ? unit.id === id : false) || null
  if (cohort)
    return cohort
  cohort = cohorts.defeated.find(unit => unit.id === id) || null
  if (cohort)
    return cohort
  return null
}

export const getCombatUnit = (state: AppState, side: Side, type: ArmyType, id: number | null): CombatCohort | null => {
  if (id === null)
    return null
  const units = getCurrentCombat(state, side)
  const army = getArmyPart(units, type)
  return flatten(army).find(unit => unit?.definition.id === id) ?? null
}

const findCombatUnit = (units: CombatCohorts, id: number): CombatCohort | null => {
  let unit = units.reserve.front.find(unit => unit.definition.id === id) || null
  if (unit)
    return unit
  unit = units.reserve.flank.find(unit => unit.definition.id === id) || null
  if (unit)
    return unit
  unit = units.reserve.support.find(unit => unit.definition.id === id) || null
  if (unit)
    return unit
  unit = flatten(units.frontline).find(unit => unit ? unit.definition.id === id : false) || null
  if (unit)
    return unit
  unit = units.defeated.find(unit => unit.definition.id === id) || null
  if (unit)
    return unit
  return null
}

export const getCombatUnitForEachRound = (state: AppState, side: Side, id: number) => {
  const rounds = state.battle[state.settings.mode].participants[side].rounds
  return rounds.map(participant => findCombatUnit(participant.cohorts, id))
}

/**
 * Returns unit types for the current mode from all armies.
 * @param state Application state.
 */
export const mergeUnitTypes = (state: AppState, ): UnitType[] => {
  const mode = getMode(state)
  return Array.from(keys(state.countries).reduce((previous, current) => {
    const units = manager.getActualUnits2(getUnits(state, current), mode)
    units.filter(unit => unit.mode === mode).forEach(unit => previous.add(unit.type))
    return previous
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
export const getBattle = (state: AppState): Battle => state.battle[state.settings.mode]

export const getCountries = (state: AppState): Countries => state.countries

const getUnitDefinitions = (state: AppState, country: CountryName) => {
  const definition = state.countries[country]
  const units = definition.units
  const general = getGeneralDefinition(state, country)
  const modifiers = getCountryModifiers(definition).concat(getGeneralModifiers(general))
  return applyUnitModifiers(units, modifiers)
}

export const getCurrentCombat = (state: AppState, side: Side): CombatCohorts => {
  const participant = state.battle[state.settings.mode].participants[side]
  return arrGet(participant.rounds, -1)?.cohorts ?? { frontline: [], reserve: { front: [], flank: [], support: [] }, defeated: [], left_flank: 0, right_flank: 0 }
}

export const getCombatParticipant = (state: AppState, side: Side, round?: number): CombatParticipant => {
  const participant = state.battle[state.settings.mode].participants[side]
  return participant.rounds[round ? round + 1 : participant.rounds.length - 1]
}

/** Helper function, should be checked and refactored. */
const getArmyForCombat = (state: AppState, side: Side, mode?: Mode) => {
  const participant = state.battle[mode ?? state.settings.mode].participants[side]
  const country = participant.country
  const army = getArmyDefinition(state, country)
  const cohorts = getCohorts(state, side)
  const general = getGeneral(state, country)
  const tactic = state.tactics[army.tactic]
  const definitions = getUnits(state, country)
  const flank_ratio = calculateValue(state.countries[country], CountryAttribute.FlankRatio)
  return { ...cohorts, tactic, general, flank_ratio, flank_size: army.flank_size, unit_preferences: army.unit_preferences, definitions }
}

export const initializeCombatParticipants = (state: AppState): CombatParticipant[] => {
  const mode = getMode(state)
  const battle = getBattle(state)
  const army_a = getArmyForCombat(state, Side.Attacker, mode)
  const army_d = getArmyForCombat(state, Side.Defender, mode)
  const terrains = battle.terrains.map(value => state.terrains[value])
  const settings = getSettings(state)
  return [
    convertParticipant(Side.Attacker, army_a, army_d, terrains, settings),
    convertParticipant(Side.Defender, army_d, army_a, terrains, settings)
  ]
}

export const getSelectedTactic = (state: AppState, side: Side): TacticDefinition => {
  const army = getArmyDefinitionBySide(state, side)
  return state.tactics[army.tactic]
}

export const getUnitPreferences = (state: AppState, side: Side): UnitPreferences => {
  const army = getArmyDefinitionBySide(state, side)
  return army.unit_preferences
}

export const getFlankSize = (state: AppState, side: Side): number => {
  const army = getArmyDefinitionBySide(state, side)
  return army.flank_size
}

export const getCountry = (state: AppState, country: CountryName): Country => {
  const definition = getCountryDefinition(state, country)
  return convertCountryDefinition(definition, state.settings.siteSettings)
}
export const getCountryDefinition = (state: AppState, country: CountryName): CountryDefinition => {
  const definition = state.countries[country]
  const modifiers = getCountryModifiers(definition)
  return applyCountryModifiers(definition, modifiers)
}
const getArmyDefinition = (state: AppState, country: CountryName) => state.countries[country].armies[state.settings.mode][ArmyName.Army1]

export const getGeneralDefinition = (state: AppState, country: CountryName): GeneralDefinition => {
  const definition = getArmyDefinition(state, country).general
  const modifiers = getGeneralModifiers(definition)
  return manager.applyGeneralModifiers(definition, modifiers)

}
export const getGeneral = (state: AppState, country: CountryName): General => manager.convertGeneralDefinition(getSiteSettings(state), getGeneralDefinition(state, country))

export const getMode = (state: AppState): Mode => state.settings.mode

const getArmyDefinitionBySide = (state: AppState, side: Side) => {
  const participant = state.battle[state.settings.mode].participants[side]
  const country = participant.country
  return getArmyDefinition(state, country)
}

export const getTactic = (state: AppState, side: Side): TacticDefinition => {
  const country = getParticipant(state, side).country
  const army = getArmyDefinition(state, country)
  return state.tactics[army.tactic]
}

export const getArmyDefinitionWithOverriddenUnits = (state: AppState, name: CountryName, originals?: boolean) => {
  const army = getArmyDefinition(state, name)
  if (originals)
    return army
  const units = getUnits(state, name)
  const country = getCountry(state, name)
  const latest = manager.getLatestUnits2(units, country[CountryAttribute.TechLevel])
  return manager.overrideRoleWithPreferences(army, units, latest)
}

export const getCohorts = (state: AppState, side: Side, originals?: boolean): Cohorts => {
  const settings = getSettings(state)
  const country = getParticipant(state, side).country
  const definition = getArmyDefinitionWithOverriddenUnits(state, country, originals)
  const frontline = [Array<Cohort | null>(settings[Setting.CombatWidth]).fill(null)]
  if (settings[Setting.BackRow])
    frontline.push([...frontline[0]])
  const cohorts = {
    frontline,
    reserve: definition.reserve as Reserve,
    defeated: definition.defeated as Defeated
  }
  forEach2(definition.frontline, (item, row, column) => cohorts.frontline[Number(row)][Number(column)] = item as Cohort)
  const units = getUnits(state, country)
  return convertCohortDefinitions(settings, cohorts, units)
}

export const getParticipant = (state: AppState, type: Side): Participant => getBattle(state).participants[type]

export const getSelectedTerrains = (state: AppState): TerrainDefinition[] => getBattle(state).terrains.map(value => state.terrains[value])

/**
 * Returns unit definitions for the current mode and side.
 * @param state Application state.
 * @param side Attacker or defender.
 */
export const getUnitDefinitionsBySide = (state: AppState, side: Side): Units => getUnits(state, getParticipant(state, side).country)

export const getUnits = (state: AppState, country?: CountryName): Units => {
  const settings = getSiteSettings(state)
  country = country ?? state.settings.country
  const mode = state.settings.mode
  const definitions = getUnitDefinitions(state, country)
  const general = getGeneralDefinition(state, country).definitions
  const units = convertUnitDefinitions(settings, definitions, general)
  return filterUnitDefinitions(mode, units)
}

export const getUnitTypeList = (state: AppState, filter_parent: boolean, name?: CountryName) => getUnitList(state, filter_parent, name).map(unit => unit.type)

export const getUnitList = (state: AppState, filter_parent: boolean, name?: CountryName): Unit[] => {
  const mode = getMode(state)
  name = name ?? state.settings.country
  const country = getCountry(state, name)
  const units = getUnits(state, name)
  return manager.getUnitList2(units, mode, country[CountryAttribute.TechLevel], filter_parent, getSiteSettings(state))
}

export const getUnit = (state: AppState, unit_type: UnitType, country?: CountryName): Unit => {
  const settings = getSiteSettings(state)
  country = country ?? state.settings.country
  const general = getGeneralDefinition(state, country).definitions
  const units = getUnitDefinitions(state, country)
  return convertUnitDefinition(settings, units, shrinkUnits(units), general, unit_type)
}

export const getUnitImages = (state: AppState): { [key in UnitType]: string[] } => {
  const definitions = toArr(state.countries).map(definitions => toArr(definitions.units)).flat(1)
  const unit_types = mergeUnitTypes(state)
  return toObj(unit_types, type => type, type => uniq(definitions.filter(value => value.type === type).map(value => value.image)))
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
