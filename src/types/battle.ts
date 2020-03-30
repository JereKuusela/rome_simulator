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

export interface Participant {
  country: CountryName
  rounds: CombatParticipant[],
  rolls: number[],
  dice: number,
  randomize_dice: boolean
}

export enum Side {
  Attacker = 'Attacker',
  Defender = 'Defender'
}
