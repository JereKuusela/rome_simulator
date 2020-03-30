import { TacticDefinition, CombatPhase, UnitPreferences, UnitType, UnitAttribute, UnitRole, Mode, UnitValueType } from "types"

/**
 * Information required for fast combat calculation.
 * CombatUnits contain most of the information precalculated.
 */
export type CombatParticipant = {
  cohorts: CombatCohorts
  tactic_bonus: number
  round: number
  unit_types: CombatUnitTypes
  tactic: TacticDefinition
  flank_ratio: number
  flank_ratio_bonus: number
  flank: number
  dice: number
  terrain_pips: number
  general_pips: { [key in CombatPhase]: number }
  roll_pips: { [key in CombatPhase]: number }
  unit_preferences: UnitPreferences
}
export type CombatFrontline = (CombatCohort | null)[][]
export type CombatReserve = CombatCohort[]
export type CombatDefeated = CombatCohort[]
export type CombatUnitTypes = { [key in UnitType]: CombatCohortDefinition }

export type CombatCohorts = {
  frontline: CombatFrontline
  reserve: SortedReserve
  defeated: CombatDefeated
  left_flank: number
  right_flank: number
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
  calculated: CombatCohortCalculated
  state: CombatCohortRoundInfo
  definition: CombatCohortDefinition
}

/**
 * Static part of a unit. Properties which don't change during the battle.
 */
export interface CombatCohortCalculated {
  damage: { [key in UnitAttribute.Strength | UnitAttribute.Morale | 'Damage']: { [key in UnitType]: { [key in CombatPhase]: number } } }  // Damage multiplier for each damage type, versus each unit and for each phase.
  damage_taken_multiplier: number
  morale_taken_multiplier: number
  strength_taken_multiplier: { [key in CombatPhase]: number }
}

type UnitCalcs = { [key in (UnitValueType)]: number }

export interface CombatCohortDefinition extends UnitCalcs {
  id: number
  image: string
  type: UnitType
  is_loyal: boolean
  experience: number
  deployment: UnitRole
  max_strength: number
  max_morale: number
  experience_reduction: number
  deployment_cost: number
  base?: UnitType
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
  target_support: CombatCohort | null
  /** Lost morale this round. */
  morale_loss: number
  /** Lost strength this round. */
  strength_loss: number
  /** Morale losses inflicted this round. */
  morale_dealt: number
  /** Strength losses inflicted this round. */
  strength_dealt: number
  /** Damage multiplier. */
  damage_multiplier: number
  /** Did the cohort get defeated. */
  is_defeated: boolean
  /** Did the cohort get destroyed.  */
  is_destroyed: boolean
  /** Is the cohort considered weak for targeting.  */
  is_weak: boolean
  /** Total morale losses inflicted during the battle. */
  total_morale_dealt: number
  /** Total strength losses inflicted during the battle. */
  total_strength_dealt: number
  /** Chance to get captured in case of getting defeated.  */
  capture_chance?: number
}
