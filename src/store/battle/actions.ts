import { createAction } from 'typesafe-actions'
import { List, Map, fromJS, Set } from 'immutable'
import { Unit, UnitType } from '../units/actions'
import { TerrainType } from '../terrains/actions'
import { TacticType } from '../tactics/actions'
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
  readonly selections: Set<string>
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
  country: country,
  selections: Set<string>()
})

export const selectUnit = createAction('@@battle/SELECT_UNIT', action => {
  return (mode: DefinitionType, army: ArmyName, type: ArmyType, index: number, unit: Unit | undefined) => action({ mode, army, type, index, unit })
})

export const removeReserveUnits = createAction('@@battle/REMOVE_RESERVE_UNITS', action => {
  return (mode: DefinitionType, army: ArmyName, types: UnitType[]) => action({ mode, army, types })
})

export const addReserveUnits = createAction('@@battle/ADD_RESERVE_UNITS', action => {
  return (mode: DefinitionType, army: ArmyName, units: Unit[]) => action({ mode, army, units })
})

export const selectTerrain = createAction('@@battle/SELECT_TERRAIN', action => {
  return (mode: DefinitionType, index: number, terrain: TerrainType) => action({ mode, index, terrain })
})

export const selectTactic = createAction('@@battle/SELECT_TACTIC', action => {
  return (mode: DefinitionType, army: ArmyName, tactic: TacticType) => action({ mode, army, tactic })
})

export const setRowType = createAction('@@battle/SELECT_ROW_TYPE', action => {
  return (mode: DefinitionType, army: ArmyName, row_type: RowType, unit: UnitType | undefined) => action({ mode, army, row_type, unit })
})

export const battle = createAction('@@battle/BATTLE', action => {
  return (mode: DefinitionType, steps: number) => action({ mode, steps })
})

export const undo = createAction('@@battle/UNDO', action => {
  return (mode: DefinitionType, steps: number) => action({ mode, steps })
})

export const toggleRandomRoll = createAction('@@battle/TOGGLE_RANDOM_ROLL', action => {
  return (mode: DefinitionType, army: ArmyName) => action({ mode, army })
})

export const setRoll = createAction('@@battle/SET_ROLL', action => {
  return (mode: DefinitionType, army: ArmyName, roll: number) => action({ mode, army, roll })
})

export const setGeneral = createAction('@@battle/SET_GENERAL', action => {
  return (mode: DefinitionType, army: ArmyName, skill: number) => action({ mode, army, skill })
})

export const setFlankSize = createAction('@@battle/SET_FLANK_SIZE', action => {
  return (mode: DefinitionType, army: ArmyName, size: number) => action({ mode, army, size })
})

export const selectArmy = createAction('@@battle/SELECT_ARMY', action => {
  return (mode: DefinitionType, type: ParticipantType, army: ArmyName) => action({ mode, type, army })
})

export const clearUnits = createAction('@@battle/CLEAR_UNITS', action => {
  return (mode: DefinitionType, ) => action({ mode })
})
