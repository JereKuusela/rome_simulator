import { AppState } from './index'
import { reduce, toArr, filter, arrGet, toObj } from '../utils'
import { filterUnitDefinitions, isIncludedInMode, getArmyPart, mergeBaseUnitsWithDefinitions, mergeDefinitions, mergeDefinition } from '../army_utils'
import { Mode, DefinitionType } from 'base_definition'
import { CountryName, BaseUnit, Side, Unit, ArmyType, UnitType, TerrainType, LocationType, TacticType, TacticDefinition, RowTypes, BaseUnits, Units, Participant, TerrainDefinition, UnitDefinition, Settings } from 'types'
import { CombatUnit, CombatUnits } from 'combat/combat'
import { TerrainDefinitions, TacticDefinitions } from 'data'
import { sortBy, uniq } from 'lodash'
import { unitSorter, GeneralStats, getGeneralStats, getGeneralBaseDefinition, getGeneralDefinitions, getGeneralDefinition } from 'managers/army_manager'
import { Battle, getDefaultBattle, getDefaultMode } from 'reducers/battle'
import { UnitDefinitions, getDefaultBaseDefinitions, getDefaultUnitDefinitions } from 'reducers/units'
import { mergeValues } from 'definition_values'
import { getDefaultTacticDefinitions } from 'reducers/tactics'
import { getDefaultTerrainDefinitions } from 'reducers/terrains'
import { getDefaultCountryDefinitions } from 'reducers/countries'
import { getDefaultSettings } from 'reducers/settings'

/**
 * Returns settings of the current mode.
 * @param state Application state.
 */
export const getSettings = (state: AppState, mode?: Mode): Settings => {
  return { ...state.settings.combatSettings[mode || state.settings.mode], ...state.settings.siteSettings }
}

export const findBaseUnit = (state: AppState, country: CountryName, id: number): BaseUnit | null => {
  const units = getBaseUnitsByCountry(state, country)
  let unit = units.reserve.find(unit => unit.id === id) || null
  if (unit)
    return unit
  unit = units.frontline.find(unit => unit ? unit.id === id : false) || null
  if (unit)
    return unit
  unit = units.defeated.find(unit => unit.id === id) || null
  if (unit)
    return unit
  return null
}

export const findUnit = (state: AppState, side: Side, id: number): Unit | null => {
  const units = getUnitsBySide(state, side)
  let unit = units.reserve.find(unit => unit.id === id) || null
  if (unit)
    return unit
  unit = units.frontline.find(unit => unit ? unit.id === id : false) || null
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
  return army.find(unit => unit?.definition.id === id) ?? null
}

