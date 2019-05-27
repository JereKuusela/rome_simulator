import { List, fromJS } from 'immutable'
import { TerrainDefinition } from '../terrains'
import { UnitDefinition } from '../units'
import { TacticDefinition } from '../tactics'

export interface PastState {
  army: List<UnitDefinition | undefined>
  reserve: List<UnitDefinition>
  defeated: List<UnitDefinition>
  roll: number
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
    past: List<PastState>()
  })
