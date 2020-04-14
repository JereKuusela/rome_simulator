import { Modifier, ModifierType, Mode, ModifierWithKey, TechDefinitionEUIV, InventionDefinition } from 'types'
import { getRootParent } from './units'
import { getTechDefinitionsEUIV, getTechDefinitionsIR } from 'data'
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

export const tech_ir = process.env.REACT_APP_GAME === 'ir' ? getTechDefinitionsIR() : {} as InventionDefinition[]
export const tech_euiv = process.env.REACT_APP_GAME === 'euiv' ? getTechDefinitionsEUIV() : {} as TechDefinitionEUIV[]

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
  if (process.env.REACT_APP_GAME === 'euiv') {
    tech_euiv.forEach((tech, level) => {
      if (level > tech_level)
        return
      modifiers.push(...tech.modifiers.map(value => ({ key: TECH_KEY + level, ...value })))
    })
  }
  else {
    tech_ir.forEach((tech, level) => {
      if (level > tech_level)
        return
      tech.inventions.forEach((invention, index) => {
        const key = index === 0 ? TECH_KEY + level : invention.key
        if (index === 0 || selections[key])
          modifiers.push(...invention.modifiers.map(value => ({ key, ...value })))

      })
    })
  }
  return modifiers
}