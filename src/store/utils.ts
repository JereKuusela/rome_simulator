import { AppState } from "./index"
import { OrderedSet, OrderedMap } from "immutable"
import { getKeys, sumMap } from '../utils'
import { filterUnitDefinitions, isIncludedInMode, mergeUnits } from '../army_utils'
import { TacticType, TacticDefinition } from "./tactics/actions"
import { DefinitionType, mergeValues } from "../base_definition"
import { TerrainType, TerrainDefinition } from "./terrains/actions"
import { UnitType, UnitDefinition, UnitDefinitions } from "./units/actions"
import { Battle, modeState } from "./battle/reducer"
import { getDefaultArmy, Army as BaseArmy, Side, getDefaultParticipant, BaseUnits, Participant, Units } from "./battle/actions"
import { CombatParameter } from "./settings/actions"
import { defaultCountry } from "./countries/reducer"
import { CountryName } from "./countries"
import { getDefaultGlobal, getDefaultUnits } from "./units/data"

/**
 * Returns settings of the current mode.
 * @param state Application state.
 */
export const mergeSettings = (state: AppState): OrderedMap<CombatParameter, number> => {
    const base = state.settings.combat.get(DefinitionType.Global)
    const specific = state.settings.combat.get(state.settings.mode)
    if (base && !specific)
      return base
    if (!base && specific)
      return specific
    if (base && specific)
      return base.merge(specific)
    return OrderedMap<CombatParameter, number>()
  }

  /**
   * Returns unit types for the current mode from all armies.
   * @param state Application state.
   */
  export const mergeUnitTypes = (state: AppState): OrderedSet<UnitType> => {
    return state.units.reduce((previous, current) => {
      return previous.merge(current.filter(unit => {
        return unit.mode === state.settings.mode || unit.mode === DefinitionType.Global
      }).map(unit => unit.type).toOrderedSet())
    }, OrderedSet<UnitType>())
  }
  
  /**
   * Returns terrain types for the current mode.
   * @param state Application state.
   */
  export const filterTerrainTypes = (state: AppState): OrderedSet<TerrainType> => {
    return getKeys(filterTerrains(state))
  }
  
  /**
   * Returns terrains for the current mode.
   * @param state Application state.
   */
  export const filterTerrains = (state: AppState): OrderedMap<TerrainType, TerrainDefinition> => {
    return state.terrains.filter(terrain => isIncludedInMode(state.settings.mode, terrain))
  }

  /**
   * Returns tactic types for the current mode.
   * @param state Application state.
   */
  export const filterTacticTypes = (state: AppState): OrderedSet<TacticType> => {
    return getKeys(filterTactics(state))
  }
  
  /**
   * Returns tactics for the current mode.
   * @param state Application state.
   */
  export const filterTactics = (state: AppState): OrderedMap<TacticType, TacticDefinition> => {
    return state.tactics.filter(tactic => isIncludedInMode(state.settings.mode, tactic))
  }
  

  /**
   * Returns unit types for the current mode and side.
   * @param state Application state.
   * @param side Attacker or defender
   */
  export const filterUnitTypes = (state: AppState, side: Side): OrderedSet<UnitType> => {
    const name = getParticipant(state, side).name
    const units = filterUnitDefinitions(state.settings.mode, state.units.get(name, getDefaultUnits()))
    return getKeys(units)
  }

  /**
   * Returns armies of the current mode.
   * @param state Application state.
   */
  export const getBattle = (state: AppState): Battle => state.battle.get(state.settings.mode, modeState(state.settings.mode))
  
  const getArmyBySide = (state: AppState, side: Side): Army => getArmyByCountry(state, getParticipant(state, side).name)

  const getArmyByCountry = (state: AppState, name: CountryName): Army => {
    const battle = getBattle(state)
    const army = battle.armies.get(name, getDefaultArmy(state.settings.mode))
    const country = state.countries.get(name, defaultCountry)
    const units = filterUnitDefinitions(state.settings.mode, state.units.get(name, getDefaultUnits()))
    const global = state.global_stats.get(name, getDefaultGlobal()).get(state.settings.mode)!
    const general = {
      total: country.has_general ? country.general_martial + sumMap(country.trait_martial) : 0,
      base: country.has_general ? country.general_martial : 0,
      trait: country.has_general ? sumMap(country.trait_martial) : 0
    }
    const has_general = country.has_general
    return { ...army, general, name, units, global, has_general}
  }

  const getBaseUnitsBySide = (state: AppState, side: Side): BaseUnits => getBaseUnitsByCountry(state, getParticipant(state, side).name)

  const getBaseUnitsByCountry = (state: AppState, name: CountryName): BaseUnits => {
    const battle = getBattle(state)
    const army = battle.armies.get(name, getDefaultArmy(state.settings.mode))
    return { frontline: army.frontline, reserve: army.reserve, defeated: army.defeated }
  }


  const getUnitsBySide = (state: AppState, side: Side): Units => getUnitsByCountry(state, getParticipant(state, side).name)

  const getUnitsByCountry = (state: AppState, name: CountryName): Units => {
    const battle = getBattle(state)
    const army = battle.armies.get(name, getDefaultArmy(state.settings.mode))
    const units = filterUnitDefinitions(state.settings.mode, state.units.get(name, getDefaultUnits()))
    const global = state.global_stats.get(name, getDefaultGlobal()).get(state.settings.mode)!
    const frontline = army.frontline.map(value => value && mergeUnits(units, global, value))
    const reserve = army.reserve.map(value =>  mergeUnits(units, global, value))
    const defeated = army.defeated.map(value => mergeUnits(units, global, value))
    return { frontline, reserve, defeated }
  }

  const getRounds = (state: AppState, type: Side): BaseUnits | undefined => {
    const battle = getBattle(state)
    const participant = battle.participants.get(type, getDefaultParticipant(CountryName.Country1))
    return participant.rounds.get(-1)
  }

  export const getArmy = (state: AppState, type: Side): Army => ({ ...getArmyBySide(state, type), ...getRounds(state, type) })

  export const getBaseUnits = (state: AppState, type: Side): BaseUnits => getBaseUnitsBySide(state, type)

  export const getUnits = (state: AppState, type: Side): Units => getUnitsBySide(state, type)

  export const getParticipant = (state: AppState, type: Side): Participant => getBattle(state).participants.get(type, getDefaultParticipant(CountryName.Country1))

  export const getSelected = (state: AppState): Army => getArmyByCountry(state, state.settings.country)
  
  /**
   * Returns unit definitions for the current mode and side. Global definitions have already been merged.
   * @param state Application state.
   * @param side Attacker or defender.
   */
  export const getUnitDefinitions = (state: AppState, side: Side): UnitDefinitions => {
    const name = getParticipant(state, side).name
    const global = state.global_stats.get(name, getDefaultGlobal()).get(state.settings.mode)!
    const units = filterUnitDefinitions(state.settings.mode, state.units.get(name, getDefaultUnits()))
    return units.map(definition => mergeValues(definition, global))
  }

  export interface Army extends BaseArmy {
    general: {
      total: number,
      base: number,
      trait: number
    }
    name: CountryName
    units: OrderedMap<UnitType, UnitDefinition>
    global: UnitDefinition,
    has_general: boolean
  }
