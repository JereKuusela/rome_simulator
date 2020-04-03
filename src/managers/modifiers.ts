import { Modifier, ModifierType, Mode, ModifierWithKey } from 'types'
import { getRootParent } from './units'
import { getTechDefinitionsEUIV } from 'data'
import { ObjSet } from 'utils'

/*
const traditions = getTraditionDefinitions()
const trades = getTradeDefinitions()
const heritages = getHeritageDefinitions()
const inventions = getInventionDefinitions()
const omens = getOmenDefinitions()
const traits = getTraitDefinitions()
const economy = getEconomyDefinitions()
const laws = getLawDefinitions()
const ideas = getIdeaDefinitions()
const abilities = getAbilityDefinitions()
*/
export const tech = getTechDefinitionsEUIV()

const TECH_KEY = 'Tech_'

export const mapModifiersToUnits = (modifiers: Modifier[]) => {
  const mapped: Modifier[] = []
  modifiers.forEach(modifier => {
    if (modifier.target === ModifierType.Text)
      return
    if (modifier.target in Mode) {
      mapped.push({ ...modifier, target: getRootParent(modifier.target as Mode) })
      return
    }
    if (modifier.target === ModifierType.Global) {
      mapped.push({ ...modifier, target: getRootParent(Mode.Naval) })
      mapped.push({ ...modifier, target: getRootParent(Mode.Land) })
      return
    }
    mapped.push(modifier)
  })
  return mapped
}

export const mapModifiersToUnits2 = (modifiers: ModifierWithKey[]) => {
  const mapped: ModifierWithKey[] = []
  modifiers.forEach(modifier => {
    if (modifier.target === ModifierType.Text)
      return
    if (modifier.target in Mode) {
      mapped.push({ ...modifier, target: getRootParent(modifier.target as Mode) })
      return
    }
    if (modifier.target === ModifierType.Global) {
      mapped.push({ ...modifier, target: getRootParent(Mode.Naval) })
      mapped.push({ ...modifier, target: getRootParent(Mode.Land) })
      return
    }
    mapped.push(modifier)
  })
  return mapped
}

export const getModifiers = (selections: ObjSet, tech_level: Number): ModifierWithKey[] => {
  const modifiers: ModifierWithKey[] = []
  tech.forEach((tech, index) => {
    if (index <= tech_level)
      modifiers.push(...tech.modifiers.map(value => ({ key: TECH_KEY + index, ...value })))
  })
  return modifiers
}