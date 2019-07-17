import { AppState } from "./index"
import { OrderedSet, OrderedMap } from "immutable"
import { TacticType } from "./tactics/actions"
import { DefinitionType } from "../base_definition"
import { TerrainType } from "./terrains/actions"
import { UnitType, UnitDefinition } from "./units/actions"
import { Armies, modeState } from "./battle/reducer"
import { CombatParameter } from "./settings/actions"

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
    return state.units.types.reduce((previous, current, key) => {
      return previous.merge(current.filter(type => {
        const unit = state.units.definitions.getIn([key, type]) as UnitDefinition | undefined
        if (!unit)
          return false
        return unit.mode === state.settings.mode || unit.mode === DefinitionType.Global
      }))
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
  