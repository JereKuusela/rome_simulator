import { UnitType, UnitValueType, UnitDefinition, UnitAttribute, CombatPhase, CountryName, ArmyName, Mode, UnitRole, Army } from 'types'
import { DefinitionValues } from 'definition_values'


/** An identity of a cohort. Used to store data but shouldn't be used for anything else. */
export interface CohortData extends DefinitionValues<UnitValueType> {
  type: UnitType
  isLoyal?: boolean
}



/** A full cohort (merged with unit definition). */
export interface CohortDefinition extends CohortData, UnitDefinition {}

export type UnitProperties = {[key in UnitType]: CohortProperties}

/**
 * Interface designed for fast combat calculations. This data is cached in simulations (keep lightweight).
 */
export interface Cohort {
  [UnitAttribute.Morale]: number
  [UnitAttribute.Strength]: number
  /** Is the cohort considered weak for targeting.  */
  isWeak: boolean
  state: CohortRoundInfo
  properties: CohortProperties
}

type UnitCalcs = { [key in (UnitValueType)]: number }

/**
 * Static part of a cohort. Properties which don't change during the battle.
 */
export interface CohortProperties extends UnitCalcs {
  damage: { [key in UnitAttribute.Strength | UnitAttribute.Morale | 'Damage']: { [key in UnitType]: { [key in CombatPhase]: number } } }  // Damage multiplier for each damage type, versus each unit and for each phase.
  damageTakenMultiplier: number
  moraleTakenMultiplier: number
  strengthTakenMultiplier: { [key in CombatPhase]: number }
  participantIndex: number
  countryName: CountryName
  armyName: ArmyName
  index: number
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

  // These technically change during battle but are only needed for UI.
  reinforcementPenalty: number
  deploymentPenalty: number
  winningMoraleBonus: number
}

/** Round specific state for a cohort. */
export interface CohortRoundInfo {
  /** Is attacking diagonally. */
  flanking: boolean
  /** Targeted enemy cohort. */
  target: Cohort | null
  /** Support cohort behind the targeted enemy. */
  targetSupport: Cohort | null
  /** Lost morale this round. */
  moraleLoss: number
  /** Lost strength this round. */
  strengthLoss: number
  /** Morale losses inflicted this round. */
  moraleDealt: number
  /** Strength losses inflicted this round. */
  strengthDealt: number
  /** Damage taken multiplier from insufficied support. */
  flankRatioPenalty: number
  /** Damage multiplier. */
  damageMultiplier: number
  /** Did the cohort get defeated. */
  isDefeated: boolean
  /** The round of defeat. */
  defeatedDay: number 
  /** The cohort which targeted this cohort last. */
  targetedBy: Cohort | null 
  /** The cohort which defeated this cohort. */
  defeatedBy: Cohort | null 
  /** The army which stack wiped this cohort. */
  stackWipedBy: Army | null 
  /** Did the cohort get destroyed.  */
  isDestroyed: boolean
  /** Total morale losses inflicted during the battle. */
  totalMoraleDealt: number
  /** Total strength losses inflicted during the battle. */
  totalStrengthDealt: number
  /** Chance of getting captured.  */
  captureChance: number
}

export type Cohorts = {
  frontline: Frontline
  reserve: Reserve
  defeated: Cohort[]
  retreated: Cohort[]
}

export type ReserveData = CohortData[]
export type ReserveDefinition = CohortDefinition[]

export type Reserve = {
  front: Cohort[]
  flank: Cohort[]
  support: Cohort[]
}

export type Frontline = (Cohort | null)[][]
