import { List, Map, fromJS } from 'immutable'
import { TerrainType } from '../terrains'
import { Unit, UnitType } from '../units'
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
  readonly past: List<PastState>
  readonly tactic: TacticType
  readonly roll: number
  readonly randomize_roll: boolean
  readonly general: number
  readonly row_types: Map<RowType, UnitType>
  readonly flank_size: number
}

export const getInitialTerrains = () => List<TerrainType>().push(TerrainType.None).push(TerrainType.Plains)

export const getInitialArmy = (): Participant => ({
    army: fromJS(Array(30).fill(undefined)),
    reserve: List<Unit>(),
    defeated: List<Unit>(),
    general: 0,
    tactic: TacticType.ShockAction,
    roll: 0,
    randomize_roll: true,
    past: List<PastState>(),
    row_types: Map<RowType, UnitType>().set(RowType.Front, UnitType.Archers).set(RowType.Back, UnitType.HeavyInfantry).set(RowType.Flank, UnitType.LightCavalry),
    flank_size: 5
  })
