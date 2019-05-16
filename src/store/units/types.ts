
import { Map } from 'immutable'

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

type ValueType = UnitCalc | UnitType
type MapValues = Map<ValueType, Map<string, number>>


export class UnitDefinition {

  constructor(public readonly type: UnitType, public readonly image: string, public readonly requirements: string, public readonly can_assault: boolean,
    public readonly base_values: Map<UnitCalc | UnitType, Map<string, number>> = Map(), public readonly modifier_values: Map<UnitCalc | UnitType, Map<string, number>> = Map(),
    public readonly loss_values: Map<UnitCalc | UnitType, Map<string, number>> = Map()) {

  }

  toPercent = (number: number) => +(number * 100).toFixed(2) + '%'

  calculateValue = (type: ValueType): number => {
    let base = 0
    const value_base = this.base_values.get(type)
    if (value_base)
      value_base.forEach(value => base += value)
    let modifier = 1.0
    const value_modifier = this.modifier_values.get(type)
    if (value_modifier)
      value_modifier.forEach(value => modifier += value)
    let loss = 0
    const value_loss = this.loss_values.get(type)
    if (value_loss)
      value_loss.forEach(value => loss += value)
    return base * modifier - loss
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

  explain = (type: ValueType) => {
    let base = 0
    const value_base = this.base_values.get(type)
    if (value_base)
      value_base.forEach(value => base += value)
    let explanation = 'Base value ' + base
    if (value_base) {
      explanation += ' ('
      value_base.forEach((value, key) => explanation += key + ': ' + value + ',')
      explanation = explanation.substring(0, explanation.length - 1) + ')'
    }
    let modifier = 1.0
    const value_modifier = this.modifier_values.get(type)
    if (value_modifier)
      value_modifier.forEach(value => modifier += value)
    explanation += ' multiplied by ' + this.toPercent(modifier)
    if (value_modifier && value_modifier.size > 0) {
      explanation += ' ('
      value_modifier.forEach((value, key) => explanation += key + ': ' + this.toPercent(value) + ',')
      explanation = explanation.substring(0, explanation.length - 1) + ')'
    }
    let loss = 0
    const value_loss = this.loss_values.get(type)
    if (value_loss)
      value_loss.forEach(value => loss += value)
    if (value_loss && value_loss.size > 0) {
      explanation += ' reduced by losses ' + loss
      explanation += ' ('
      value_loss.forEach((value, key) => explanation += key + ': ' + value + ',')
      explanation = explanation.substring(0, explanation.length - 1) + ')'
    }
    return explanation
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

  private add_values = (container: MapValues, key: string, values: [ValueType, number][]): MapValues => {
    let new_values = container
    for (const [type, value] of values) {
      new_values = new_values.has(type) ? new_values : new_values.set(type, Map<string, number>())
      const type_values = new_values.get(type)
      if (!type_values)
        return new_values
      if (value === 0 && type_values.has(key))
        new_values = new_values.set(type, type_values.delete(key))
      else
        new_values = new_values.set(type, type_values.set(key, value))
    }
    return new_values
  }

  get_base_value = (type: ValueType, key: string): number => this.get_value(this.base_values, type, key)

  get_modifier_value = (type: ValueType, key: string): number => this.get_value(this.modifier_values, type, key)

  private get_value = (container: MapValues, type: ValueType, key: string): number => {
    const values = container.get(type)
    if (!values)
      return 0
    const value = values.get(key)
    if (!value)
      return 0
    return value
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
