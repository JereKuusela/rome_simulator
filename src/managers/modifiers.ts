import {
  Modifier,
  ModifierType,
  Mode,
  ModifierWithKey,
  CountryAttribute,
  GeneralData,
  GeneralAttribute,
  SelectionType,
  ListDefinitions,
  DeityDefinitions,
  CountryModifiers
} from 'types'
import { getRootParent } from './units'
import { ObjSet, keys } from 'utils'
import { calculateValue } from 'definition_values'
import {
  techEU4,
  inventionsIR,
  traditionsIR,
  heritagesIR,
  tradesIR,
  ideasIR,
  lawsIR,
  religionsIR,
  factionsIR,
  effectsIR,
  policiesIR,
  deitiesIR,
  traitsIR,
  abilitiesIR,
  policiesEU4
} from 'data'
import { applyCountryModifiers } from './countries'

export const TECH_KEY = 'Tech '

const getDynamicEffect = (key: string, value: number): ModifierWithKey[] => {
  const effect = effectsIR[key]
  return effect.modifiers.map(modifier => ({
    ...modifier,
    key: effect.name,
    value: modifier.value * value
  }))
}

const getEffect = (key: string): ModifierWithKey[] => getDynamicEffect(key, 1.0)

export const mapModifiersToUnits = (modifiers: Modifier[]): Modifier[] => {
  const mapped: Modifier[] = []
  modifiers.forEach(modifier => {
    if (modifier.target === ModifierType.Text) return
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

export const mapModifiersToUnits2 = (modifiers: ModifierWithKey[]): ModifierWithKey[] => {
  const mapped: ModifierWithKey[] = []
  modifiers.forEach(modifier => {
    if (modifier.target === ModifierType.Text) return
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

const mapModifiers = (key: string, modifiers: Modifier[]) =>
  modifiers.map(value => ({ key, ...value })) as ModifierWithKey[]

const getTechModifiers = (modifiers: ModifierWithKey[], country: CountryModifiers) => {
  const selections = country.selections[SelectionType.Invention] ?? {}
  const techLevel = calculateValue(country, CountryAttribute.MilitaryTech)
  if (process.env.REACT_APP_GAME === 'EU4') {
    techEU4.forEach((tech, level) => {
      if (level > techLevel) return
      modifiers.push(...mapModifiers(TECH_KEY + level, tech.modifiers))
    })
  }
  if (process.env.REACT_APP_GAME === 'IR') {
    getModifiersFromArray(modifiers, selections, inventionsIR)
  }
  return modifiers
}

const getTraditionModifiers = (modifiers: ModifierWithKey[], country: CountryModifiers) => {
  const selections = country.selections[SelectionType.Tradition] ?? {}
  if (process.env.REACT_APP_GAME === 'IR') {
    Object.values(traditionsIR).forEach(tree => {
      getModifiersFromArray(modifiers, selections, tree)
    })
  }
  return modifiers
}

const getModifiersFromArray = (
  modifiers: ModifierWithKey[],
  selections: ObjSet,
  entities: { name: string; key: string; modifiers: Modifier[] }[]
) => {
  entities.forEach(entity => {
    if (selections && selections[entity.key]) modifiers.push(...mapModifiers(entity.name, entity.modifiers))
  })
}
const getDeityModifiers = (
  modifiers: ModifierWithKey[],
  selections: ObjSet,
  items: DeityDefinitions,
  omenPower: number
) => {
  const selectedKeys = keys(selections ?? {})
  selectedKeys.forEach(key => {
    if (items[key]) {
      const item = items[key]
      const effects = item.isOmen
        ? item.modifiers.map(modifier => ({ ...modifier, value: (modifier.value * omenPower) / 100.0 }))
        : item.modifiers
      modifiers.push(...mapModifiers(item.name, effects))
    }
  })
}

const getModifiersFromObject = (
  modifiers: ModifierWithKey[],
  selections: ObjSet | undefined,
  items: ListDefinitions
) => {
  const selectedKeys = keys(selections ?? {})
  selectedKeys.forEach(key => {
    if (items[key]) modifiers.push(...mapModifiers(items[key].name, items[key].modifiers))
  })
}

const getCountryAttribute = (country: CountryModifiers, attribute: CountryAttribute, key: string) => {
  const value = calculateValue(country, attribute)
  return value ? getDynamicEffect(key, value) : []
}

const getOfficeModifiers = (modifiers: ModifierWithKey[], country: CountryModifiers) => {
  modifiers.push(...getCountryAttribute(country, CountryAttribute.MilitaryExperience, 'military_experience'))
  modifiers.push(...getCountryAttribute(country, CountryAttribute.MilitaryTech, 'military_tech'))
}

const getPrimaryCountryModifiers = (country: CountryModifiers) => {
  const modifiers: ModifierWithKey[] = []
  getTechModifiers(modifiers, country)
  getOfficeModifiers(modifiers, country)
  if (process.env.REACT_APP_GAME === 'EU4') {
    getModifiersFromObject(modifiers, country.selections[SelectionType.Policy], policiesEU4)
  }
  if (process.env.REACT_APP_GAME === 'IR') {
    getModifiersFromObject(modifiers, country.selections[SelectionType.Heritage], heritagesIR)
    getModifiersFromObject(modifiers, country.selections[SelectionType.Trade], tradesIR)
    getModifiersFromObject(modifiers, country.selections[SelectionType.Idea], ideasIR)
    getModifiersFromObject(modifiers, country.selections[SelectionType.Law], lawsIR)
    getModifiersFromObject(modifiers, country.selections[SelectionType.Religion], religionsIR)
    getModifiersFromObject(modifiers, country.selections[SelectionType.Faction], factionsIR)
    getModifiersFromObject(modifiers, country.selections[SelectionType.Modifier], effectsIR)
    policiesIR.forEach(policy => getModifiersFromArray(modifiers, country.selections[SelectionType.Policy], policy))
    getTraditionModifiers(modifiers, country)
  }
  return modifiers
}

export const getCountryModifiers = (country: CountryModifiers): ModifierWithKey[] => {
  const primaryModifiers = getPrimaryCountryModifiers(country)
  const secondaryModifiers = getSecondaryCountryModifiers(applyCountryModifiers(country, primaryModifiers))
  return primaryModifiers.concat(secondaryModifiers)
}

/**
 * Modifiers must be acquired in two steps because modifiers can affect each other.
 * For example Omen Power for omens.
 */
export const getSecondaryCountryModifiers = (country: CountryModifiers): ModifierWithKey[] => {
  const modifiers: ModifierWithKey[] = []
  if (process.env.REACT_APP_GAME === 'IR') {
    getDeityModifiers(
      modifiers,
      country.selections[SelectionType.Deity],
      deitiesIR,
      calculateValue(country, CountryAttribute.OmenPower)
    )
  }
  return modifiers
}

export const getGeneralModifiers = (general: GeneralData): ModifierWithKey[] => {
  const modifiers: ModifierWithKey[] = []
  if (general.enabled) {
    if (process.env.REACT_APP_GAME === 'IR') {
      getModifiersFromObject(modifiers, general.selections[SelectionType.Trait], traitsIR)
      abilitiesIR.forEach(abilities =>
        getModifiersFromArray(modifiers, general.selections[SelectionType.Ability], abilities)
      )
      const martial = calculateValue(general, GeneralAttribute.Martial)
      if (martial) modifiers.push(...getDynamicEffect('unit_martial_mod', martial))
    }
  } else {
    modifiers.push(...getEffect('army_leader_less'))
    modifiers.push(...getEffect('navy_leader_less'))
  }
  return modifiers
}
