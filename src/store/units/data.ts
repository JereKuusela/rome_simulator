import { OrderedMap, Map, OrderedSet, fromJS } from 'immutable'
import { UnitType, UnitDefinition, UnitCalc, ValueType, Unit } from './actions'
import { addValues, ValuesType } from '../../base_definition'
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

import * as data from './units.json';

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

export const getDefaultTypes = (): OrderedSet<UnitType> => {
  const units = Object.keys(UnitType).map(k => UnitType[k as any]) as UnitType[]
  return OrderedSet<UnitType>(units)
}

export const getDefaultDefinitions = (): OrderedMap<UnitType, UnitDefinition> => {
  let map = OrderedMap<UnitType, UnitDefinition>()
  for (const value of data.units) {
    const unit = createUnitFromJson(value)
    map = map.set(unit.type, unit)
  }
  return map
}

export const unitFromJS = (object?: Map<string, any>): Unit | undefined => {
  if (!object)
    return undefined
  const type = object.get('type') as UnitType
  const is_defeated = object.has('is_defeated') ? object.get('is_defeated') : undefined
  const target = object.has('target') ? object.get('target') : undefined
  const base_values = object.has('base_values') ? fromJS(object.get('base_values').map((value: OrderedMap<string, number>) => fromJS(value))) : undefined
  const modifier_values = object.has('modifier_values') ? fromJS(object.get('modifier_values')!.map((value: OrderedMap<string, number>) => fromJS(value))) : undefined
  const loss_values = object.has('loss_values') ? fromJS(object.get('loss_values')!.map((value: OrderedMap<string, number>) => fromJS(value))) : undefined
  return { type, is_defeated, target, base_values, modifier_values, loss_values }
}

export const unitDefinitionFromJS = (object?: Map<string, any>): UnitDefinition | undefined => {
  if (!object)
    return undefined
  const type = object.get('type') as UnitType
  let image = object.get('image')
  if (!image)
    image = unit_to_icon.get(type) || ''
  const base_values = object.has('base_values') ? fromJS(object.get('base_values').map((value: OrderedMap<string, number>) => fromJS(value))) : undefined
  const modifier_values = object.has('modifier_values') ? fromJS(object.get('modifier_values')!.map((value: OrderedMap<string, number>) => fromJS(value))) : undefined
  const loss_values = object.has('loss_values') ? fromJS(object.get('loss_values')!.map((value: OrderedMap<string, number>) => fromJS(value))) : undefined
  return { type, image, requirements: object.get('requirements'), can_assault: object.get('can_assault'), base_values, modifier_values, loss_values }
}

export const getDefaultGlobalDefinition = (): UnitDefinition => {
  const unit = { type: '' as UnitType, image: IconMilitaryPower, requirements: '', can_assault: false }
  const values: [UnitCalc, number][] = [
    [UnitCalc.Manpower, 1000],
    [UnitCalc.Morale, 3]
  ]
  return addValues(unit, ValuesType.Base, 'Base', values)
}

const createUnitFromJson = (data: UnitData): UnitDefinition => {
  let unit = { type: data.type as UnitType, image: unit_to_icon.get(data.type as UnitType) || '', requirements: data.requirements, can_assault: data.can_assault }
  const base_values: [ValueType, number][] = [
    [UnitCalc.AttritionWeight, data.attrition_weight || 0],
    [UnitCalc.Cost, data.cost],
    [UnitCalc.RecruitTime, data.recruit_time],
    [UnitCalc.Upkeep, data.upkeep],
    [UnitCalc.MovementSpeed, data.movement_speed],
    [UnitCalc.Maneuver, data.maneuver],
    [UnitCalc.MoraleDamageTaken, data.morale_damage_taken || 0],
    [UnitCalc.StrengthDamageTaken, data.strength_damage_taken || 0],
    [UnitCalc.MoraleDamageDone, data.morale_damage_done || 0],
    [UnitCalc.StrengthDamageDone, data.strength_damage_done || 0],
    [UnitType.Archers, data.archers || 0],
    [UnitType.CamelCavalry, data.camel_cavalry || 0],
    [UnitType.Chariots, data.chariots || 0],
    [UnitType.HeavyCavalry, data.heavy_cavalry || 0],
    [UnitType.HeavyInfantry, data.heavy_infantry || 0],
    [UnitType.HorseArchers, data.horse_archers || 0],
    [UnitType.LightCavalry, data.light_cavalry || 0],
    [UnitType.LightInfantry, data.light_infantry || 0],
    [UnitType.WarElephants, data.war_elephants || 0]
  ]
  unit = addValues(unit, ValuesType.Base, unit.type, base_values)
  return unit
}

interface UnitData {
  type: string
  cost: number
  recruit_time: number
  upkeep: number
  requirements: string
  can_assault: boolean
  movement_speed: number
  maneuver: number
  morale_damage_taken?: number
  strength_damage_taken?: number
  morale_damage_done?: number
  strength_damage_done?: number
  attrition_weight?: number
  archers?: number
  camel_cavalry?: number
  chariots?: number
  heavy_cavalry?: number
  heavy_infantry?: number
  horse_archers?: number
  light_cavalry?: number
  light_infantry?: number
  war_elephants?: number
}
