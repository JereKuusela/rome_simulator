import { BaseUnit, UnitType, Unit } from '../units/actions'
import { TerrainType } from '../terrains/actions'
import { TacticType } from '../tactics/actions'
import { DefinitionType, Mode } from '../../base_definition'
import { CountryName } from '../countries'
import { ObjSet } from '../../utils'

export enum RowType {
  Front = 'Front',
  Back = 'Back',
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
  readonly name: CountryName
  readonly rounds: BaseUnits[],
  readonly rolls: Rolls[],
  readonly roll: number,
  readonly randomize_roll: boolean
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

export const getInitialTerrains = (mode: DefinitionType): TerrainType[] => {
  if (mode === DefinitionType.Naval)
    return [TerrainType.Ocean]
  else
    return [TerrainType.None, TerrainType.Plains]
} 

const getInitialTactic = (mode: Mode): TacticType => mode === DefinitionType.Land ? TacticType.ShockAction : TacticType.FrontalAssault

const getInitialRowTypes = (mode: Mode): RowTypes => {
  if (mode === DefinitionType.Naval) {
    return {
      [RowType.Front]: UnitType.MegaGalley,
      [RowType.Back]: UnitType.MegaGalley,
      [RowType.Flank]: UnitType.MegaGalley
    }
  }
  else {
    return {
      [RowType.Front]: UnitType.Archers,
      [RowType.Back]: UnitType.HeavyInfantry,
      [RowType.Flank]: UnitType.LightCavalry
    }
  }
}

const initializeDefaultArmy = (mode: Mode): Army => ({
  frontline: Array(30).fill(null),
  reserve: [],
  defeated: [],
  tactic: getInitialTactic(mode),
  row_types: getInitialRowTypes(mode),
  flank_size: 5,
  selections: {}
})
const defaultLandArmy = initializeDefaultArmy(DefinitionType.Land)
const defaultNavalArmy = initializeDefaultArmy(DefinitionType.Naval)

export const getDefaultArmy = (mode: Mode): Army => {
  if (mode === DefinitionType.Naval)
    return defaultNavalArmy
  return defaultLandArmy
}

export const getDefaultParticipant = (name: CountryName): Participant => {
  return {
    name,
    rounds: [],
    rolls: [],
    roll: 3,
    randomize_roll: false
  }
}
