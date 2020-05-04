import { CountryName, Mode, TerrainType, CombatParticipant } from 'types'
import { ArmyName } from './armies'
import { CombatSide } from './combat'

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
  rounds: CombatSide[]
  rolls: number[]
  dice: number
  randomize_dice: boolean
}

export type Sides = { [key in SideType]: Side }
export type ModeState = { [key in Mode]: Battle }

export type Participant = {
  countryName: CountryName
  armyName: ArmyName
  daysUntilBattle: number
}

export enum SideType {
  Attacker = 'Attacker',
  Defender = 'Defender'
}
