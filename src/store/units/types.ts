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
  MovementSpeed = 'Movement speed',
  RecruitTime = 'Recruit time',
  Cost = 'Cost',
  Upkeep = 'Upkeep',
  AttritionWeight = 'Attrition weight',
  Experience = 'Experience'
}

export type ValueType = UnitCalc | UnitType | TerrainType

export interface Unit extends BaseDefinition<UnitType, ValueType> {
}

export interface UnitDefinition extends BaseDefinition<UnitType, ValueType> {
  readonly requirements: string
  readonly can_assault: boolean
}

export const valueToString = (definition: UnitDefinition, type: ValueType): string => {
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
  Attacker = 'Attacker',
  Defender = 'Defender'
}

export enum ArmyType {
  Main = 'Main',
  Reserve = 'Reserve',
  Defeated = 'Defeated'
}
