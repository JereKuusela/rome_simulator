import { createAction } from 'typesafe-actions'
import { ArmyType, UnitDefinition } from '../units'
import { TerrainDefinition } from '../terrains'
import { TacticDefinition } from '../tactics'

export const selectUnit = createAction('@@land_battle/SELECT_UNIT', action => {
  return (army: ArmyType, row: number, column: number, unit: UnitDefinition | null) => action({ army, row, column, unit })
})

export const selectDefeatedUnit = createAction('@@land_battle/SELECT_DEFEATED_UNIT', action => {
  return (army: ArmyType, row: number, column: number, unit: UnitDefinition | null) => action({ army, row, column, unit })
})

export const selectTerrain = createAction('@@land_battle/SELECT_TERRAIN', action => {
  return (index: number, terrain: TerrainDefinition) => action({ index, terrain })
})

export const selectTactic = createAction('@@land_battle/SELECT_TACTIC', action => {
  return (army: ArmyType, tactic: TacticDefinition) => action({ army, tactic })
})

export const battle = createAction('@@land_battle/BATTLE', action => {
  return (steps: number) => action({steps})
})

export const undo = createAction('@@land_battle/UNDO', action => {
  return (steps: number) => action({steps})
})

export const toggleRandomRoll = createAction('@@land_battle/TOGGLE_RANDOM_ROLL', action => {
  return (army: ArmyType) => action({army})
})

export const setRoll = createAction('@@land_battle/SET_ROLL', action => {
  return (army: ArmyType, roll: number) => action({army, roll})
})
