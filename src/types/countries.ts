import { ObjSet } from "utils"
import { CultureType, GovermentType, ReligionType } from "./modifiers"
import { Armies } from "./armies"
import { BaseUnits, UnitAttribute } from "./units"
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
  CombatWidth = 'Combat width',
  FlankRatio = 'Flank ratio'
}

export interface CountryDefinition extends DefinitionValues<CountryAttribute> {
  selections: ObjSet
  culture: CultureType
  government: GovermentType
  religion: ReligionType
  omen_power: number
  military_power: number
  office_discipline: number
  office_morale: number
  armies: Armies
  tech_level: number
  units: BaseUnits
  weariness: WearinessAttributes
}

export type Country = {
  values: { [key in CountryAttribute]: number }
  tech_level: number
  culture: CultureType
  weariness: WearinessAttributes
}
