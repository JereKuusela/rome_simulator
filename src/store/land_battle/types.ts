import { List, fromJS } from 'immutable'
import { TerrainDefinition } from '../terrains'
import { UnitDefinition } from '../units'
import { TacticDefinition } from '../tactics'

export interface ParticipantState {
  readonly army: List<List<(UnitDefinition | null)>>
  readonly tactic: TacticDefinition | null
  readonly general: number
}

export const getInitialTerrains = (): List<TerrainDefinition> => List<TerrainDefinition>()

export const getInitialArmy = (): ParticipantState => ({ army: fromJS(Array(2).fill(Array(30).fill(null))), general: 0, tactic: null})