import { Modifier, ModifierType, Mode, ModifierWithKey, TechDefinitionEUIV, InventionDefinition, CountryAttribute, ValuesType, UnitAttribute, UnitType, AbilityDefinition, TraitDefinition, GeneralDefinition, CountryDefinition, GeneralAttribute, HeritageDefinition, SelectionType, TradeDefinition } from 'types'
import { getRootParent } from './units'
import { getTechDefinitionsEUIV, getTechDefinitionsIR, getAbilityDefinitions, getTraitDefinitions, getHeritageDefinitions, getTraditionDefinitions, Traditions, getTradeDefinitions } from 'data'
import { ObjSet } from 'utils'
import { calculateValue } from 'definition_values'
import { martialToCaptureChance } from './army'

/*
const omens = getOmenDefinitions()
const economy = getEconomyDefinitions()
const laws = getLawDefinitions()
const ideas = getIdeaDefinitions()
*/
export const abilities_ir = process.env.REACT_APP_GAME === 'ir' ? getAbilityDefinitions() : {} as AbilityDefinition[]
export const traits_ir = process.env.REACT_APP_GAME === 'ir' ? getTraitDefinitions() : {} as TraitDefinition[]
export const heritages_ir = process.env.REACT_APP_GAME === 'ir' ? getHeritageDefinitions() : {} as HeritageDefinition[]
export const trades_ir = process.env.REACT_APP_GAME === 'ir' ? getTradeDefinitions() : {} as TradeDefinition[]
export const traditions_ir = process.env.REACT_APP_GAME === 'ir' ? getTraditionDefinitions() : {} as Traditions

export const tech_ir = process.env.REACT_APP_GAME === 'ir' ? getTechDefinitionsIR() : {} as InventionDefinition[]
export const tech_euiv = process.env.REACT_APP_GAME === 'euiv' ? getTechDefinitionsEUIV() : {} as TechDefinitionEUIV[]

export const TECH_KEY = 'Tech '


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

const mapModifiers = (key: string, modifiers: Modifier[]) => modifiers.map(value => ({ key, ...value })) as ModifierWithKey[]


const getTechModifiers = (modifiers: ModifierWithKey[], country: CountryDefinition) => {
  const selections = country.selections[SelectionType.Invention] ?? {}
  const tech_level = calculateValue(country, CountryAttribute.TechLevel)
  if (process.env.REACT_APP_GAME === 'euiv') {
    tech_euiv.forEach((tech, level) => {
      if (level > tech_level)
        return
      modifiers.push(...mapModifiers(TECH_KEY + level, tech.modifiers))
    })
  }
  else {
    tech_ir.forEach((tech, level) => {
      if (level > tech_level)
        return
      tech.inventions.forEach((invention, index) => {
        const key = index === 0 ? TECH_KEY + level : invention.key
        if (index === 0 || selections[key])
          modifiers.push(...mapModifiers(key, invention.modifiers))

      })
    })
  }
  return modifiers
}

const getTraditionModifiers = (modifiers: ModifierWithKey[], country: CountryDefinition) => {
  const selections = country.selections[SelectionType.Tradition] ?? {}
  const culture = country.culture
  if (process.env.REACT_APP_GAME === 'euiv') {
  }
  else {
    const tradition = traditions_ir[culture]
    if (selections['base']) {
      modifiers.push(...mapModifiers(tradition.name, tradition.modifiers))
      tradition.paths.forEach(path => getModifiersSub(modifiers, selections, path.traditions))
    }
  }
  return modifiers
}

const getModifiersSub = (modifiers: ModifierWithKey[], selections: ObjSet, entities: { name: string, key: string, modifiers: Modifier[] }[]) => {
  entities.forEach(entity => {
    if (selections && selections[entity.key])
      modifiers.push(...mapModifiers(entity.name, entity.modifiers))
  })
}

const getOfficeModifiers = (modifiers: ModifierWithKey[], country: CountryDefinition) => {
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
      type: ValuesType.Base,
      attribute: UnitAttribute.Morale,
      value: morale / 100.0,
      key: 'Office job'
    })
  }
  if (militaryExperience) {
    modifiers.push({
      target: UnitType.Land,
      type: ValuesType.Base,
      attribute: UnitAttribute.Morale,
      value: militaryExperience / 1000.0,
      key: 'Military experience'
    })
  }

}

export const getCountryModifiers = (country: CountryDefinition): ModifierWithKey[] => {
  const modifiers: ModifierWithKey[] = []
  getTechModifiers(modifiers, country)
  getOfficeModifiers(modifiers, country)
  if (process.env.REACT_APP_GAME === 'euiv') {
  }
  else {
    getModifiersSub(modifiers, country.selections[SelectionType.Heritage], heritages_ir)
    getModifiersSub(modifiers, country.selections[SelectionType.Trade], trades_ir)
    getTraditionModifiers(modifiers, country)
  }
  return modifiers
}

export const getGeneralModifiers = (general: GeneralDefinition): ModifierWithKey[] => {
  const modifiers: ModifierWithKey[] = []
  if (general.enabled) {
    if (process.env.REACT_APP_GAME === 'euiv') {
    }
    else {
      getModifiersSub(modifiers, general.selections[SelectionType.Trait], traits_ir)
      abilities_ir.forEach(abilities => getModifiersSub(modifiers, general.selections[SelectionType.Ability], abilities.options))
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
  }
  else {
    modifiers.push({
      target: ModifierType.Global,
      type: ValuesType.Modifier,
      attribute: UnitAttribute.Morale,
      value: -0.25,
      key: 'No general'
    })
  }
  return modifiers
}
