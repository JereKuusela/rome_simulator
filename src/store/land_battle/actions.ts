import { createAction } from 'typesafe-actions'
import { ArmyName, UnitDefinition, ArmyType } from '../units'
import { TerrainDefinition } from '../terrains'
import { TacticDefinition } from '../tactics'

export const selectUnit = createAction('@@land_battle/SELECT_UNIT', action => {
  return (army: ArmyName, type: ArmyType, row: number, column: number, unit: UnitDefinition | null) => action({ army, type, row, column, unit })
})

export const selectTerrain = createAction('@@land_battle/SELECT_TERRAIN', action => {
  return (index: number, terrain: TerrainDefinition) => action({ index, terrain })
})

export const selectTactic = createAction('@@land_battle/SELECT_TACTIC', action => {
  return (army: ArmyName, tactic: TacticDefinition) => action({ army, tactic })
})

export const battle = createAction('@@land_battle/BATTLE', action => {
  return (steps: number) => action({steps})
})

export const undo = createAction('@@land_battle/UNDO', action => {
  return (steps: number) => action({steps})
})

export const toggleRandomRoll = createAction('@@land_battle/TOGGLE_RANDOM_ROLL', action => {
  return (army: ArmyName) => action({army})
})

export const setRoll = createAction('@@land_battle/SET_ROLL', action => {
  return (army: ArmyName, roll: number) => action({army, roll})
})

export const setGeneral = createAction('@@land_battle/SET_GENERAL', action => {
  return (army: ArmyName, skill: number) => action({army, skill})
})
