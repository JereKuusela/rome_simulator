import { List, Map, fromJS } from 'immutable'
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

export interface BaseUnits {
  readonly frontline: List<BaseUnit | undefined>
  readonly reserve: List<BaseUnit>
  readonly defeated: List<BaseUnit>
}

export interface Units {
  readonly frontline: List<Unit | undefined>
  readonly reserve: List<Unit>
  readonly defeated: List<Unit>
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

export interface Army extends BaseUnits {
  readonly tactic: TacticType
  readonly row_types: Map<RowType, UnitType | undefined>
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

const getInitialRowTypes = (mode: Mode): Map<RowType, UnitType | undefined> => {
  if (mode === DefinitionType.Naval) {
    return Map<RowType, UnitType | undefined>()
      .set(RowType.Front, UnitType.MegaGalley)
      .set(RowType.Back, UnitType.MegaGalley)
      .set(RowType.Flank, UnitType.MegaGalley)
  }
  else {
    return Map<RowType, UnitType | undefined>()
      .set(RowType.Front, UnitType.Archers)
      .set(RowType.Back, UnitType.HeavyInfantry)
      .set(RowType.Flank, UnitType.LightCavalry)
  }
}

const initializeDefaultArmy = (mode: Mode): Army => ({
  frontline: fromJS(Array(30).fill(undefined)),
  reserve: List<BaseUnit>(),
  defeated: List<BaseUnit>(),
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
