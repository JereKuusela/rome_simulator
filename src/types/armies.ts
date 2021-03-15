import { DefinitionValues } from 'definition_values'
import { Mode } from 'types/definition'
import { TacticType, TacticDefinition } from './tactics'
import { CombatPhase } from './battle'
import {
  Selections,
  UnitValues,
  UnitRole,
  UnitType,
  Reserve,
  ReserveData,
  ReserveDefinition,
  UnitProperties
} from 'types'
import { UnitDefinitions } from './units'

export enum ArmyName {
  Army = 'Army',
  Navy = 'Navy'
}

export enum GeneralAttribute {
  Martial = 'Martial',
  Maneuver = 'Maneuver'
}

export type GeneralDefinition = {
  tactic: TacticDefinition
  selections: Selections
  enabled: boolean
  baseValues: GeneralValues
  extraValues: GeneralValues
  values: GeneralValues
}

export type GeneralValues = { [key in GeneralValueType]: number }

export type GeneralValueType = GeneralAttribute | CombatPhase

export type Armies = { [key in ArmyName]: ArmyData }

export interface GeneralData extends DefinitionValues<GeneralValueType> {
  tactic: TacticType
  selections: Selections
  enabled: boolean
  definitions: UnitValues
}

export type UnitPreferences = { [key in UnitPreferenceType | UnitRole]: UnitType | null }
export type ArmyData = {
  mode: Mode
  unitPreferences: UnitPreferences
  flankSize: number
  general: GeneralData
  reserve: ReserveData
}

export type ArmyDefinition = {
  unitPreferences: UnitPreferences
  unitDefinitions: UnitDefinitions
  flankSize: number
  flankRatio: number
  general: GeneralDefinition
  reserve: ReserveDefinition
}

export enum ArmyPart {
  Frontline = 'Frontline',
  Reserve = 'Reserve',
  Defeated = 'Defeated',
  Retreated = 'Retreated'
}

export enum UnitPreferenceType {
  Primary = 'Primary',
  Secondary = 'Secondary',
  Flank = 'PrimaryFlank'
}

/**
 * Information required for fast combat calculation.
 * CombatUnits contain most of the information precalculated.
 */
export type Army = {
  reserve: Reserve
  flankSize: number
  flankRatio: number
  arrival: number
  unitPreferences: UnitPreferences
  unitProperties: UnitProperties
  leftFlank: number
  rightFlank: number
  priority: number
  tactic: TacticDefinition
  participantIndex: number
  general: { [key in GeneralValueType]: number }
}
