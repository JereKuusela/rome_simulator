
import { Map } from 'immutable'
import { BaseDefinition } from '../../utils'

export enum UnitCalc {
  Morale = 'Morale',
  Discipline = 'Discipline',
  Manpower = 'Manpower',
  Offense = 'Offense',
  Defense = 'Defense',
  MoraleDamageTaken = 'Morale damage taken',
  StrengthDamageTaken = 'Strength damage taken',
  MovementSpeed = 'Movement speed',
  Maneuver = 'Maneuver',
  RecruitTime = 'Recruit time',
  Cost = 'Cost',
  Upkeep = 'Upkeep',
  AttritionWeight = 'Attrition weight',
  Experience = 'Experience'

}

export type ValueType = UnitCalc | UnitType
type MapValues = Map<ValueType, Map<string, number>>


export class UnitDefinition extends BaseDefinition<UnitType, ValueType> {

  constructor(readonly type: UnitType, public readonly image: string, public readonly requirements: string, public readonly can_assault: boolean,
    readonly base_values: MapValues = Map(), readonly modifier_values: MapValues = Map(),  readonly loss_values: MapValues = Map()) {
      super(type, base_values, modifier_values, loss_values)
  }

  valueToString = (type: ValueType): string => {
    const value = this.calculateValue(type)
    switch (type) {
      case UnitCalc.Cost:
      case UnitCalc.Maneuver:
      case UnitCalc.Manpower:
      case UnitCalc.Morale:
      case UnitCalc.MovementSpeed:
      case UnitCalc.RecruitTime:
      case UnitCalc.Upkeep:
        return String(value)
      default:
        return this.toPercent(value)
    }
  }

  add_base_values = (key: string, values: [ValueType, number][]): UnitDefinition => {
    const new_values = this.add_values(this.base_values, key, values)
    return new UnitDefinition(this.type, this.image, this.requirements, this.can_assault, new_values, this.modifier_values, this.loss_values)
  }

  add_base_value = (key: string, type: ValueType, value: number): UnitDefinition => {
    const new_values = this.add_values(this.base_values, key, [[type, value]])
    return new UnitDefinition(this.type, this.image, this.requirements, this.can_assault, new_values, this.modifier_values, this.loss_values)
  }

  add_modifier_values = (key: string, values: [ValueType, number][]): UnitDefinition => {
    const new_values = this.add_values(this.modifier_values, key, values)
    return new UnitDefinition(this.type, this.image, this.requirements, this.can_assault, this.base_values, new_values, this.loss_values)
  }

  add_modifier_value = (key: string, type: ValueType, value: number): UnitDefinition => {
    const new_values = this.add_values(this.modifier_values, key, [[type, value]])
    return new UnitDefinition(this.type, this.image, this.requirements, this.can_assault, this.base_values, new_values, this.loss_values)
  }

  add_loss_values = (key: string, values: [ValueType, number][]): UnitDefinition => {
    const new_values = this.add_values(this.loss_values, key, values)
    return new UnitDefinition(this.type, this.image, this.requirements, this.can_assault, this.base_values, this.modifier_values, new_values)
  }

  add_loss_value = (key: string, type: ValueType, value: number): UnitDefinition => {
    const new_values = this.add_values(this.loss_values, key, [[type, value]])
    return new UnitDefinition(this.type, this.image, this.requirements, this.can_assault, this.base_values, this.modifier_values, new_values)
  }
}

export enum ArmyType {
  Attacker = 'Attacker',
  Defender = 'Defender'
}


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


// TODO: Allow editing unit properties.
