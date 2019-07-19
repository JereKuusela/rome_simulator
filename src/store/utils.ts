import { AppState } from "./index"
import { OrderedSet, OrderedMap } from "immutable"
import { filterUnits, filterByMode, getKeys, sum } from '../utils'
import { TacticType, TacticDefinition } from "./tactics/actions"
import { DefinitionType } from "../base_definition"
import { TerrainType, TerrainDefinition } from "./terrains/actions"
import { UnitType, UnitDefinition } from "./units/actions"
import { Armies, modeState } from "./battle/reducer"
import { getDefaultArmy, Participant as BaseParticipant } from "./battle/actions"
import { CombatParameter } from "./settings/actions"
import { defaultCountry } from "./countries/reducer"
import { CountryName } from "./countries/actions"
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
   * Returns armies of the current mode.
   * @param state Application state.
   */
  export const getBattle = (state: AppState): Armies => state.battle.get(state.settings.mode, modeState(state.settings.mode))
  
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
    return state.terrains.filter(terrain => filterByMode(state.settings.mode, terrain))
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
    return state.tactics.filter(tactic => filterByMode(state.settings.mode, tactic))
  }

  const getParticipant = (state: AppState, battle: Armies, name: CountryName): Participant => {
    const army = battle.armies.get(name, getDefaultArmy(state.settings.mode))
    const country = state.countries.get(name, defaultCountry)
    const units = filterUnits(state.settings.mode, state.units.get(name, getDefaultUnits()))
    const global = state.global_stats.get(name, getDefaultGlobal()).get(state.settings.mode)!
    const general = {
      total: country.has_general ? country.general_martial + sum(country.trait_martial) : 0,
      base: country.has_general ? country.general_martial : 0,
      trait: country.has_general ? sum(country.trait_martial) : 0
    }
    const has_general = country.has_general
    return { ...army, general, name, units, global, has_general}
  }

  export const getAttacker = (state: AppState): Participant => {
    const battle = getBattle(state)
    return getParticipant(state, battle, battle.attacker)
  }
  
  export const getDefender = (state: AppState): Participant => {
    const battle = getBattle(state)
    return getParticipant(state, battle, battle.defender)
  }

  export const getSelected = (state: AppState): Participant => {
    const battle = getBattle(state)
    return getParticipant(state, battle, state.settings.country)
  }

  export interface Participant extends BaseParticipant {
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
