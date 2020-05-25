import { CountryName, Mode, TerrainType, Terrain, Settings, Cohorts } from 'types'
import { ArmyName, Army } from './armies'

export type Battle = {
  terrains: TerrainType[]
  sides: { [key in SideType]: SideData }
  days: {
    round: number
    startingPhaseNumber: number
    attacker: SideType
  }[]
  fightOver: boolean
  seed: number
  customSeed?: number
  outdated: boolean
  timestamp: number
}

export enum CombatPhase {
  Fire = 'Fire',
  Shock = 'Shock',
  Default = 'Default'
}

export type SideData = {
  type: SideType
  participants: Participant[]
  days: Side[]
  rolls: number[]
  dice: number
  randomizeDice: boolean
}

export type ModeState = { [key in Mode]: Battle }

export type Participant = {
  countryName: CountryName
  armyName: ArmyName
  daysUntilBattle: number
}

export enum SideType {
  A = 'Attacker',
  B = 'Defender'
}

/** Information affecting both sides of combat. */
export type Environment = {
  round: number
  day: number
  terrains: Terrain[]
  settings: Settings
  attacker: SideType
}

/** Results from combat (mainly for tooltips). */
export type SideRoundInfo = {
  round: number
  tacticBonus: number
  flankRatioBonus: number
  dailyMultiplier: number
  tacticStrengthDamageMultiplier: number
  terrainPips: number
  generalPips: number
  dice: number
}

export type Side = {
  results: SideRoundInfo
  alive: boolean
  armies: Army[]
  flankRatio: number
  deployed: Army[]
  cohorts: Cohorts
  type: SideType
}
