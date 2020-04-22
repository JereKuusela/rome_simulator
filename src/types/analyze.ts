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
  iterations: number
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
