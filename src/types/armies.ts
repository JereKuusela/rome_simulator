import { DefinitionValues } from "definition_values"
import { UnitType, CohortDefinition, Cohort, UnitDefinitionValues, UnitRole, Units } from "./units"
import { Mode } from "types/definition"
import { TacticType, TacticDefinition } from "./tactics"
import { CombatPhase } from "./battle"
import { Selections } from "types"

export enum ArmyName {
  Army = 'Army',
  Navy = 'Navy'
}

export enum GeneralAttribute {
  Martial = 'Martial',
  Maneuver = 'Maneuver'
}

export type General = {
  tactic: TacticDefinition
  selections: Selections
  enabled: boolean
  baseValues: GeneralValues
  extraValues: GeneralValues
  values: GeneralValues
}

export type GeneralValues = { [key in GeneralValueType]: number }

export type GeneralValueType = GeneralAttribute | CombatPhase

export type Armies = { [key in ArmyName]: ArmyDefinition }

export interface GeneralDefinition extends DefinitionValues<GeneralValueType> {
  tactic: TacticType
  selections: Selections
  enabled: boolean
  definitions: UnitDefinitionValues
}

export type UnitPreferences = { [key in UnitPreferenceType | UnitRole]: UnitType | null }

export type ArmyDefinition = {
  mode: Mode
  unitPreferences: UnitPreferences
  flankSize: number
  general: GeneralDefinition
  reserve: ReserveDefinition
}

export type Army = {
  unitPreferences: UnitPreferences
  flankSize: number
  general: General
  reserve: Reserve
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

export type ReserveDefinition = CohortDefinition[]
export type Reserve = Cohort[]


export interface ArmyForCombatConversion {
  reserve: Reserve
  tactic?: TacticDefinition
  definitions: Units
  general: General
  unitPreferences: UnitPreferences
  flankSize: number
  flankRatio: number
}
