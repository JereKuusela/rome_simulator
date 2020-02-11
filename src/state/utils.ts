import { AppState } from './index'
import { reduce, toArr, filter, arrGet, toObj, forEach2 } from 'utils'
import { filterUnitDefinitions, isIncludedInMode, getArmyPart, mergeBaseUnitsWithDefinitions, mergeDefinitions, mergeDefinition, findUnitById } from '../army_utils'
import { Mode, DefinitionType, CountryName, BaseCohort, Side, Cohort, ArmyType, UnitType, TerrainType, LocationType, TacticType, Tactic, UnitPreferences, BaseCohorts, Participant, Terrain, Unit, Settings, Battle, Terrains, Tactics, Cohorts, Units, ArmyName, GeneralStats, Countries, Setting, Reserve, Defeated, CountryAttribute } from 'types'
import { CombatUnit, CombatUnits } from 'combat'
import { getDefaultBattle, getDefaultMode, getDefaultCountryDefinitions, getDefaultSettings, getDefaultTacticState, getDefaultTerrainState } from 'data'
import { sortBy, uniq, flatten } from 'lodash'
import * as manager from 'managers/army'
import { mergeValues, calculateValue } from 'definition_values'

/**
 * Returns settings of the current mode.
 * @param state Application state.
 */
export const getSettings = (state: AppState, mode?: Mode): Settings => {
  const settings =  { ...state.settings.combatSettings[mode || state.settings.mode], ...state.settings.siteSettings }
  const attacker = getCountries(state)[getCountry(state, Side.Attacker)]
  const defender = getCountries(state)[getCountry(state, Side.Defender)]
  settings[Setting.CombatWidth] += Math.max(calculateValue(attacker, CountryAttribute.CombatWidth), calculateValue(defender, CountryAttribute.CombatWidth))
  return settings
}

export const findBaseUnit = (state: AppState, country: CountryName, id: number): BaseCohort | null => {
  const units = getBaseCohortsByCountry(state, country)
  return findUnitById(units, id) ?? null
}

export const findUnit = (state: AppState, side: Side, id: number): Cohort | null => {
  const units = getCohortsBySide(state, side)
  let unit = units.reserve.find(unit => unit.id === id) || null
  if (unit)
    return unit
  unit = flatten(units.frontline).find(unit => unit ? unit.id === id : false) || null
  if (unit)
    return unit
  unit = units.defeated.find(unit => unit.id === id) || null
  if (unit)
    return unit
  return null
}

export const getCombatUnit = (state: AppState, side: Side, type: ArmyType, id: number | null): CombatUnit | null => {
  if (id === null)
    return null
  const units = getCurrentCombat(state, side)
  const army = getArmyPart(units, type)
  return flatten(army).find(unit => unit?.definition.id === id) ?? null
}

const findCombatUnit = (units: CombatUnits, id: number): CombatUnit | null => {
  let unit = units.reserve.find(unit => unit.definition.id === id) || null
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
  return rounds.map(units => findCombatUnit(units, id))
}

/**
 * Returns unit types for the current mode from all armies.
 * @param state Application state.
 */
