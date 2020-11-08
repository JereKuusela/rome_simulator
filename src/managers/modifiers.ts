import {
  Modifier,
  ModifierType,
  Mode,
  ModifierWithKey,
  CountryAttribute,
  ValuesType,
  UnitAttribute,
  UnitType,
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
import { martialToCaptureChance } from './army'
import {
  techEU4,
  techIR,
  traditionsIR,
  heritagesIR,
  tradesIR,
  ideasIR,
  lawsIR,
  religionsIR,
  factionsIR,
  modifiersIR,
  policiesIR,
  deitiesIR,
  traitsIR,
  abilitiesIR,
  policiesEU4
} from 'data'
import { applyCountryModifiers } from './countries'

export const TECH_KEY = 'Tech '

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
  const techLevel = calculateValue(country, CountryAttribute.TechLevel)
  if (process.env.REACT_APP_GAME === 'EU4') {
    techEU4.forEach((tech, level) => {
      if (level > techLevel) return
      modifiers.push(...mapModifiers(TECH_KEY + level, tech.modifiers))
    })
  }
  if (process.env.REACT_APP_GAME === 'IR') {
    techIR.forEach((tech, level) => {
      if (level > techLevel) return
      tech.inventions.forEach((invention, index) => {
        const key = index === 0 ? TECH_KEY + level : invention.key
        const name = index === 0 ? TECH_KEY + level : invention.name
        if (index === 0 || selections[key]) modifiers.push(...mapModifiers(name, invention.modifiers))
      })
    })
  }
  return modifiers
}

const getTraditionModifiers = (modifiers: ModifierWithKey[], country: CountryModifiers) => {
  const selections = country.selections[SelectionType.Tradition] ?? {}
  const culture = country.culture
  if (process.env.REACT_APP_GAME === 'IR') {
    const tradition = traditionsIR[culture]
    if (selections['base']) {
      modifiers.push(...mapModifiers(tradition.name, tradition.modifiers))
      tradition.paths.forEach(path => getModifiersSub(modifiers, selections, path.traditions))
    }
  }
  return modifiers
}

const getModifiersSub = (
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

const getModifiersSub2 = (modifiers: ModifierWithKey[], selections: ObjSet | undefined, items: ListDefinitions) => {
  const selectedKeys = keys(selections ?? {})
  selectedKeys.forEach(key => {
    if (items[key]) modifiers.push(...mapModifiers(items[key].name, items[key].modifiers))
  })
}
const getOfficeModifiers = (modifiers: ModifierWithKey[], country: CountryModifiers) => {
  const morale = calculateValue(country, CountryAttribute.OfficeMorale)
  const discipline = calculateValue(country, CountryAttribute.OfficeDiscipline)
  const militaryExperience = calculateValue(country, CountryAttribute.MilitaryExperience)
  if (discipline) {
    modifiers.push({
      target: ModifierType.Global,
      type: ValuesType.Base,
      attribute: UnitAttribute.Discipline,
      value: discipline / 100.0,
      key: 'Office job'
    })
  }
  if (morale) {
    modifiers.push({
      target: UnitType.Land,
      type: ValuesType.Modifier,
      attribute: UnitAttribute.Morale,
      value: morale / 100.0,
      key: 'Office job'
    })
  }
  if (militaryExperience) {
    modifiers.push({
      target: UnitType.Land,
      type: ValuesType.Modifier,
      attribute: UnitAttribute.Morale,
      value: militaryExperience / 1000.0,
      key: 'Military experience'
    })
  }
}

const getPrimaryCountryModifiers = (country: CountryModifiers) => {
  const modifiers: ModifierWithKey[] = []
  getTechModifiers(modifiers, country)
  getOfficeModifiers(modifiers, country)
  if (process.env.REACT_APP_GAME === 'EU4') {
    getModifiersSub2(modifiers, country.selections[SelectionType.Policy], policiesEU4)
  }
  if (process.env.REACT_APP_GAME === 'IR') {
    getModifiersSub2(modifiers, country.selections[SelectionType.Heritage], heritagesIR)
    getModifiersSub2(modifiers, country.selections[SelectionType.Trade], tradesIR)
    getModifiersSub2(modifiers, country.selections[SelectionType.Idea], ideasIR)
    getModifiersSub2(modifiers, country.selections[SelectionType.Law], lawsIR)
    getModifiersSub2(modifiers, country.selections[SelectionType.Religion], religionsIR)
    getModifiersSub2(modifiers, country.selections[SelectionType.Faction], factionsIR)
    getModifiersSub2(modifiers, country.selections[SelectionType.Modifier], modifiersIR)
    policiesIR.forEach(policy => getModifiersSub(modifiers, country.selections[SelectionType.Policy], policy))
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
      getModifiersSub2(modifiers, general.selections[SelectionType.Trait], traitsIR)
      abilitiesIR.forEach(abilities => getModifiersSub(modifiers, general.selections[SelectionType.Ability], abilities))
      const martial = calculateValue(general, GeneralAttribute.Martial)
      if (martial) {
        modifiers.push({
          target: UnitType.Naval,
          type: ValuesType.Base,
          attribute: UnitAttribute.CaptureChance,
          value: martialToCaptureChance(martial),
          key: 'Martial'
        })
      }
    }
  } else {
    modifiers.push({
      target: ModifierType.Global,
      type: ValuesType.Modifier,
      attribute: UnitAttribute.Morale,
      value: -0.15,
      key: 'No general'
    })
  }
  return modifiers
}
