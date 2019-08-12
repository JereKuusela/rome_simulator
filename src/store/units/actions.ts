import { createAction } from 'typesafe-actions'
import { OrderedMap, Map } from 'immutable'
import { TerrainType } from '../terrains'
import { CountryName } from '../countries'
import { calculateValue, BaseDefinition, ValuesType, DefinitionType } from '../../base_definition'
import { toPercent, toSignedPercent, toNumber } from '../../formatters'

export enum UnitType {
  Archers = 'Archers',
  CamelCavalry = 'Camel Cavalry',
  Chariots = 'Chariots',
  HeavyCavalry = 'Heavy Cavalry',
  HeavyInfantry = 'Heavy Infantry',
  HorseArchers = 'Horse Archers',
  LightCavalry = 'Light Cavalry',
  LightInfantry = 'Light Infantry',
  WarElephants = 'War Elephants',
  Liburnian = 'Liburnian',
  Trireme = 'Trireme',
  Tetrere = 'Tetrere',
  Hexere = 'Hexere',
  Octere = 'Octere',
  MegaGalley = 'Mega Galley'
}

export enum UnitCalc {
  StrengthDepleted = 'Strength depleted',
  MoraleDepleted = 'Morale depleted',
  Morale = 'Morale',
  Strength = 'Strength',
  Discipline = 'Discipline',
  Offense = 'Offense',
  Defense = 'Defense',
  Maneuver = 'Maneuver',
  MoraleDamageDone = 'Morale damage done',
  MoraleDamageTaken = 'Morale damage taken',
  StrengthDamageDone = 'Strength damage done',
  StrengthDamageTaken = 'Strength damage taken',
  DamageDone = 'Damage done',
  DamageTaken = 'Damage taken',
  MovementSpeed = 'Movement speed',
  RecruitTime = 'Recruit time',
  Cost = 'Cost',
  Maintenance = 'Maintenance',
  AttritionWeight = 'Attrition weight',
  Experience = 'Experience'
}

export type UnitDefinitions = OrderedMap<UnitType, UnitDefinition>
export type GlobalDefinitions = Map<DefinitionType, UnitDefinition>

export type ValueType = UnitCalc | UnitType | TerrainType

export interface BaseUnit extends BaseDefinition<UnitType, ValueType> {
  readonly is_defeated?: boolean
  readonly target?: number | null
  readonly id: number
}

export interface UnitDefinition extends BaseDefinition<UnitType, ValueType> {
  readonly requirements: string
  readonly can_assault: boolean
  readonly mode: DefinitionType
}

export interface Unit extends BaseUnit, UnitDefinition { }


export const valueToString = (definition: BaseDefinition<UnitType, ValueType>, type: ValueType): string => {
  const value = calculateValue(definition, type)
  switch (type) {
    case UnitCalc.Cost:
    case UnitCalc.Maneuver:
    case UnitCalc.Strength:
    case UnitCalc.StrengthDepleted:
    case UnitCalc.Morale:
    case UnitCalc.MoraleDepleted:
    case UnitCalc.MovementSpeed:
    case UnitCalc.RecruitTime:
      return toNumber(value)
    case UnitCalc.Experience:
    case UnitCalc.Maintenance:
    case UnitCalc.AttritionWeight:
      return toPercent(value)
    default:
      return toSignedPercent(value)
  }
}

export const setValue = createAction('@@units/SET_VALUE', action => {
  return (country: CountryName, type: ValuesType, unit: UnitType, key: string, attribute: ValueType, value: number) => action({ country, type, unit, key, attribute, value })
})

export const setGlobalValue = createAction('@@units/SET_GLOBAL_VALUE', action => {
  return (country: CountryName, mode: DefinitionType, type: ValuesType, key: string, attribute: ValueType, value: number) => action({ country, mode, type, key, attribute, value })
})

export const deleteUnit = createAction('@@units/DELETE_UNIT', action => {
  return (country: CountryName, type: UnitType) => action({ country, type })
})

export const addUnit = createAction('@@units/ADD_UNIT', action => {
  return (country: CountryName, mode: DefinitionType, type: UnitType) => action({ country, mode, type })
})

export const changeType = createAction('@@units/CHANGE_TYPE', action => {
  return (country: CountryName, old_type: UnitType, new_type: UnitType) => action({ country, old_type, new_type })
})

export const changeImage = createAction('@@units/CHANGE_IMAGE', action => {
  return (country: CountryName, type: UnitType, image: string) => action({ country, type, image })
})

export const changeMode = createAction('@@units/CHANGE_MODE', action => {
  return (country: CountryName, type: UnitType, mode: DefinitionType) => action({ country, type, mode })
})

