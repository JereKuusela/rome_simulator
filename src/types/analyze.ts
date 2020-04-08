/**
 * Status of the win rate calculation. Most values are percents, only iterations is integer.
 */
export interface WinRateProgress {
  calculating: boolean
  attacker: number
  defender: number
  incomplete: number
  progress: number
  iterations: number
  average_rounds: number,
  rounds: { [key: number]: number }
}

export interface CasualtiesProgress {
  avg_morale_a: number
  avg_strength_a: number
  avg_morale_d: number
  avg_strength_d: number
  max_morale_a: number
  max_strength_a: number
  max_morale_d: number
  max_strength_d: number
  morale_a: { [key: string]: number }
  morale_d: { [key: string]: number }
  strength_a: { [key: string]: number }
  strength_d: { [key: string]: number }
}

export interface ResourceLossesProgress {
  losses_a: ResourceLosses
  losses_d: ResourceLosses
}

export type ResourceLosses = {
  repair_maintenance: number
  destroyed_cost: number
  captured_cost: number
  seized_cost: number
  seized_repair_maintenance: number
}
