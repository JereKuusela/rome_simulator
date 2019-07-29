import { createAction } from 'typesafe-actions'
import { List, Map, fromJS, Set } from 'immutable'
import { Unit, UnitType } from '../units/actions'
import { TerrainType } from '../terrains/actions'
import { TacticType } from '../tactics/actions'
import { DefinitionType } from '../../base_definition'
import { CountryName } from '../countries'

export interface RoundState extends Army {
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
  readonly row_types: Map<RowType, UnitType | undefined>
  readonly flank_size: number
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

const initializeDefaultArmy = (mode: DefinitionType): Participant => ({
  frontline: fromJS(Array(30).fill(undefined)),
  reserve: List<Unit>(),
  defeated: List<Unit>(),
  tactic: getInitialTactic(mode),
  roll: 3,
  randomize_roll: false,
  row_types: getInitialRowTypes(mode),
  flank_size: 5,
  selections: Set<string>()
})
const defaultLandArmy = initializeDefaultArmy(DefinitionType.Land)
const defaultNavalArmy = initializeDefaultArmy(DefinitionType.Naval)

export const getDefaultArmy = (mode: DefinitionType): Participant => {
  if (mode === DefinitionType.Naval)
    return defaultNavalArmy
  return defaultLandArmy
}

export const selectUnit = createAction('@@battle/SELECT_UNIT', action => {
  return (mode: DefinitionType, country: CountryName, type: ArmyType, index: number, unit: Unit | undefined) => action({ mode, country, type, index, unit })
})

export const removeReserveUnits = createAction('@@battle/REMOVE_RESERVE_UNITS', action => {
  return (mode: DefinitionType, country: CountryName, types: UnitType[]) => action({ mode, country, types })
})

export const addReserveUnits = createAction('@@battle/ADD_RESERVE_UNITS', action => {
  return (mode: DefinitionType, country: CountryName, units: Unit[]) => action({ mode, country, units })
})

export const selectTerrain = createAction('@@battle/SELECT_TERRAIN', action => {
  return (mode: DefinitionType, index: number, terrain: TerrainType) => action({ mode, index, terrain })
})

export const selectTactic = createAction('@@battle/SELECT_TACTIC', action => {
  return (mode: DefinitionType, country: CountryName, tactic: TacticType) => action({ mode, country, tactic })
})

export const setRowType = createAction('@@battle/SELECT_ROW_TYPE', action => {
  return (mode: DefinitionType, country: CountryName, row_type: RowType, unit: UnitType | undefined) => action({ mode, country, row_type, unit })
})

export const battle = createAction('@@battle/BATTLE', action => {
  return (mode: DefinitionType, steps: number) => action({ mode, steps })
})

export const setSeed = createAction('@@battle/SET_SEED', action => {
  return (mode: DefinitionType, seed?: number) => action({ mode, seed })
})

export const undo = createAction('@@battle/UNDO', action => {
  return (mode: DefinitionType, steps: number) => action({ mode, steps })
})

export const toggleRandomRoll = createAction('@@battle/TOGGLE_RANDOM_ROLL', action => {
  return (mode: DefinitionType, country: CountryName) => action({ mode, country })
})

export const setRoll = createAction('@@battle/SET_ROLL', action => {
  return (mode: DefinitionType, country: CountryName, roll: number) => action({ mode, country, roll })
})

export const setFlankSize = createAction('@@battle/SET_FLANK_SIZE', action => {
  return (mode: DefinitionType, country: CountryName, size: number) => action({ mode, country, size })
})

export const selectArmy = createAction('@@battle/SELECT_ARMY', action => {
  return (mode: DefinitionType, type: ParticipantType, country: CountryName) => action({ mode, type, country })
})

export const clearUnits = createAction('@@battle/CLEAR_UNITS', action => {
  return (mode: DefinitionType, ) => action({ mode })
})
