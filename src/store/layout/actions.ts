import { createAction } from 'typesafe-actions'

import { ArmyType, UnitDefinition } from '../units'
import { TacticDefinition } from '../tactics'
import { LocationType, TerrainDefinition } from '../terrains'

export const setUnitModal = createAction('@@layout/SET_UNIT_MODAL', action => {
  return (army: ArmyType | null, unit: UnitDefinition | null) => action({ army, unit })
})

export const setTacticModal = createAction('@@layout/SET_TACTIC_MODAL', action => {
  return (tactic: TacticDefinition | null) => action({ tactic })
})

export const setTerrainModal = createAction('@@layout/SET_TERRAIN_MODAL', action => {
  return (location: LocationType | null, terrain: TerrainDefinition | null) => action({ location, terrain })
})