export const mergeUnitTypes = (state: AppState, mode?: Mode): UnitType[] => {
  return Array.from(reduce(state.countries, (previous, current) => {
    const arr = toArr(current.units)
    arr.filter(unit => isIncludedInMode(mode ?? state.settings.mode, unit)).forEach(unit => previous.add(unit.type))
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
export const filterTerrains = (state: AppState, location?: LocationType): Terrains => {
  return filter(state.terrains, terrain => isIncludedInMode(state.settings.mode, terrain) && (!location || terrain.location === location))
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
export const filterTactics = (state: AppState): Tactics => {
  return filter(state.tactics, tactic => isIncludedInMode(state.settings.mode, tactic))
}


/**
 * Returns unit types for the current mode and side.
 * @param state Application state.
 * @param side Attacker or defender.
 */
export const filterUnitTypesBySide = (state: AppState, side: Side): UnitType[] => (
  filterUnitTypesByCountry(state, getParticipant(state, side).country)
)

/**
 * Returns unit types for the current mode and country.
 * @param state Application state.
 * @param country Country.
 */
export const filterUnitTypesByCountry = (state: AppState, country: CountryName): UnitType[] => {
  const definitions = filterUnitDefinitions(state.settings.mode, getUnits(state, country))
  const sorted = sortBy(toArr(definitions), definition => manager.unitSorter(definition, state.settings.mode))
  return sorted.map(unit => unit.type)
}

/**
 * Returns armies of the current mode.
 * @param state Application state.
 */
export const getBattle = (state: AppState): Battle => state.battle[state.settings.mode]

export const getCountries = (state: AppState): Countries => state.countries

const getUnits = (state: AppState, country: CountryName) => getCountries(state)[country].units

export const getArmyForCombat = (state: AppState, side: Side, mode?: Mode): ArmyForCombat => {
  const participant = state.battle[mode ?? state.settings.mode].participants[side]
  const country = participant.country
  const army = getArmy(state, country)
  const units = getCohortsByCountry(state, country)
  const general = getGeneralStats(state, country).martial
  const tactic = state.tactics[army.tactic]
  const definitions = getUnitDefinitions(state, country)
  return { ...units, tactic, general, flank_size: army.flank_size, unit_preferences: army.unit_preferences, definitions }
}

export const getCurrentCombat = (state: AppState, side: Side): CombatUnits => {
  const participant = state.battle[state.settings.mode].participants[side]
  return arrGet(participant.rounds, -1) ?? { frontline: [], reserve: [], defeated: [], tactic_bonus: 0 }
}

export const getSelectedTactic = (state: AppState, side: Side): Tactic => {
  const army = getBaseArmy(state, side)
  return state.tactics[army.tactic]
}

export const getUnitPreferences = (state: AppState, side: Side): UnitPreferences => {
  const army = getBaseArmy(state, side)
  return  army.unit_preferences
}

export const getFlankSize = (state: AppState, side: Side): number => {
  const army = getBaseArmy(state, side)
  return  army.flank_size
}

export const getCountry = (state: AppState, side: Side): CountryName => {
  return state.battle[state.settings.mode].participants[side].country
}

const getGeneral = (state: AppState, country: CountryName) => getArmy(state, country).general
const getArmy = (state: AppState, country: CountryName) => state.countries[country].armies[state.settings.mode][ArmyName.Army1]

export const getGeneralStats = (state: AppState, country: CountryName): GeneralStats => manager.getGeneralStats(getGeneral(state, country))

export const getMode = (state: AppState): Mode => state.settings.mode

const getBaseArmy = (state: AppState, side: Side)=> {
  const participant = state.battle[state.settings.mode].participants[side]
  const country = participant.country
  return getArmy(state, country)
}

export const getTactic = (state: AppState, side: Side): Tactic => {
  const country = getParticipant(state, side).country
  const army = getArmy(state, country)
  return state.tactics[army.tactic]
}

const getBaseCohortsBySide = (state: AppState, side: Side): BaseCohorts => getBaseCohortsByCountry(state, getParticipant(state, side).country)

const getBaseCohortsByCountry = (state: AppState, country: CountryName): BaseCohorts => {
  const army = getArmy(state, country)
  return { frontline: army.frontline, reserve: army.reserve, defeated: army.defeated }
}


const getCohortsBySide = (state: AppState, side: Side): Cohorts => getCohortsByCountry(state, getParticipant(state, side).country)

const getCohortsByCountry = (state: AppState, country: CountryName): Cohorts => {
  const settings = getSettings(state)
  const base = getBaseCohortsByCountry(state, country)
  const frontline = [Array<Cohort | null>(settings[Setting.CombatWidth]).fill(null)]
  if (settings[Setting.BackRow])
    frontline.push([...frontline[0]])
  const cohorts = {
    frontline,
    reserve: base.reserve as Reserve,
    defeated: base.defeated as Defeated
  }
  forEach2(base.frontline, (item, row, column) => cohorts.frontline[Number(row)][Number(column)] = item as Cohort)
  const definitions = getUnitDefinitions(state, country)
  return mergeBaseUnitsWithDefinitions(cohorts, definitions)
}

export const getBaseCohorts = (state: AppState, type: Side): BaseCohorts => getBaseCohortsBySide(state, type)

export const getCohorts = (state: AppState, type: Side): Cohorts => getCohortsBySide(state, type)

export const getParticipant = (state: AppState, type: Side): Participant => getBattle(state).participants[type]

export const getSelectedTerrains = (state: AppState): Terrain[] => getBattle(state).terrains.map(value => state.terrains[value])

/**
 * Returns unit definitions for the current mode and side. Global definitions have already been merged.
 * @param state Application state.
 * @param side Attacker or defender.
 */
export const getUnitDefinitionsBySide = (state: AppState, side: Side): Units => getUnitDefinitions(state, getParticipant(state, side).country)

export const getUnitDefinitions = (state: AppState, country?: CountryName): Units => {
  country = country ?? state.settings.country
  const mode = state.settings.mode
  const definitions = filterUnitDefinitions(mode, getUnits(state, country))
  const general_base = manager.getGeneralBaseDefinition(getGeneral(state, country), mode)
  const general = manager.getGeneralDefinitions(getGeneral(state, country))
  return mergeDefinitions(definitions, general_base, general)
}

export const getUnitDefinition = (state: AppState, unit_type: UnitType, country?: CountryName): Unit => {
  country = country ?? state.settings.country
  const mode = state.settings.mode
  const unit = getUnits(state, country)[unit_type]
  const base = getUnits(state, country)[unit.base]
  const general_base = manager.getGeneralBaseDefinition(getGeneral(state, country), mode)
  const general = manager.getGeneralDefinition(getGeneral(state, country), unit_type)
  return mergeDefinition(base, unit, general_base, general)
}

export const getBaseDefinition = (state: AppState, country?: CountryName): Unit => {
  country = country ?? state.settings.country
  const base = getUnits(state, country)[manager.getBaseUnitType(state.settings.mode)]
  const general = manager.getGeneralBaseDefinition(getGeneral(state, country), state.settings.mode)
  return mergeValues(base, general)
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
  if (!data.battle[DefinitionType.Land])
    data.battle[DefinitionType.Land] = getDefaultMode(DefinitionType.Land)
  if (!data.battle[DefinitionType.Naval])
    data.battle[DefinitionType.Naval] = getDefaultMode(DefinitionType.Naval)
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
  data.battle =  getDefaultBattle()
  data.settings = getDefaultSettings()
  data.countries = getDefaultCountryDefinitions()
}

export interface ArmyForCombat extends Cohorts {
  tactic?: Tactic
  definitions: Units
  general: number
  unit_preferences: UnitPreferences
  flank_size: number
}