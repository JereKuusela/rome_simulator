import { DefinitionValues } from "definition_values"
import { UnitType, CohortDefinition, Cohort, UnitDefinitionValues, UnitRole, Units } from "./units"
import { Mode } from "types/definition"
import { TacticType, TacticDefinition } from "./tactics"
import { CombatPhase } from "./battle"
import { Selections } from "types"

export enum ArmyName {
  Army1 = 'Army 1'
}

export enum GeneralAttribute {
  Martial = 'Martial',
  Maneuver = 'Maneuver'
}

export type General = {
  selections: Selections
  enabled: boolean
  base_values: { [key in GeneralValueType]: number }
  extra_values: { [key in GeneralValueType]: number }
  total_values: { [key in GeneralValueType]: number }
}

export type GeneralValueType = GeneralAttribute | CombatPhase

export type Armies = { [key in Mode]: { [key in ArmyName]: Army } }

export interface GeneralDefinition extends DefinitionValues<GeneralValueType> {
  selections: Selections
  enabled: boolean
  definitions: UnitDefinitionValues
}

export type UnitPreferences = { [key in UnitPreferenceType | UnitRole]: UnitType | null }

export type Army = {
  tactic: TacticType
  unit_preferences: UnitPreferences
  flank_size: number
  general: GeneralDefinition
  frontline: FrontlineDefinition
  reserve: ReserveDefinition
  defeated: DefeatedDefinition
}

export enum ArmyType {
  Frontline = 'Frontline',
  Reserve = 'Reserve',
  Defeated = 'Defeated'
}


export enum UnitPreferenceType {
  Primary = 'Primary',
  Secondary = 'Secondary',
  Flank = 'PrimaryFlank'
}

export type FrontlineDefinition = { [key: string]: { [key: string]: CohortDefinition } }
export type ReserveDefinition = CohortDefinition[]
export type DefeatedDefinition = CohortDefinition[]
export type FrontLine = (Cohort | null)[][]
export type Reserve = Cohort[]
export type Defeated = Cohort[]

export interface Cohorts {
  frontline: FrontLine
  reserve: Reserve
  defeated: Defeated
}


export interface ArmyForCombatConversion extends Cohorts {
  tactic?: TacticDefinition
  definitions: Units
  general: General
  unit_preferences: UnitPreferences
  flank_size: number
  flank_ratio: number
}
