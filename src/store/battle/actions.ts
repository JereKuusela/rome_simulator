import { createAction } from 'typesafe-actions'
import { List, Map, fromJS } from 'immutable'
import { Unit, UnitType } from '../units'
import { TerrainType } from '../terrains'
import { TacticType } from '../tactics'
import { CountryName } from '../countries'
import { DefinitionType } from '../../base_definition'

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
  readonly country: CountryName
}

export enum ParticipantType {
  Attacker = 'Attacker',
  Defender = 'Defender'
}

export enum ArmyType {
  Frontline = 'Frontline',
  Reserve = 'Reserve',
  Defeated = 'Defeated'
}

export enum ArmyName {
  Attacker = 'Army 1',
  Defender = 'Army 2'
}

export const getInitialTerrains = (mode: DefinitionType): List<TerrainType> => {
  if (mode === DefinitionType.Naval) {
    return List<TerrainType>().push(TerrainType.Ocean)
  }
  else {
    return List<TerrainType>().push(TerrainType.None).push(TerrainType.Plains)
  }
} 

const getInitialTactic = (mode: DefinitionType): TacticType => mode === DefinitionType.Land ? TacticType.ShockAction : TacticType.FrontalAssault

const getInitialRowTypes = (mode: DefinitionType): Map<RowType, UnitType | undefined> => {
  if (mode === DefinitionType.Naval) {
    return Map<RowType, UnitType | undefined>()
      .set(RowType.Front, UnitType.MegaGalley)
      .set(RowType.Back, UnitType.MegaGalley)
      .set(RowType.Flank, UnitType.MegaGalley)
  }
  else {
    return Map<RowType, UnitType | undefined>()
      .set(RowType.Front, UnitType.Archers)
      .set(RowType.Back, UnitType.HeavyInfantry)
      .set(RowType.Flank, UnitType.LightCavalry)
  }
}

export const getInitialArmy = (mode: DefinitionType, country: CountryName): Participant => ({
  frontline: fromJS(Array(30).fill(undefined)),
  reserve: List<Unit>(),
  defeated: List<Unit>(),
  general: 0,
  tactic: getInitialTactic(mode),
  roll: 0,
  randomize_roll: true,
  row_types: getInitialRowTypes(mode),
  flank_size: 5,
  country: country
})

export const selectUnit = createAction('@@battle/SELECT_UNIT', action => {
  return (mode: DefinitionType, name: ArmyName, type: ArmyType, index: number, unit: Unit | undefined) => action({ mode, name, type, index, unit })
})

export const removeReserveUnits = createAction('@@battle/REMOVE_RESERVE_UNITS', action => {
  return (mode: DefinitionType, name: ArmyName, types: UnitType[]) => action({ mode, name, types })
})

export const addReserveUnits = createAction('@@battle/ADD_RESERVE_UNITS', action => {
  return (mode: DefinitionType, name: ArmyName, units: Unit[]) => action({ mode, name, units })
})

export const selectTerrain = createAction('@@battle/SELECT_TERRAIN', action => {
  return (mode: DefinitionType, index: number, type: TerrainType) => action({ mode, index, terrain: type })
})

export const selectTactic = createAction('@@battle/SELECT_TACTIC', action => {
  return (mode: DefinitionType, name: ArmyName, type: TacticType) => action({ mode, name, tactic: type })
})

export const setRowType = createAction('@@battle/SELECT_ROW_TYPE', action => {
  return (mode: DefinitionType, name: ArmyName, row_type: RowType, unit: UnitType | undefined) => action({ mode, name, row_type, unit })
})

export const battle = createAction('@@battle/BATTLE', action => {
  return (mode: DefinitionType, steps: number) => action({ mode, steps })
})

export const undo = createAction('@@battle/UNDO', action => {
  return (mode: DefinitionType, steps: number) => action({ mode, steps })
})

export const toggleRandomRoll = createAction('@@battle/TOGGLE_RANDOM_ROLL', action => {
  return (mode: DefinitionType, name: ArmyName) => action({ mode, name })
})

export const setRoll = createAction('@@battle/SET_ROLL', action => {
  return (mode: DefinitionType, name: ArmyName, roll: number) => action({ mode, name, roll })
})

export const setGeneral = createAction('@@battle/SET_GENERAL', action => {
  return (mode: DefinitionType, name: ArmyName, skill: number) => action({ mode, name, skill })
})

export const setFlankSize = createAction('@@battle/SET_FLANK_SIZE', action => {
  return (mode: DefinitionType, name: ArmyName, size: number) => action({ mode, name, size })
})

export const selectArmy = createAction('@@battle/SELECT_ARMY', action => {
  return (mode: DefinitionType, type: ParticipantType, name: ArmyName) => action({ mode, type, name })
})

export const clearUnits = createAction('@@battle/CLEAR_UNITS', action => {
  return (mode: DefinitionType, ) => action({ mode })
})

export const deleteArmy = createAction('@@battle/DELETE_ARMY', action => {
  return (army: ArmyName) => action({ army })
})

export const createArmy = createAction('@@battle/CREATE_ARMY', action => {
  return (army: ArmyName) => action({ army })
})

export const duplicateArmy = createAction('@@battle/DUPLICATE_ARMY', action => {
  return (source: ArmyName, army: ArmyName) => action({ source, army })
})

export const changeName = createAction('@@battle/CHANGE_NAME', action => {
  return (old_army: ArmyName, new_army: ArmyName) => action({ old_army, new_army })
})
