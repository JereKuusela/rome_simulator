import { DataValues } from 'data_values'
import { Mode } from 'types/definition'
import { TacticType, TacticData } from './tactics'
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
import { filter } from 'utils'

export enum ArmyName {
  Army = 'Army',
  Navy = 'Navy'
}

export enum CharacterAttribute {
  Martial = 'Martial',
  Finesse = 'Finesse',
  Charisma = 'Charisma',
  Zeal = 'Zeal',
  Maneuver = 'Maneuver',
  Health = 'Health',
  Age = 'Age',
  Fertility = 'Fertility'
}

const attributes = [
  CharacterAttribute.Martial,
  CharacterAttribute.Charisma,
  CharacterAttribute.Finesse,
  CharacterAttribute.Zeal
]
export const isStatAttribute = (attribute: CharacterAttribute) => attributes.includes(attribute)
export const filterStatAttributes = (attributes: Record<CharacterAttribute, number>) =>
  filter(attributes, (_, attribute) => isStatAttribute(attribute))

export type GeneralDefinition = {
  tactic: TacticData
  selections: Selections
  enabled: boolean
  baseValues: GeneralValues
  extraValues: GeneralValues
  values: GeneralValues
}

export type GeneralValues = { [key in GeneralValueType]: number }

export type GeneralValueType = CharacterAttribute | CombatPhase

export type Armies = { [key in ArmyName]: ArmyData }

export interface GeneralData extends DataValues<GeneralValueType> {
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
  crossingSupport: number
  armySize: number
  tactic: TacticData
  participantIndex: number
  general: { [key in GeneralValueType]: number }
}
