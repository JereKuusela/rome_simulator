import { Army, Cohorts } from "types"
import { SideType } from "./battle"

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
  averageDays: number
  stackWipes: number
  days: { [key: number]: number }
}

export interface CasualtiesProgress {
  avgMoraleA: number
  avgStrengthA: number
  avgMoraleB: number
  avgStrengthB: number
  maxMoraleA: number
  maxStrengthA: number
  maxMoraleB: number
  maxStrengthB: number
  moraleA: { [key: string]: number }
  moraleB: { [key: string]: number }
  strengthA: { [key: string]: number }
  strengthB: { [key: string]: number }
  winRateA: number
  winRateB: number
}

export interface ResourceLossesProgress {
  lossesA: ResourceLosses
  lossesB: ResourceLosses
}

export type ResourceLosses = {
  repairMaintenance: number
  destroyedCost: number
  capturedCost: number
  seizedCost: number
  seizedRepairMaintenance: number
}

export type CombatNode = {
  cohortsA: Cohorts
  cohortsB: Cohorts
  // Each node iterates over all branches (each branch has different dice rolls).
  branchIndex: number
  // Combat phase of this node, used to get dice rolls.
  combatPhase: number
  // Deeper nodes (longer battles) have less impact on the result (more branches).
  weightIndex: number
  // Round of the current combat may be different then the day.
  round: number
  // Day can't be calculatged from phase because these can be non-combat rounds.
  day: number
  // Attacker may change during the battle.
  attacker: SideType
  deployedA: Army[]
  deployedB: Army[]
  armiesA: Army[]
  armiesB: Army[]
}