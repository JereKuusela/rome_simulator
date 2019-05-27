import { List, Map, fromJS } from 'immutable'
import { TerrainDefinition } from '../terrains'
import { UnitDefinition, UnitType } from '../units'
import { TacticDefinition } from '../tactics'

export interface PastState {
  army: List<UnitDefinition | undefined>
  reserve: List<UnitDefinition>
  defeated: List<UnitDefinition>
  roll: number
}

export enum RowType {
  Front = 'Front',
  Back = 'Back',
  Flank = 'Flank'
}

export interface ParticipantState {
  readonly army: List<UnitDefinition | undefined>
  readonly reserve: List<UnitDefinition>
  readonly defeated: List<UnitDefinition>
  readonly past: List<PastState>
  readonly tactic: TacticDefinition | undefined
  readonly roll: number
  readonly randomize_roll: boolean
  readonly general: number
  readonly row_types: Map<RowType, UnitType>
  readonly flank_size: number
}

export const getInitialTerrains = (): List<TerrainDefinition> => List<TerrainDefinition>()

export const getInitialArmy = (): ParticipantState => ({
    army: fromJS(Array(30).fill(undefined)),
    reserve: List<UnitDefinition>(),
    defeated: List<UnitDefinition>(),
    general: 0,
    tactic: undefined,
    roll: 0,
    randomize_roll: true,
    past: List<PastState>(),
    row_types: Map<RowType, UnitType>().set(RowType.Front, UnitType.Archers).set(RowType.Back, UnitType.HeavyInfantry).set(RowType.Flank, UnitType.LightCavalry),
    flank_size: 5
  })
