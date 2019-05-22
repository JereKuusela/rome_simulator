import { List, fromJS } from 'immutable'
import { TerrainDefinition } from '../terrains'
import { UnitDefinition } from '../units'
import { TacticDefinition } from '../tactics'

export interface ParticipantState {
  readonly army: List<List<(UnitDefinition | null)>>
  readonly defeated_army: List<List<(UnitDefinition | null)>>
  readonly past: List<{ army: List<List<(UnitDefinition | null)>>, defeated_army: List<List<(UnitDefinition | null)>> }>
  readonly tactic: TacticDefinition | null
  readonly roll: number
  readonly general: number
}

export const getInitialTerrains = (): List<TerrainDefinition> => List<TerrainDefinition>()

export const getInitialArmy = (): ParticipantState => ({
    army: fromJS(Array(2).fill(Array(30).fill(null))),
    defeated_army: fromJS(Array(2).fill(Array(30).fill(null))),
    general: 0,
    tactic: null,
    roll: 0,
    past: List<{ army: List<List<(UnitDefinition | null)>>, defeated_army: List<List<(UnitDefinition | null)>> }>()
  })
