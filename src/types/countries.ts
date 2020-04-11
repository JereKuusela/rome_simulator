import { ObjSet } from "utils"
import { GovermentType, ReligionType } from "./modifiers"
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
  units: UnitDefinitions
  weariness: WearinessAttributes
}

export type Country = {
  values: { [key in CountryAttribute]: number }
  tech_level: number
  culture: CultureType
  weariness: WearinessAttributes
}

export enum CultureType {
  Default = 'Default',
  Latin = 'Latin' ,
  Greek = 'Greek' ,
  Persian = 'Persian' ,
  Levantine = 'Levantine' ,
  Celtic = 'Celtic',
  NorthAfrican = 'North African',
  Mayruan = 'Mayruan'
}

export const dictionaryCultureType: { [key: string]: CultureType } = {
  default_philosophy: CultureType.Default,
  latin_philosophy: CultureType.Latin,
  greek_philosophy: CultureType.Greek,
  persian_philosophy: CultureType.Persian,
  levantine_philosophy: CultureType.Levantine,
  celtic_philosophy: CultureType.Celtic,
  north_african_philosophy: CultureType.NorthAfrican,
  mauryan_philosophy: CultureType.Mayruan

}