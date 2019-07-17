import { AppState } from "./index"
import { OrderedSet, OrderedMap } from "immutable"
import { filterUnits } from '../utils'
import { TacticType } from "./tactics/actions"
import { DefinitionType } from "../base_definition"
import { TerrainType } from "./terrains/actions"
import { UnitType, UnitDefinition } from "./units/actions"
import { Armies, modeState } from "./battle/reducer"
import { getDefault as getDefaultArmy, Participant as BaseParticipant } from "./battle/actions"
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
    return state.terrains.types.filter(type => {
      const terrain = state.terrains.definitions.get(type)
      if (!terrain)
        return false
      return terrain.mode === state.settings.mode || terrain.mode === DefinitionType.Global
    })
  }
  
  /**
   * Returns tactic types for the current mode.
   * @param state Application state.
   */
  export const filterTacticTypes = (state: AppState): OrderedSet<TacticType> => {
    return state.tactics.types.filter(type => {
      const tactic = state.tactics.definitions.get(type)
      if (!tactic)
        return false
      return tactic.mode === state.settings.mode || tactic.mode === DefinitionType.Global
    })
  }

  const getParticipant = (state: AppState, battle: Armies, name: CountryName): Participant => {
    const army = battle.armies.get(name, getDefaultArmy(state.settings.mode))
    const country = state.countries.get(name, defaultCountry)
    const units = filterUnits(state.settings.mode, state.units.get(name, getDefaultUnits()))
    const global = state.global_stats.get(name, getDefaultGlobal()).get(state.settings.mode)!
    return { ...army, general: country.general_martial, name, units, global}
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
    general: number
    name: CountryName
    units: OrderedMap<UnitType, UnitDefinition>
    global: UnitDefinition
  }
