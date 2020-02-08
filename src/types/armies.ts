import { DefinitionValues } from "definition_values"
import { GeneralCalc, UnitType, UnitValueType, BaseCohort, Cohort } from "./units"
import { DefinitionType, Mode } from "types/definition"
import { TacticType } from "./tactics"

export enum ArmyName {
  Army1 = 'Army 1'
}

export type GeneralStats = {
  enabled: boolean
  martial: number
  base_martial: number
  trait_martial: number
}

export type Armies = { [key in Mode]: { [key in ArmyName]: Army } }

export interface General extends DefinitionValues<GeneralCalc> {
  enabled: boolean
  definitions: { [key in UnitType | DefinitionType]: DefinitionValues<UnitValueType> }
}

export type UnitPreferences = { [key in UnitPreferenceType]: UnitType | null }

export interface Army extends BaseCohorts {
  tactic: TacticType
  unit_preferences: UnitPreferences
  flank_size: number
  general: General
}

export enum ArmyType {
  Frontline = 'Frontline',
  Reserve = 'Reserve',
  Defeated = 'Defeated'
}


export enum UnitPreferenceType {
  Primary = 'Primary',
  Secondary = 'Secondary',
  Flank = 'Flank'
}

export type BaseFrontLine = (BaseCohort | null)[]
export type BaseReserve = BaseCohort[]
export type BaseDefeated = BaseCohort[]
export type FrontLine = (Cohort | null)[]
export type Reserve = Cohort[]
export type Defeated = Cohort[]

export interface BaseCohorts {
  frontline: BaseFrontLine
  reserve: BaseReserve
  defeated: BaseDefeated
}

export interface Cohorts {
  frontline: FrontLine
  reserve: Reserve
  defeated: Defeated
}
