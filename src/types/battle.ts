import { CountryName, Mode, TerrainType, CombatParticipant } from 'types'

export interface Battle {
  terrains: TerrainType[]
  participants: Participants
  round: number
  fight_over: boolean
  seed: number
  custom_seed?: number
  outdated: boolean
  timestamp: number
}

export enum CombatPhase {
  Fire = 'Fire',
  Shock = 'Shock',
  Default = 'Default'
}

export type Participants = { [key in Side]: Participant }
export type ModeState = { [key in Mode]: Battle }

interface Rolls {
  dice: number
  randomized: boolean
}

export interface Participant {
  country: CountryName
  rounds: CombatParticipant[],
  rolls: Rolls[],
  dice: number,
  randomize_roll: boolean
}

export enum Side {
  Attacker = 'Attacker',
  Defender = 'Defender'
}
