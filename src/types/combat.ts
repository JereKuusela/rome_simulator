import { TacticDefinition, CombatPhase, UnitPreferences, UnitType, UnitAttribute, UnitRole, Mode, UnitValueType, GeneralValueType } from 'types'
import { Units } from './units'
import { SideType } from './battle'
import { TerrainDefinition } from './terrains'
import { Settings } from './settings'

/**
 * Information required for fast combat calculation.
 * CombatUnits contain most of the information precalculated.
 */
export type CombatParticipant = {
  reserve: SortedReserve
  flankSize: number
  definitions: Units
  arrival: number
  strength: number
  general: CombatGeneral
}

/** Information affecting both sides of combat. */
export type CombatField = {
  round: number
  terrains: TerrainDefinition[]
  settings: Settings
}

/** Results from combat (mainly for tooltips). */
export type CombatResults = {
  round: number
  tacticBonus: number
  flankRatioBonus: number
  dailyMultiplier: number
  terrainPips: number
  generalPips: number
  dice: number
}

export type CombatGeneral = {
  unitPreferences: UnitPreferences
  leftFlank: number
  rightFlank: number
  priority: number
  tactic: TacticDefinition
  values: { [key in GeneralValueType]: number }
}

export type CombatSide = {
  results: CombatResults
  alive: boolean
  participants: CombatParticipant[]
  flankRatio: number
  generals: CombatGeneral[]
  cohorts: CombatCohorts
  type: SideType
}

export type CombatFrontline = (CombatCohort | null)[][]
export type CombatReserve = CombatCohort[]
export type CombatDefeated = CombatCohort[]

export type CombatCohorts = {
  frontline: CombatFrontline
  reserve: SortedReserve
  defeated: CombatDefeated
}

export type SortedReserve = {
  front: CombatCohort[]
  flank: CombatCohort[]
  support: CombatCohort[]
}

/**
 * Interface designed for fast combat calculations. This data is cached in simulations (keep lightweight).
 */
export interface CombatCohort {
  [UnitAttribute.Morale]: number
  [UnitAttribute.Strength]: number
  /** Is the cohort considered weak for targeting.  */
  isWeak: boolean
  calculated: CombatCohortCalculated
  state: CombatCohortRoundInfo
  definition: CombatCohortDefinition
}

/**
 * Static part of a unit. Properties which don't change during the battle.
 */
export interface CombatCohortCalculated {
  damage: { [key in UnitAttribute.Strength | UnitAttribute.Morale | 'Damage']: { [key in UnitType]: { [key in CombatPhase]: number } } }  // Damage multiplier for each damage type, versus each unit and for each phase.
  damageTakenMultiplier: number
  moraleTakenMultiplier: number
  strengthTakenMultiplier: { [key in CombatPhase]: number }
}

type UnitCalcs = { [key in (UnitValueType)]: number }

export interface CombatCohortDefinition extends UnitCalcs {
  id: number
  image: string
  type: UnitType
  isLoyal: boolean
  experience: number
  maxStrength: number
  maxMorale: number
  experienceReduction: number
  deploymentCost: number
  parent?: UnitType
  mode: Mode
  tech?: number
  role?: UnitRole
}

/** Round specific state for a cohort. */
export interface CombatCohortRoundInfo {
  /** Is attacking diagonally. */
  flanking: boolean
  /** Targeted enemy cohort. */
  target: CombatCohort | null
  /** Support cohort behind the targeted enemy. */
  targetSupport: CombatCohort | null
  /** Lost morale this round. */
  moraleLoss: number
  /** Lost strength this round. */
  strengthLoss: number
  /** Morale losses inflicted this round. */
  moraleDealt: number
  /** Strength losses inflicted this round. */
  strengthDealt: number
  /** Damage multiplier. */
  damageMultiplier: number
  /** Did the cohort get defeated. */
  isDefeated: boolean
  /** Did the cohort get destroyed.  */
  isDestroyed: boolean
  /** Total morale losses inflicted during the battle. */
  totalMoraleDealt: number
  /** Total strength losses inflicted during the battle. */
  totalStrengthDealt: number
  /** Chance to get captured in case of getting defeated.  */
  captureChance?: number
}
