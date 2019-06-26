import { OrderedMap, OrderedSet } from 'immutable'
import { CombatParameter } from './store/settings'
import { DefinitionType } from './base_definition'
import { AppState } from './store/index'
import { Armies, modeState } from './store/battle'
import { UnitType, UnitDefinition } from './store/units'
import { TerrainType } from './store/terrains'
import { TacticType } from './store/tactics'

/**
 * Maps a range to a list.
 * @param length Length of the range.
 * @param func Callback function to create the list from an index.
 */
export const mapRange = <T>(length: number, func: (number: number) => T): T[] => {
  const array: T[] = Array(length)
  for (let i = 0; i < length; i++) {
    array[i] = func(i)
  }
  return array
}

/**
 * Returns settings of the current mode.
 * @param state Application state.
 */
export const mergeSettings = (state: AppState): OrderedMap<CombatParameter, number> => {
  const base = state.settings.combat.get(DefinitionType.Any)
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
      return unit.mode === state.settings.mode || unit.mode === DefinitionType.Any
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
    return terrain.mode === state.settings.mode || terrain.mode === DefinitionType.Any
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
    return tactic.mode === state.settings.mode || tactic.mode === DefinitionType.Any
  })
}
