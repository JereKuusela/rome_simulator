import { GovermentType, Selections } from "./modifiers"
import { Armies } from "./armies"
import { UnitDefinitions, UnitAttribute } from "./units"
import { DefinitionValues } from "definition_values"

export type WearinessAttribute = UnitAttribute.Morale | UnitAttribute.Strength
export type WearinessAttributes = { [key in WearinessAttribute]: MinMax }
type MinMax = { min: number, max: number }


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
  TechLevel = 'Tech Tevel',
  OfficeMorale = 'Morale Office',
  OfficeDiscipline = 'Discipline Office'
}

export interface CountryDefinition extends DefinitionValues<CountryAttribute> {
  selections: Selections
  culture: CultureType
  government: GovermentType
  armies: Armies
  units: UnitDefinitions
  weariness: WearinessAttributes
}

export type Country = { [key in CountryAttribute]: number } & {
  selections: Selections
  culture: CultureType
  weariness: WearinessAttributes
}

export enum CultureType { Dummy = 'Dummy' }
