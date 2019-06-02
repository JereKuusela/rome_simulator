import { createAction } from 'typesafe-actions'
import { ArmyName, Unit, ArmyType, UnitType } from '../units'
import { TerrainType } from '../terrains'
import { TacticType } from '../tactics'
import { RowType } from './types'

export const selectUnit = createAction('@@land_battle/SELECT_UNIT', action => {
  return (army: ArmyName, type: ArmyType, index: number, unit: Unit | undefined) => action({ army, type, index, unit })
})

export const removeReserveUnits = createAction('@@land_battle/REMOVE_RESERVE_UNITS', action => {
  return (army: ArmyName, types: UnitType[]) => action({ army, types })
})

export const addReserveUnits = createAction('@@land_battle/ADD_RESERVE_UNITS', action => {
  return (army: ArmyName, units: Unit[]) => action({ army, units })
})

export const selectTerrain = createAction('@@land_battle/SELECT_TERRAIN', action => {
  return (index: number, type: TerrainType) => action({ index, terrain: type })
})

export const selectTactic = createAction('@@land_battle/SELECT_TACTIC', action => {
  return (army: ArmyName, type: TacticType) => action({ army, tactic: type })
})

export const setRowType = createAction('@@land_battle/SELECT_ROW_TYPE', action => {
  return (army: ArmyName, row_type: RowType, unit: UnitType) => action({ army, row_type, unit })
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

export const setFlankSize = createAction('@@land_battle/SET_FLANK_SIZE', action => {
  return (army: ArmyName, size: number) => action({army, size})
})
