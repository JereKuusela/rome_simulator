import { CombatCohorts } from "types"

/**
 * Status of the win rate calculation. Most values are percents, only iterations is integer.
 */
export interface WinRateProgress {
  calculating: boolean
  attacker: number
  defender: number
  incomplete: number
  progress: number
  draws: number
  battles: number
  averageRounds: number
  stackWipes: number
  rounds: { [key: number]: number }
}

export interface CasualtiesProgress {
  avgMoraleA: number
  avgStrengthA: number
  avgMoraleD: number
  avgStrengthD: number
  maxMoraleA: number
  maxStrengthA: number
  maxMoraleD: number
  maxStrengthD: number
  moraleA: { [key: string]: number }
  moraleD: { [key: string]: number }
  strengthA: { [key: string]: number }
  strengthD: { [key: string]: number }
}

export interface ResourceLossesProgress {
  lossesA: ResourceLosses
  lossesD: ResourceLosses
}

export type ResourceLosses = {
  repairMaintenance: number
  destroyedCost: number
  capturedCost: number
  seizedCost: number
  seizedRepairMaintenance: number
}

export type CombatNode = {
  cohortsA: CombatCohorts,
  cohortsD: CombatCohorts,
  // Each node iterates over all branches (each branch has different dice rolls).
  branchIndex: number,
  // Combat phase of this node, used to calculate combat round.
  combatPhase: number,
  // Deeper nodes (longer battles) have less impact on the result (more branches).
  weightIndex: number
}