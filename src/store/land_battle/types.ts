import { List, fromJS } from 'immutable'
import { TerrainDefinition } from '../terrains'
import { UnitDefinition } from '../units'
import { TacticDefinition } from '../tactics'

export interface PastState {
  army: List<List<(UnitDefinition | null)>>
  reserve: List<List<(UnitDefinition | null)>>
  defeated: List<List<(UnitDefinition | null)>>
  roll: number
}

export interface ParticipantState {
  readonly army: List<List<(UnitDefinition | null)>>
  readonly reserve: List<List<(UnitDefinition | null)>>
  readonly defeated: List<List<(UnitDefinition | null)>>
  readonly past: List<PastState>
  readonly tactic: TacticDefinition | null
  readonly roll: number
  readonly randomize_roll: boolean
  readonly general: number
}

export const getInitialTerrains = (): List<TerrainDefinition> => List<TerrainDefinition>()

export const getInitialArmy = (): ParticipantState => ({
    army: fromJS(Array(1).fill(Array(30).fill(null))),
    reserve: fromJS(Array(1).fill(Array(30).fill(null))),
    defeated: fromJS(Array(1).fill(Array(30).fill(null))),
    general: 0,
    tactic: null,
    roll: 0,
    randomize_roll: true,
    past: List<{ army: List<List<(UnitDefinition | null)>>, reserve: List<List<(UnitDefinition | null)>>, defeated: List<List<(UnitDefinition | null)>>, roll: number }>()
  })
