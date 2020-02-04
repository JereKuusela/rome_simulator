import { ObjSet } from "utils"
import { CultureType, GovermentType, ReligionType } from "./modifiers"
import { Armies } from "./armies"

export enum CountryName {
  Country1 = 'Country 1',
  Country2 = 'Country 2'
}
export type Countries = { [key in CountryName]: Country }

export interface Country {
  selections: ObjSet
  culture: CultureType
  government: GovermentType
  religion: ReligionType
  omen_power: number
  military_power: number
  office_discipline: number
  office_morale: number,
  armies: Armies
}
