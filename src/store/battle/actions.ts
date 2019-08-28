import { List, Map, fromJS, Set } from 'immutable'
import { BaseUnit, UnitType, Unit } from '../units/actions'
import { TerrainType } from '../terrains/actions'
import { TacticType } from '../tactics/actions'
import { DefinitionType } from '../../base_definition'
import { CountryName } from '../countries'

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
  readonly rounds: List<BaseUnits>,
  readonly rolls: List<Rolls>,
  readonly roll: number,
  readonly randomize_roll: boolean
}

export interface Army extends BaseUnits {
  readonly tactic: TacticType
  readonly row_types: Map<RowType, UnitType | undefined>
  readonly flank_size: number
  readonly selections: Set<string>
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

export const getInitialTerrains = (mode: DefinitionType): List<TerrainType> => {
  if (mode === DefinitionType.Naval) {
    return List<TerrainType>().push(TerrainType.Ocean)
  }
  else {
    return List<TerrainType>().push(TerrainType.None).push(TerrainType.Plains)
  }
} 

const getInitialTactic = (mode: DefinitionType): TacticType => mode === DefinitionType.Land ? TacticType.ShockAction : TacticType.FrontalAssault

const getInitialRowTypes = (mode: DefinitionType): Map<RowType, UnitType | undefined> => {
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

const initializeDefaultArmy = (mode: DefinitionType): Army => ({
  frontline: fromJS(Array(30).fill(undefined)),
  reserve: List<BaseUnit>(),
  defeated: List<BaseUnit>(),
  tactic: getInitialTactic(mode),
  row_types: getInitialRowTypes(mode),
  flank_size: 5,
  selections: Set<string>()
})
const defaultLandArmy = initializeDefaultArmy(DefinitionType.Land)
const defaultNavalArmy = initializeDefaultArmy(DefinitionType.Naval)

export const getDefaultArmy = (mode: DefinitionType): Army => {
  if (mode === DefinitionType.Naval)
    return defaultNavalArmy
  return defaultLandArmy
}

export const getDefaultParticipant = (name: CountryName): Participant => {
  return {
    name,
    rounds: List<BaseUnits>(),
    rolls: List<Rolls>(),
    roll: 3,
    randomize_roll: false
  }
}
