
import { Map, OrderedMap, fromJS } from 'immutable'
import { TerrainType } from '../terrains'
import { calculateValue, BaseDefinition, toPercent, toRelativeZeroPercent } from '../../base_definition'
import IconArcher from '../../images/archers.png'
import IconCamelCavalry from '../../images/camel_cavalry.png'
import IconChariots from '../../images/chariots.png'
import IconHeavyCavalry from '../../images/heavy_cavalry.png'
import IconHeavyInfantry from '../../images/heavy_infantry.png'
import IconHorseArchers from '../../images/horse_archers.png'
import IconLightCavalry from '../../images/light_cavalry.png'
import IconLightInfantry from '../../images/light_infantry.png'
import IconWarElephants from '../../images/war_elephants.png'
import IconMilitaryPower from '../../images/military_power.png'

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

const unit_to_icon = Map<UnitType, string>()
  .set(UnitType.Archers, IconArcher)
  .set(UnitType.CamelCavalry, IconCamelCavalry)
  .set(UnitType.Chariots, IconChariots)
  .set(UnitType.HeavyCavalry, IconHeavyCavalry)
  .set(UnitType.HeavyInfantry, IconHeavyInfantry)
  .set(UnitType.HorseArchers, IconHorseArchers)
  .set(UnitType.LightCavalry, IconLightCavalry)
  .set(UnitType.LightInfantry, IconLightInfantry)
  .set(UnitType.WarElephants, IconWarElephants)
  .set('' as UnitType, IconMilitaryPower)

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

export const unitFromJS = (object: Map<string, any>): Unit | undefined => {
  if (!object)
    return undefined
  const type = object.get('type') as UnitType
  let base_values = object.has('base_values') ? fromJS(object.get('base_values').map((value: OrderedMap<string, number>) => fromJS(value))) : undefined
  let modifier_values = object.has('modifier_values') ? fromJS(object.get('modifier_values')!.map((value: OrderedMap<string, number>) => fromJS(value))) : undefined
  let loss_values = object.has('loss_values') ? fromJS(object.get('loss_values')!.map((value: OrderedMap<string, number>) => fromJS(value))) : undefined
  return { type, base_values, modifier_values, loss_values }
}

export const unitDefinitionFromJS = (object: Map<string, any>): UnitDefinition | undefined => {
  if (!object)
    return undefined
  const type = object.get('type') as UnitType
  let image = object.get('image')
  if (!image)
    image = unit_to_icon.get(type)
  let base_values = object.has('base_values') ? fromJS(object.get('base_values').map((value: OrderedMap<string, number>) => fromJS(value))) : undefined
  let modifier_values = object.has('modifier_values') ? fromJS(object.get('modifier_values')!.map((value: OrderedMap<string, number>) => fromJS(value))) : undefined
  let loss_values = object.has('loss_values') ? fromJS(object.get('loss_values')!.map((value: OrderedMap<string, number>) => fromJS(value))) : undefined
  return { type, image, requirements: object.get('requirements'), can_assault: object.get('can_assault'), base_values, modifier_values, loss_values }
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


// TODO: Allow editing unit properties.
