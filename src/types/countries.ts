import { ObjSet } from "utils"
import { CultureType, GovermentType, ReligionType } from "./modifiers"
import { Armies } from "./armies"
import { Units } from "./units"
import { DefinitionValues } from "definition_values"

export enum CountryName {
  Country1 = 'Country 1',
  Country2 = 'Country 2'
}
export type Countries = { [key in CountryName]: Country }

export enum CountryAttribute {
  CombatWidth = 'Combat width'
}

export interface Country extends DefinitionValues<CountryAttribute> {
  selections: ObjSet
  culture: CultureType
  government: GovermentType
  religion: ReligionType
  omen_power: number
  military_power: number
  office_discipline: number
  office_morale: number,
  armies: Armies,
  units: Units
}
