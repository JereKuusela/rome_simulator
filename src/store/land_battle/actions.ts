import { createAction } from 'typesafe-actions'
import { List, Map, fromJS } from 'immutable'
import { Unit, ArmyType, UnitType, ArmyName } from '../units'
import { TerrainType } from '../terrains'
import { TacticType } from '../tactics'

export interface PastState extends Army {
  roll: number
}

export enum RowType {
  Front = 'Front',
  Back = 'Back',
  Flank = 'Flank'
}

export interface Army {
  readonly frontline: List<Unit | undefined>
  readonly reserve: List<Unit>
  readonly defeated: List<Unit>
}

export interface Participant extends Army {
  readonly tactic: TacticType
  readonly roll: number
  readonly randomize_roll: boolean
  readonly general: number
  readonly row_types: Map<RowType, UnitType | undefined>
  readonly flank_size: number
}

export enum ParticipantType {
  Attacker = 'Attacker',
  Defender = 'Defender'
}

export const getInitialTerrains = (): List<TerrainType> => List<TerrainType>().push(TerrainType.None).push(TerrainType.Plains)

export const getInitialArmy = (): Participant => ({
  frontline: fromJS(Array(30).fill(undefined)),
  reserve: List<Unit>(),
  defeated: List<Unit>(),
  general: 0,
  tactic: TacticType.ShockAction,
  roll: 0,
  randomize_roll: true,
  row_types: Map<RowType, UnitType | undefined>().set(RowType.Front, UnitType.Archers).set(RowType.Back, UnitType.HeavyInfantry).set(RowType.Flank, UnitType.LightCavalry),
  flank_size: 5
})

export const selectUnit = createAction('@@land_battle/SELECT_UNIT', action => {
  return (name: ArmyName, type: ArmyType, index: number, unit: Unit | undefined) => action({ name, type, index, unit })
})

export const removeReserveUnits = createAction('@@land_battle/REMOVE_RESERVE_UNITS', action => {
  return (name: ArmyName, types: UnitType[]) => action({ name, types })
})

export const addReserveUnits = createAction('@@land_battle/ADD_RESERVE_UNITS', action => {
  return (name: ArmyName, units: Unit[]) => action({ name, units })
})

export const selectTerrain = createAction('@@land_battle/SELECT_TERRAIN', action => {
  return (index: number, type: TerrainType) => action({ index, terrain: type })
})

export const selectTactic = createAction('@@land_battle/SELECT_TACTIC', action => {
  return (name: ArmyName, type: TacticType) => action({ name, tactic: type })
})

export const setRowType = createAction('@@land_battle/SELECT_ROW_TYPE', action => {
  return (name: ArmyName, row_type: RowType, unit: UnitType | undefined) => action({ name, row_type, unit })
})

export const battle = createAction('@@land_battle/BATTLE', action => {
  return (steps: number) => action({steps})
})

export const undo = createAction('@@land_battle/UNDO', action => {
  return (steps: number) => action({steps})
})

export const toggleRandomRoll = createAction('@@land_battle/TOGGLE_RANDOM_ROLL', action => {
  return (name: ArmyName) => action({name})
})

export const setRoll = createAction('@@land_battle/SET_ROLL', action => {
  return (name: ArmyName, roll: number) => action({name, roll})
})

export const setGeneral = createAction('@@land_battle/SET_GENERAL', action => {
  return (name: ArmyName, skill: number) => action({name, skill})
})

export const setFlankSize = createAction('@@land_battle/SET_FLANK_SIZE', action => {
  return (name: ArmyName, size: number) => action({name, size})
})

export const selectArmy = createAction('@@land_battle/SELECT_ARMY', action => {
  return (type: ParticipantType, name: ArmyName) => action({type, name})
})

export const clearUnits = createAction('@@land_battle/CLEAR_UNITS', action => {
  return () => action({})
})
