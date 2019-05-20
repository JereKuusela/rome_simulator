import { createAction } from 'typesafe-actions'
import { ArmyType, UnitDefinition } from '../units'
import { TerrainDefinition } from '../terrains'

export const selectUnit = createAction('@@land_battle/SELECT_UNIT', action => {
  return (army: ArmyType, row: number, column: number, unit: UnitDefinition | null) => action({ army, row, column, unit })
})

export const selectTerrain = createAction('@@land_battle/SELECT_TERRAIN', action => {
  return (index: number, terrain: TerrainDefinition) => action({ index, terrain })
})

export const battle = createAction('@@land_battle/BATTLE', action => {
  return () => action({})
})
