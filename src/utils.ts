import { OrderedMap } from 'immutable'
import { CombatParameter } from './store/settings'
import { DefinitionType } from './base_definition'
import { AppState } from './store/index'

export function mapRange<T>(length: number, func: (number: number) => T): T[] {
  const array: T[] = Array(length)
  for (let i = 0; i < length; i++) {
    array[i] = func(i)
  }
  return array
}

export function mergeSettings(state: AppState): OrderedMap<CombatParameter, number> {
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
