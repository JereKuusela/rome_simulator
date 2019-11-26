import { AppState } from "./index"
import { objGet, sumObj, map, reduce, toArr, filter, arrGet } from '../utils'
import { filterUnitDefinitions, isIncludedInMode, mergeUnits, getArmyPart } from '../army_utils'
import { TacticType, TacticDefinition } from "./tactics/actions"
import { mergeValues, DefinitionType, Mode } from "../base_definition"
import { TerrainType, TerrainDefinition } from "./terrains/actions"
import { UnitType, UnitDefinition, BaseUnit, Unit } from "./units/actions"
import { Battle, getDefaultMode, getDefaultBattle } from "./battle/reducer"
import { getDefaultArmy, Army as BaseArmy, Side, getDefaultParticipant, BaseUnits, Participant, Units, RowTypes, ArmyType } from "./battle/actions"
import { getDefaultCountryDefinitions } from "./countries/reducer"
import { CountryName } from "./countries"
import { getDefaultGlobals, getDefaultUnits } from "./units/data"
import { CombatSettings, getDefaultSettings } from "./settings"
import { UnitDefinitions, getDefaultBaseDefinitions, getDefaultUnitDefinitions } from "./units"
import { TerrainDefinitions, getDefaultTerrainDefinitions } from "./terrains";
import { TacticDefinitions, getDefaultTacticDefinitions } from "./tactics";
import { CombatUnits, CombatUnit } from "../combat/combat"

/**
 * Returns settings of the current mode.
 * @param state Application state.
 */
export const getCombatSettings = (state: AppState): CombatSettings => {
  return state.settings.combat[state.settings.mode]
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
export const filterTerrains = (state: AppState): TerrainDefinitions => {
  return filter(state.terrains, terrain => isIncludedInMode(state.settings.mode, terrain))
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
  filterUnitTypesByCountry(state, getParticipant(state, side).name)
)

/**
 * Returns unit types for the current mode and country.
 * @param state Application state.
 * @param country Country.
 */
export const filterUnitTypesByCountry = (state: AppState, country: CountryName): UnitType[] => {
  const units = filterUnitDefinitions(state.settings.mode, objGet(state.units, country, getDefaultUnits()))
  return toArr(units).map(unit => unit.type)
}

/**
 * Returns armies of the current mode.
 * @param state Application state.
 */
export const getBattle = (state: AppState): Battle => objGet(state.battle, state.settings.mode, getDefaultMode(state.settings.mode))



export const getArmyForCombat = (state: AppState, side: Side, mode?: Mode): ArmyForCombat => {
  const participant = state.battle[mode ?? state.settings.mode].participants[side]
  const name = participant.name
  const army = state.battle[state.settings.mode].armies[name]
  const country = state.countries[name]
  const units = getUnitsByCountry(state, name)
  const general = country.has_general ? country.general_martial + sumObj(country.trait_martial) : 0
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

export const getCountry = (state: AppState, side: Side): CountryName => {
  return state.battle[state.settings.mode].participants[side].name
}

const getBaseArmy = (state: AppState, side: Side)=> {
  const participant = state.battle[state.settings.mode].participants[side]
  const name = participant.name
  return state.battle[state.settings.mode].armies[name]
}

export const getArmyBySide = (state: AppState, side: Side): Army => getArmyByCountry(state, getParticipant(state, side).name)

const getArmyByCountry = (state: AppState, name: CountryName): Army => {
  const army = state.battle[state.settings.mode].armies[name]
  const country = state.countries[name]
  const units = filterUnitDefinitions(state.settings.mode, state.units[name])
  const global = state.global_stats[name][state.settings.mode]
  const general = {
    total: country.has_general ? country.general_martial + sumObj(country.trait_martial) : 0,
    base: country.has_general ? country.general_martial : 0,
    trait: country.has_general ? sumObj(country.trait_martial) : 0
  }
  const has_general = country.has_general
  return { ...army, general, name, units, global, has_general }
}

const getBaseUnitsBySide = (state: AppState, side: Side): BaseUnits => getBaseUnitsByCountry(state, getParticipant(state, side).name)

const getBaseUnitsByCountry = (state: AppState, name: CountryName): BaseUnits => {
  const battle = getBattle(state)
  const army = objGet(battle.armies, name, getDefaultArmy(state.settings.mode))
  return { frontline: army.frontline, reserve: army.reserve, defeated: army.defeated }
}


const getUnitsBySide = (state: AppState, side: Side): Units => getUnitsByCountry(state, getParticipant(state, side).name)

const getUnitsByCountry = (state: AppState, name: CountryName): Units => {
  const army = getBattle(state).armies[name]
  const units = filterUnitDefinitions(state.settings.mode, objGet(state.units, name, getDefaultUnits()))
  const global = state.global_stats[name][state.settings.mode]
  const frontline = army.frontline.map(value => value && mergeUnits(units, global, value))
  const reserve = army.reserve.map(value => mergeUnits(units, global, value))
  const defeated = army.defeated.map(value => mergeUnits(units, global, value))
  return { frontline, reserve, defeated }
}

export const getArmy = (state: AppState, type: Side): Army => getArmyBySide(state, type)

export const getBaseUnits = (state: AppState, type: Side): BaseUnits => getBaseUnitsBySide(state, type)

export const getUnits = (state: AppState, type: Side): Units => getUnitsBySide(state, type)

export const getParticipant = (state: AppState, type: Side): Participant => objGet(getBattle(state).participants, type, getDefaultParticipant(CountryName.Country1))

export const getSelected = (state: AppState): Army => getArmyByCountry(state, state.settings.country)

export const getSelectedTerrains = (state: AppState): TerrainDefinition[] => getBattle(state).terrains.map(value => state.terrains[value])

/**
 * Returns unit definitions for the current mode and side. Global definitions have already been merged.
 * @param state Application state.
 * @param side Attacker or defender.
 */
export const getUnitDefinitions = (state: AppState, side: Side): UnitDefinitions => getUnitDefinitionsByCountry(state, getParticipant(state, side).name)

export const getUnitDefinitionsByCountry = (state: AppState, name: CountryName): UnitDefinitions => {
  const global = objGet(state.global_stats, name, getDefaultGlobals())[state.settings.mode]
  const units = filterUnitDefinitions(state.settings.mode, objGet(state.units, name, getDefaultUnits()))
  return map(units, definition => mergeValues(definition, global))
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

export interface Army extends BaseArmy {
  general: {
    total: number
    base: number
    trait: number
  }
  name: CountryName
  units: UnitDefinitions
  global: UnitDefinition
  has_general: boolean
}

export interface ArmyForCombat extends Units {
  readonly tactic?: TacticDefinition
  readonly general: number
  readonly row_types: RowTypes
  readonly flank_size: number
}