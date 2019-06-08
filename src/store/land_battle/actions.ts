import { createAction } from 'typesafe-actions'
import { Unit, ArmyType, UnitType, ArmyName } from '../units'
import { TerrainType } from '../terrains'
import { TacticType } from '../tactics'
import { RowType, ParticipantType } from './types'

export const selectUnit = createAction('@@land_battle/SELECT_UNIT', action => {
  return (participant: ParticipantType, type: ArmyType, index: number, unit: Unit | undefined) => action({ participant, type, index, unit })
})

export const removeReserveUnits = createAction('@@land_battle/REMOVE_RESERVE_UNITS', action => {
  return (participant: ParticipantType, types: UnitType[]) => action({ participant, types })
})

export const addReserveUnits = createAction('@@land_battle/ADD_RESERVE_UNITS', action => {
  return (participant: ParticipantType, units: Unit[]) => action({ participant, units })
})

export const selectTerrain = createAction('@@land_battle/SELECT_TERRAIN', action => {
  return (index: number, type: TerrainType) => action({ index, terrain: type })
})

export const selectTactic = createAction('@@land_battle/SELECT_TACTIC', action => {
  return (participant: ParticipantType, type: TacticType) => action({ participant, tactic: type })
})

export const setRowType = createAction('@@land_battle/SELECT_ROW_TYPE', action => {
  return (participant: ParticipantType, row_type: RowType, unit: UnitType) => action({ participant, row_type, unit })
})

export const battle = createAction('@@land_battle/BATTLE', action => {
  return (steps: number) => action({steps})
})

export const undo = createAction('@@land_battle/UNDO', action => {
  return (steps: number) => action({steps})
})

export const toggleRandomRoll = createAction('@@land_battle/TOGGLE_RANDOM_ROLL', action => {
  return (participant: ParticipantType) => action({participant})
})

export const setRoll = createAction('@@land_battle/SET_ROLL', action => {
  return (participant: ParticipantType, roll: number) => action({participant, roll})
})

export const setGeneral = createAction('@@land_battle/SET_GENERAL', action => {
  return (participant: ParticipantType, skill: number) => action({participant, skill})
})

export const setFlankSize = createAction('@@land_battle/SET_FLANK_SIZE', action => {
  return (participant: ParticipantType, size: number) => action({participant, size})
})

export const setArmyName = createAction('@@land_battle/SET_ARMY_NAME', action => {
  return (participant: ParticipantType, name: ArmyName) => action({participant, name})
})