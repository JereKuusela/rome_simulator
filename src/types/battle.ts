import { CountryName, Mode, TacticType, TerrainType, BaseUnit, UnitType, Unit } from 'types'
import { ObjSet } from 'utils'
import { CombatUnits } from 'combat'

export interface Battle {
  armies: Armies
  terrains: TerrainType[],
  participants: Participants,
  round: number,
  fight_over: boolean,
  seed: number,
  custom_seed?: number,
  outdated: boolean
}

export type Armies = { [key in CountryName]: Army }
export type Participants = { [key in Side]: Participant }
export type ModeState = { [key in Mode]: Battle }

export enum RowType {
  Primary = 'Primary',
  Secondary = 'Secondary',
  Flank = 'Flank'
}

export type BaseFrontLine = (BaseUnit | null)[]
export type BaseReserve = BaseUnit[]
export type BaseDefeated = BaseUnit[]
export type FrontLine = (Unit | null)[]
export type Reserve = Unit[]
export type Defeated = Unit[]

export interface BaseUnits {
  readonly frontline: BaseFrontLine
  readonly reserve: BaseReserve
  readonly defeated: BaseDefeated
}

export interface Units {
  readonly frontline: FrontLine
  readonly reserve: Reserve
  readonly defeated: Defeated
}

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

export type RowTypes = { [key in RowType]: UnitType | null }

export interface Army extends BaseUnits {
  readonly tactic: TacticType
  readonly row_types: RowTypes
  readonly flank_size: number
  readonly selections: ObjSet
}

export enum Side {
  Attacker = 'Attacker',
  Defender = 'Defender'
}

export enum ArmyType {
  Frontline = 'Frontline',
  Reserve = 'Reserve',
  Defeated = 'Defeated'
}
