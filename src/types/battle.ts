import { CountryName, Mode, TerrainType } from 'types'
import { CombatUnits } from 'combat'

export interface Battle {
  terrains: TerrainType[],
  participants: Participants,
  round: number,
  fight_over: boolean,
  seed: number,
  custom_seed?: number,
  outdated: boolean
}

export type Participants = { [key in Side]: Participant }
export type ModeState = { [key in Mode]: Battle }

interface Rolls {
  roll: number
  randomized: boolean
}

export interface Participant {
  country: CountryName
  rounds: CombatUnits[],
  rolls: Rolls[],
  roll: number,
  randomize_roll: boolean
}

export enum Side {
  Attacker = 'Attacker',
  Defender = 'Defender'
}
