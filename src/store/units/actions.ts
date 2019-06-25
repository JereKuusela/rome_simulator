import { createAction } from 'typesafe-actions'
import { ValuesType, DefinitionType } from '../../base_definition'

import { TerrainType } from '../terrains'
import { calculateValue, BaseDefinition, toPercent, toRelativeZeroPercent } from '../../base_definition'

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
  MovementSpeed = 'Movement speed',
  RecruitTime = 'Recruit time',
  Cost = 'Cost',
  Upkeep = 'Upkeep',
  AttritionWeight = 'Attrition weight',
  Experience = 'Experience'
}

export type ValueType = UnitCalc | UnitType | TerrainType

export interface Unit extends BaseDefinition<UnitType, ValueType> {
  readonly is_defeated?: boolean
  readonly target?: number | null
}

export interface UnitDefinition extends BaseDefinition<UnitType, ValueType> {
  readonly requirements: string
  readonly can_assault: boolean
  readonly mode: DefinitionType
}

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
    case UnitCalc.Upkeep:
      return (+(Math.max(0, calculateValue(definition, type)).toFixed(2))).toString()
    case UnitCalc.Experience:
      return toPercent(value)
    default:
      return toRelativeZeroPercent(value, true)
  }
}

export enum ArmyName {
  Attacker = 'Army 1',
  Defender = 'Army 2'
}

export enum ArmyType {
  Frontline = 'Frontline',
  Reserve = 'Reserve',
  Defeated = 'Defeated'
}

export const setValue = createAction('@@units/SET_VALUE', action => {
  return (army: ArmyName, type: ValuesType, unit: UnitType, key: string, attribute: ValueType, value: number) => action({ army,type,  unit, key, attribute, value })
})

export const setGlobalValue = createAction('@@units/SET_GLOBAL_VALUE', action => {
  return (army: ArmyName, mode: DefinitionType, type: ValuesType, key: string, attribute: ValueType, value: number) => action({ army, mode, type, key, attribute, value })
})

export const deleteUnit = createAction('@@units/DELETE_UNIT', action => {
  return (army: ArmyName, type: UnitType) => action({ army, type })
})

export const addUnit = createAction('@@units/ADD_UNIT', action => {
  return (army: ArmyName, mode: DefinitionType, type: UnitType) => action({ army, mode, type })
})

export const changeType = createAction('@@units/CHANGE_TYPE', action => {
  return (army: ArmyName, old_type: UnitType, new_type: UnitType) => action({ army, old_type, new_type })
})

export const changeImage = createAction('@@units/CHANGE_IMAGE', action => {
  return (army: ArmyName, type: UnitType, image: string) => action({ army, type, image })
})

export const changeMode = createAction('@@units/CHANGE_MODE', action => {
  return (army: ArmyName, type: UnitType, mode: DefinitionType) => action({ army, type, mode })
})

export const deleteArmy = createAction('@@units/DELETE_ARMY', action => {
  return (army: ArmyName) => action({ army })
})

export const createArmy = createAction('@@units/CREATE_ARMY', action => {
  return (army: ArmyName) => action({ army })
})

export const duplicateArmy = createAction('@@units/DUPLICATE_ARMY', action => {
  return (source: ArmyName, army: ArmyName) => action({ source, army })
})

export const changeName = createAction('@@units/CHANGE_NAME', action => {
  return (old_army: ArmyName, new_army: ArmyName) => action({ old_army, new_army })
})
