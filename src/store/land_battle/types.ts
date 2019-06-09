import { List, Map, fromJS } from 'immutable'
import { TerrainType } from '../terrains'
import { Unit, UnitType, ArmyName } from '../units'
import { TacticType } from '../tactics'

export interface PastState extends Armies {
  roll: number
}

export enum RowType {
  Front = 'Front',
  Back = 'Back',
  Flank = 'Flank'
}

export interface Armies {
  readonly army: List<Unit | undefined>
  readonly reserve: List<Unit>
  readonly defeated: List<Unit>
}

export interface Participant extends Armies {
  readonly tactic: TacticType
  readonly roll: number
  readonly randomize_roll: boolean
  readonly general: number
  readonly row_types: Map<RowType, UnitType>
  readonly flank_size: number
  readonly name: ArmyName
}

export enum ParticipantType {
  Attacker = 'Attacker',
  Defender = 'Defender'
}

export const getInitialTerrains = (): List<TerrainType> => List<TerrainType>().push(TerrainType.None).push(TerrainType.Plains)

export const getInitialArmy = (attacker: boolean): Participant => ({
    army: fromJS(Array(30).fill(undefined)),
    reserve: List<Unit>(),
    defeated: List<Unit>(),
    general: 0,
    tactic: TacticType.ShockAction,
    roll: 0,
    randomize_roll: true,
    row_types: Map<RowType, UnitType>().set(RowType.Front, UnitType.Archers).set(RowType.Back, UnitType.HeavyInfantry).set(RowType.Flank, UnitType.LightCavalry),
    flank_size: 5,
    name: attacker ? ArmyName.Attacker : ArmyName.Defender
  })
