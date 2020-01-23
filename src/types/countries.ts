import { BaseDefinitionValues, DefinitionValues } from "definition_values"
import { GeneralCalc, UnitType, UnitValueType } from "./units"
import { DefinitionType } from "types/definition"
import { ObjSet } from "utils"
import { CultureType, GovermentType, ReligionType } from "./modifiers"

export enum CountryName {
  Country1 = 'Country 1',
  Country2 = 'Country 2'
}

export type Countries = { [key in CountryName]: Country }

export interface General extends BaseDefinitionValues<GeneralCalc> {
  enabled: boolean
  definitions: { [key in UnitType | DefinitionType]: DefinitionValues<UnitValueType> }
}

export interface Country {
  selections: ObjSet
  culture: CultureType
  government: GovermentType
  religion: ReligionType
  omen_power: number
  military_power: number
  office_discipline: number
  office_morale: number
  general: General
}
