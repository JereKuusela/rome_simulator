import { CountryName, Mode, TerrainType, CombatParticipant } from 'types'
import { ArmyName } from './armies'

export type Battle = {
  terrains: TerrainType[]
  sides: Sides
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

export type Side = {
  type: SideType
  participants: Participant[]
  rounds: CombatParticipant[]
  rolls: number[]
  dice: number
  randomize_dice: boolean
}

export type Sides = { [key in SideType]: Side }
export type ModeState = { [key in Mode]: Battle }

export type Participant = {
  country: CountryName
  army: ArmyName
  daysUntilBattle: number
}

export enum SideType {
  Attacker = 'Attacker',
  Defender = 'Defender'
}
