import { GovermentType, Selections } from './modifiers'
import { Armies } from './armies'
import { UnitsData, UnitAttribute } from './units'
import { DataValues } from 'data_values'

export type WearinessAttribute = UnitAttribute.Morale | UnitAttribute.Strength
export type WearinessAttributes = Record<WearinessAttribute, Range>
export type Range = { min: number; max: number }

export enum CountryName {
  Country1 = 'Country 1',
  Country2 = 'Country 2'
}
export type Countries = Record<CountryName, CountryDefinition>

export enum CountryAttribute {
  CombatWidth = 'Combat Width',
  FlankRatio = 'Flank Ratio',
  MilitaryExperience = 'Military Experience',
  OmenPower = 'Omen Power',
  CivicTech = 'Civic Tech',
  MartialTech = 'Martial Tech',
  OratoryTech = 'Oratory Tech',
  ReligiousTech = 'Religious Tech',
  LevySize = 'Levy Size'
}

export const countryAttributeToEffect = (attribute: CountryAttribute) => {
  if (attribute === CountryAttribute.MartialTech) return 'military_tech'
  if (attribute === CountryAttribute.OratoryTech) return 'oratory_tech'
  if (attribute === CountryAttribute.CivicTech) return 'civic_tech'
  if (attribute === CountryAttribute.ReligiousTech) return 'religious_tech'
  if (attribute === CountryAttribute.MilitaryExperience) return 'military_experience'
  return ''
}

export type CountryDefinitions = Record<CountryName, CountryDefinition>

export interface CountryModifiers extends DataValues<CountryAttribute> {
  selections: Selections
  culture: CultureType
  government: GovermentType
}
export type CountryData = {
  modifiers: CountryModifiers
  armies: Armies
  units: UnitsData
  weariness: WearinessAttributes
  name: CountryName
}

export type CountryDefinition = CountryData

export type Country = Record<CountryAttribute, number> & {
  selections: Selections
  weariness: WearinessAttributes
  culture: CultureType
  name: CountryName
}

export enum CultureType {
  Dummy = 'Dummy'
}
