import { List, fromJS } from 'immutable'
import { TerrainType } from '../terrains'
import { UnitDefinition } from '../units'

export interface ParticipantState {
  readonly army: List<List<(UnitDefinition | null)>>;
  readonly general: number
}

export const getInitialTerrains = (): TerrainType[] => [TerrainType.None, TerrainType.Farmland]

export const getInitialArmy = (): ParticipantState => ({ army: fromJS(Array(2).fill(Array(30).fill(null))), general: 0})