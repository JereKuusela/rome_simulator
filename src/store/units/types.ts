
import { Map, OrderedMap, fromJS } from 'immutable'
import { BaseDefinition, ValuesType } from '../../utils'
import { TerrainType } from '../terrains'

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

export const unitFromJS = (object: Map<string, any>) => {
  if (!object)
    return null
  let base = fromJS(object.get('base_values')!.map((value: OrderedMap<string, number>) => fromJS(value)))
  let modifier = fromJS(object.get('modifier_values')!.map((value: OrderedMap<string, number>) => fromJS(value)))
  let loss = fromJS(object.get('loss_values')!.map((value: OrderedMap<string, number>) => fromJS(value)))
  return new UnitDefinition(object.get('type') as UnitType, object.get('image'), object.get('requirements'), object.get('can_assault'), base, modifier, loss)
}


export type ValueType = UnitCalc | UnitType | TerrainType
type MapValues = Map<ValueType, OrderedMap<string, number>>


export class UnitDefinition extends BaseDefinition<UnitType, ValueType> {

  constructor(readonly type: UnitType, image: string | null, public readonly requirements: string, public readonly can_assault: boolean,
    readonly base_values: MapValues = Map(), readonly modifier_values: MapValues = Map(),  readonly loss_values: MapValues = Map()) {
      super(type, image, base_values, modifier_values, loss_values)
  }

  valueToString = (type: ValueType): string => {
    const value = this.calculateValue(type)
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
        return (+(this.calculateValue(type).toFixed(2))).toString()
      case UnitCalc.Discipline:
      case UnitCalc.Offense:
      case UnitCalc.Defense:
      case UnitCalc.Experience:
        return this.toPercent(value, true)
      default:
        return this.toRelativeZeroPercent(value, true)
    }
  }

  add_base_values = (key: string, values: [ValueType, number][]): UnitDefinition => {
    const new_values = this.add_values(this.base_values, key, values)
    return new UnitDefinition(this.type, this.image, this.requirements, this.can_assault, new_values, this.modifier_values, this.loss_values)
  }

  add_base_value = (key: string, attribute: ValueType, value: number): UnitDefinition => {
    const new_values = this.add_values(this.base_values, key, [[attribute, value]])
    return new UnitDefinition(this.type, this.image, this.requirements, this.can_assault, new_values, this.modifier_values, this.loss_values)
  }

  add_modifier_values = (key: string, values: [ValueType, number][]): UnitDefinition => {
    const new_values = this.add_values(this.modifier_values, key, values)
    return new UnitDefinition(this.type, this.image, this.requirements, this.can_assault, this.base_values, new_values, this.loss_values)
  }

  add_modifier_value = (key: string, attribute: ValueType, value: number): UnitDefinition => {
    const new_values = this.add_values(this.modifier_values, key, [[attribute, value]])
    return new UnitDefinition(this.type, this.image, this.requirements, this.can_assault, this.base_values, new_values, this.loss_values)
  }

  add_loss_values = (key: string, values: [ValueType, number][]): UnitDefinition => {
    const new_values = this.add_values(this.loss_values, key, values)
    return new UnitDefinition(this.type, this.image, this.requirements, this.can_assault, this.base_values, this.modifier_values, new_values)
  }

  add_loss_value = (key: string, attribute: ValueType, value: number): UnitDefinition => {
    const new_values = this.add_values(this.loss_values, key, [[attribute, value]])
    return new UnitDefinition(this.type, this.image, this.requirements, this.can_assault, this.base_values, this.modifier_values, new_values)
  }

  add_value = (type: ValuesType, key: string, attribute: ValueType, value: number): UnitDefinition => {
    if (type === ValuesType.Base)
      return this.add_base_value(key, attribute, value)
    if (type === ValuesType.Loss)
      return this.add_loss_value(key, attribute, value)
    if (type === ValuesType.Modifier)
      return this.add_modifier_value(key, attribute, value)
    return this
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
