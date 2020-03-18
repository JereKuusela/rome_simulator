import { Modifier, ModifierType, Mode, ScopeType } from 'types'
import { getBaseUnitType } from './units'

export const mapModifiersToUnits = (modifiers: Modifier[]) => {
  const mapped: Modifier[] = []
  modifiers.forEach(modifier => {
    if (modifier.target === ModifierType.Text)
      return
    if (modifier.target in Mode) {
      mapped.push({ ...modifier, target: getBaseUnitType(modifier.target as Mode) })
      return
    }
    if (modifier.target === ModifierType.Global && modifier.scope === ScopeType.Army) {
      mapped.push({ ...modifier, target: getBaseUnitType(Mode.Naval) })
      mapped.push({ ...modifier, target: getBaseUnitType(Mode.Land) })
      return
    }
    mapped.push(modifier)
  })
  return mapped
}
