import { AppState } from "./index"
import { objGet, sumObj, map, reduce, toArr, filter, arrGet } from '../utils'
import { filterUnitDefinitions, isIncludedInMode, mergeUnits } from '../army_utils'
import { TacticType } from "./tactics/actions"
import { mergeValues } from "../base_definition"
import { TerrainType } from "./terrains/actions"
import { UnitType, UnitDefinition } from "./units/actions"
import { Battle, modeState } from "./battle/reducer"
import { getDefaultArmy, Army as BaseArmy, Side, getDefaultParticipant, BaseUnits, Participant, Units } from "./battle/actions"
import { defaultCountry } from "./countries/reducer"
import { CountryName } from "./countries"
import { getDefaultGlobals, getDefaultUnits } from "./units/data"
import { Settings } from "./settings"
import { UnitDefinitions } from "./units"
import { TerrainDefinitions } from "./terrains";
import { TacticDefinitions } from "./tactics";

/**
 * Returns settings of the current mode.
 * @param state Application state.
 */
export const getSettings = (state: AppState): Settings => {
  return state.settings.combat[state.settings.mode]
}

/**
 * Returns unit types for the current mode from all armies.
 * @param state Application state.
 */
export const mergeUnitTypes = (state: AppState): Set<UnitType> => {
  return reduce(state.units, (previous, current) => {
    const arr = toArr(current)
    arr.filter(unit => isIncludedInMode(state.settings.mode, unit)).forEach(unit => previous.add(unit.type))
    return previous
  }, new Set<UnitType>())
}

/**
 * Returns terrain types for the current mode.
 * @param state Application state.
 */
export const filterTerrainTypes = (state: AppState): Set<TerrainType> => {
  return new Set(toArr(filterTerrains(state), terrain => terrain.type))
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
export const filterTacticTypes = (state: AppState): Set<TacticType> => {
  return new Set(toArr(filterTactics(state), tactic => tactic.type))
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
 * @param side Attacker or defender
 */
export const filterUnitTypes = (state: AppState, side: Side): Set<UnitType> => {
  const name = getParticipant(state, side).name
  const units = filterUnitDefinitions(state.settings.mode, objGet(state.units, name, getDefaultUnits()))
  return new Set(toArr(units).map(unit => unit.type))
}

/**
 * Returns armies of the current mode.
 * @param state Application state.
 */
export const getBattle = (state: AppState): Battle => objGet(state.battle, state.settings.mode, modeState(state.settings.mode))

export const getArmyBySide = (state: AppState, side: Side): Army => getArmyByCountry(state, getParticipant(state, side).name)

const getArmyByCountry = (state: AppState, name: CountryName): Army => {
  const battle = getBattle(state)
  const army = objGet(battle.armies, name, getDefaultArmy(state.settings.mode))
  const country = objGet(state.countries, name, defaultCountry)
  const units = filterUnitDefinitions(state.settings.mode, objGet(state.units, name, getDefaultUnits()))
  const global = objGet(state.global_stats, name, getDefaultGlobals())[state.settings.mode]
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
  const battle = getBattle(state)
  const army = objGet(battle.armies, name, getDefaultArmy(state.settings.mode))
  const units = filterUnitDefinitions(state.settings.mode, objGet(state.units, name, getDefaultUnits()))
  const global = objGet(state.global_stats, name, getDefaultGlobals())[state.settings.mode]
  const frontline = army.frontline.map(value => value && mergeUnits(units, global, value))
  const reserve = army.reserve.map(value => mergeUnits(units, global, value))
  const defeated = army.defeated.map(value => mergeUnits(units, global, value))
  return { frontline, reserve, defeated }
}

const getRounds = (state: AppState, type: Side): BaseUnits | undefined => {
  const battle = getBattle(state)
  const participant = objGet(battle.participants, type, getDefaultParticipant(CountryName.Country1))
  return arrGet(participant.rounds, -1)
}

const getCurrentUnitsBySide = (state: AppState, side: Side): Units => {
  const name = getParticipant(state, side).name
  const army = getArmy(state, side)
  const units = filterUnitDefinitions(state.settings.mode, objGet(state.units, name, getDefaultUnits()))
  const global = objGet(state.global_stats, name, getDefaultGlobals())[state.settings.mode]
  const frontline = army.frontline.map(value => value && mergeUnits(units, global, value))
  const reserve = army.reserve.map(value => mergeUnits(units, global, value))
  const defeated = army.defeated.map(value => mergeUnits(units, global, value))
  return { frontline, reserve, defeated }
}

export const getArmy = (state: AppState, type: Side): Army => ({ ...getArmyBySide(state, type), ...getRounds(state, type) })

export const getBaseUnits = (state: AppState, type: Side): BaseUnits => getBaseUnitsBySide(state, type)

export const getCurrentUnits = (state: AppState, type: Side): Units => getCurrentUnitsBySide(state, type)

export const getUnits = (state: AppState, type: Side): Units => getUnitsBySide(state, type)

export const getParticipant = (state: AppState, type: Side): Participant => objGet(getBattle(state).participants, type, getDefaultParticipant(CountryName.Country1))

export const getSelected = (state: AppState): Army => getArmyByCountry(state, state.settings.country)

/**
 * Returns unit definitions for the current mode and side. Global definitions have already been merged.
 * @param state Application state.
 * @param side Attacker or defender.
 */
export const getUnitDefinitions = (state: AppState, side: Side): UnitDefinitions => getUnitDefinitionsByCountry(state, getParticipant(state, side).name)

const getUnitDefinitionsByCountry = (state: AppState, name: CountryName): UnitDefinitions => {
  const global = objGet(state.global_stats, name, getDefaultGlobals())[state.settings.mode]
  const units = filterUnitDefinitions(state.settings.mode, objGet(state.units, name, getDefaultUnits()))
  return map(units, definition => mergeValues(definition, global))
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
