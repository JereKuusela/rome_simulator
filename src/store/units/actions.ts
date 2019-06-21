import { createAction } from 'typesafe-actions'
import { ValuesType } from '../../base_definition'

import { TerrainType } from '../terrains'
import { calculateValue, BaseDefinition, toPercent, toRelativeZeroPercent } from '../../base_definition'

export enum UnitType {
  Archers = 'Archers',
  WarElephants = 'War Elephants',
  LightInfantry = 'Light Infantry',
  LightCavalry = 'Light Cavalry',
  HorseArchers = 'Horse Archers',
  HeavyInfantry = 'Heavy Infantry',
  Chariots = 'Chariots',
  HeavyCavalry = 'Heavy Cavalry',
  CamelCavalry = 'Camel Cavalry'
}

export enum UnitCalc {
  ManpowerDepleted = 'Manpower killed',
  MoraleDepleted = 'Morale depleted',
  Morale = 'Morale',
  Manpower = 'Manpower',
  Discipline = 'Discipline',
  Offense = 'Offense',
  Defense = 'Defense',
  Maneuver = 'Maneuver',
  MoraleDamageTaken = 'Morale damage taken',
  StrengthDamageTaken = 'Strength damage taken',
  MoraleDamageDone = 'Morale damage done',
  StrengthDamageDone = 'Strength damage done',
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
}

export interface UnitDefinition extends BaseDefinition<UnitType, ValueType> {
  readonly requirements: string
  readonly can_assault: boolean
}

export const valueToString = (definition: BaseDefinition<UnitType, ValueType>, type: ValueType): string => {
  const value = calculateValue(definition, type)
  switch (type) {
    case UnitCalc.Cost:
    case UnitCalc.Maneuver:
    case UnitCalc.Manpower:
    case UnitCalc.ManpowerDepleted:
    case UnitCalc.Morale:
    case UnitCalc.MoraleDepleted:
    case UnitCalc.MovementSpeed:
    case UnitCalc.RecruitTime:
    case UnitCalc.Upkeep:
      return (+(Math.max(0, calculateValue(definition, type)).toFixed(2))).toString()
    case UnitCalc.Discipline:
    case UnitCalc.Offense:
    case UnitCalc.Defense:
    case UnitCalc.Experience:
      return toPercent(value, true)
    default:
      return toRelativeZeroPercent(value, true)
  }
}

export enum ArmyName {
  Attacker = 'Army 1',
  Defender = 'Army 2'
}

export enum ArmyType {
  Main = 'Main',
  Reserve = 'Reserve',
  Defeated = 'Defeated'
}

export const setValue = createAction('@@units/SET_VALUE', action => {
  return (army: ArmyName, type: ValuesType, unit: UnitType, key: string, attribute: ValueType, value: number) => action({ army,type,  unit, key, attribute, value })
})

export const setGlobalValue = createAction('@@units/SET_GLOBAL_VALUE', action => {
  return (army: ArmyName, type: ValuesType, key: string, attribute: ValueType, value: number) => action({ army, type, key, attribute, value })
})

export const deleteUnit = createAction('@@units/DELETE_UNIT', action => {
  return (army: ArmyName, type: UnitType) => action({ army, type })
})

export const addUnit = createAction('@@units/ADD_UNIT', action => {
  return (army: ArmyName, type: UnitType) => action({ army, type })
})

export const changeType = createAction('@@units/CHANGE_TYPE', action => {
  return (army: ArmyName, old_type: UnitType, new_type: UnitType) => action({ army, old_type, new_type })
})

export const changeImage = createAction('@@units/CHANGE_IMAGE', action => {
  return (army: ArmyName, type: UnitType, image: string) => action({ army, type, image })
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