const findCombatUnit = (units: CombatUnits, id: number): CombatUnit | null => {
  let unit = units.reserve.find(unit => unit.definition.id === id) || null
  if (unit)
    return unit
  unit = units.frontline.find(unit => unit ? unit.definition.id === id : false) || null
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
  return Array.from(reduce(state.units, (previous, current) => {
    const arr = toArr(current)
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
export const filterTerrains = (state: AppState, location?: LocationType): TerrainDefinitions => {
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
export const filterTactics = (state: AppState): TacticDefinitions => {
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
  const definitions = filterUnitDefinitions(state.settings.mode, state.units[country])
  const sorted = sortBy(toArr(definitions), definition => unitSorter(definition, state.settings.mode))
  return sorted.map(unit => unit.type)
}

/**
 * Returns armies of the current mode.
 * @param state Application state.
 */
export const getBattle = (state: AppState): Battle => state.battle[state.settings.mode]



export const getArmyForCombat = (state: AppState, side: Side, mode?: Mode): ArmyForCombat => {
  const participant = state.battle[mode ?? state.settings.mode].participants[side]
  const name = participant.country
  const army = state.battle[state.settings.mode].armies[name]
  const units = getUnitsByCountry(state, name)
  const general = getGeneral(state, name).martial
  const tactic = state.tactics[army.tactic]
  return { ...units, tactic, general, flank_size: army.flank_size, row_types: army.row_types }
}

export const getCurrentCombat = (state: AppState, side: Side): CombatUnits => {
  const participant = state.battle[state.settings.mode].participants[side]
  return arrGet(participant.rounds, -1) ?? { frontline: [], reserve: [], defeated: [], tactic_bonus: 0 }
}

export const getSelectedTactic = (state: AppState, side: Side): TacticDefinition => {
  const army = getBaseArmy(state, side)
  return state.tactics[army.tactic]
}

export const getRowTypes = (state: AppState, side: Side): RowTypes => {
  const army = getBaseArmy(state, side)
  return  army.row_types
}

export const getFlankSize = (state: AppState, side: Side): number => {
  const army = getBaseArmy(state, side)
  return  army.flank_size
}

export const getCountry = (state: AppState, side: Side): CountryName => {
  return state.battle[state.settings.mode].participants[side].country
}

export const getGeneral = (state: AppState, country: CountryName): GeneralStats => getGeneralStats(state.countries[country].general)

export const getMode = (state: AppState): Mode => state.settings.mode

const getBaseArmy = (state: AppState, side: Side)=> {
  const participant = state.battle[state.settings.mode].participants[side]
  const name = participant.country
  return state.battle[state.settings.mode].armies[name]
}

export const getTactic = (state: AppState, side: Side): TacticDefinition => {
  const country = getParticipant(state, side).country
  const army = state.battle[state.settings.mode].armies[country]
  return state.tactics[army.tactic]
}

const getBaseUnitsBySide = (state: AppState, side: Side): BaseUnits => getBaseUnitsByCountry(state, getParticipant(state, side).country)

const getBaseUnitsByCountry = (state: AppState, name: CountryName): BaseUnits => {
  const battle = getBattle(state)
  const army = battle.armies[name]
  return { frontline: army.frontline, reserve: army.reserve, defeated: army.defeated }
}


const getUnitsBySide = (state: AppState, side: Side): Units => getUnitsByCountry(state, getParticipant(state, side).country)

const getUnitsByCountry = (state: AppState, country: CountryName): Units => {
  const army = getBattle(state).armies[country]
  const definitions = getUnitDefinitions(state, country)
  return mergeBaseUnitsWithDefinitions(army, definitions)
}

export const getBaseUnits = (state: AppState, type: Side): BaseUnits => getBaseUnitsBySide(state, type)

export const getUnits = (state: AppState, type: Side): Units => getUnitsBySide(state, type)

export const getParticipant = (state: AppState, type: Side): Participant => getBattle(state).participants[type]

export const getSelectedTerrains = (state: AppState): TerrainDefinition[] => getBattle(state).terrains.map(value => state.terrains[value])

/**
 * Returns unit definitions for the current mode and side. Global definitions have already been merged.
 * @param state Application state.
 * @param side Attacker or defender.
 */
export const getUnitDefinitionsBySide = (state: AppState, side: Side): UnitDefinitions => getUnitDefinitions(state, getParticipant(state, side).country)

export const getUnitDefinitions = (state: AppState, country?: CountryName): UnitDefinitions => {
  country = country ?? state.settings.country
  const base = state.global_stats[country][state.settings.mode]
  const definitions = filterUnitDefinitions(state.settings.mode, state.units[country])
  const general_base = getGeneralBaseDefinition(state.countries[country].general, state.settings.mode)
  const general = getGeneralDefinitions(state.countries[country].general)
  return mergeDefinitions(base, definitions, general_base, general)
}

export const getUnitDefinition = (state: AppState, unit_type: UnitType, country?: CountryName): UnitDefinition => {
  country = country ?? state.settings.country
  const global = state.global_stats[country][state.settings.mode]
  const unit = state.units[country][unit_type]
  const general_base = getGeneralBaseDefinition(state.countries[country].general, state.settings.mode)
  const general = getGeneralDefinition(state.countries[country].general, unit_type)
  return mergeDefinition(global, unit, general_base, general)
}

export const getBaseDefinition = (state: AppState, country?: CountryName): UnitDefinition => {
  country = country ?? state.settings.country
  const global = state.global_stats[country][state.settings.mode]
  const general = getGeneralBaseDefinition(state.countries[country].general, state.settings.mode)
  return mergeValues(global, general)
}

export const getUnitImages = (state: AppState): { [key in UnitType]: string[] } => {
  const definitions = toArr(state.units).map(definitions => toArr(definitions)).flat(1)
  const unit_types = mergeUnitTypes(state)
  return toObj(unit_types, type => type, type => uniq(definitions.filter(value => value.type === type).map(value => value.image)))
}

/**
 * Resets missing data by using the default data.
 * @param data 
 */
export const resetMissing = (data: AppState) => {
  data.global_stats = data.global_stats || getDefaultBaseDefinitions()
  data.tactics = data.tactics || getDefaultTacticDefinitions()
  data.terrains = data.terrains || getDefaultTerrainDefinitions()
  data.units = data.units || getDefaultUnitDefinitions()
  data.battle = data.battle || getDefaultBattle()
  if (!data.battle[DefinitionType.Land])
    data.battle[DefinitionType.Land] = getDefaultMode(DefinitionType.Land)
  if (!data.battle[DefinitionType.Naval])
    data.battle[DefinitionType.Naval] = getDefaultMode(DefinitionType.Naval)
  data.settings = data.settings || getDefaultSettings()
  data.countries = data.countries || getDefaultCountryDefinitions()
  return data
}

export interface ArmyForCombat extends Units {
  readonly tactic?: TacticDefinition
  readonly general: number
  readonly row_types: RowTypes
  readonly flank_size: number
}