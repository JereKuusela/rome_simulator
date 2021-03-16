import { GovermentType, Selections } from './modifiers'
import { Armies } from './armies'
import { UnitsData, UnitAttribute } from './units'
import { DefinitionValues } from 'definition_values'

export type WearinessAttribute = UnitAttribute.Morale | UnitAttribute.Strength
export type WearinessAttributes = { [key in WearinessAttribute]: MinMax }
type MinMax = { min: number; max: number }

export enum CountryName {
  Country1 = 'Country 1',
  Country2 = 'Country 2'
}
export type Countries = { [key in CountryName]: CountryDefinition }

export enum CountryAttribute {
  CombatWidth = 'Combat Width',
  FlankRatio = 'Flank Ratio',
  MilitaryExperience = 'Military Experience',
  OmenPower = 'Omen Power',
  CivicTech = 'Civic Tech',
  MartialTech = 'Martial Tech',
  OratoryTech = 'Oratory Tech',
  ReligiousTech = 'Religious Tech'
}

export const countryAttributeToEffect = (attribute: CountryAttribute) => {
  if (attribute === CountryAttribute.MartialTech) return 'military_tech'
  if (attribute === CountryAttribute.OratoryTech) return 'oratory_tech'
  if (attribute === CountryAttribute.CivicTech) return 'civic_tech'
  if (attribute === CountryAttribute.ReligiousTech) return 'religious_tech'
  if (attribute === CountryAttribute.MilitaryExperience) return 'military_experience'
  return ''
}

export type CountryDefinitions = { [key in CountryName]: CountryDefinition }

export interface CountryModifiers extends DefinitionValues<CountryAttribute> {
  selections: Selections
  selectedTradition: string
  culture: CultureType
  government: GovermentType
}

export interface CountryDefinition {
  modifiers: CountryModifiers
  armies: Armies
  units: UnitsData
  weariness: WearinessAttributes
  name: CountryName
}

export type Country = { [key in CountryAttribute]: number } & {
  selections: Selections
  selectedTradition: string
  weariness: WearinessAttributes
  name: CountryName
}

export enum CultureType {
  Dummy = 'Dummy'
}
