import { Map, OrderedMap } from 'immutable'
import { UnitType, UnitDefinition, UnitCalc } from './types'
import { TerrainType } from '../terrains'
import IconArcher from '../../images/archers.png'
import IconCamelCavalry from '../../images/camel_cavalry.png'
import IconChariots from '../../images/chariots.png'
import IconHeavyCavalry from '../../images/heavy_cavalry.png'
import IconHeavyInfantry from '../../images/heavy_infantry.png'
import IconHorseArchers from '../../images/horse_archers.png'
import IconLightCavalry from '../../images/light_cavalry.png'
import IconLightInfantry from '../../images/light_infantry.png'
import IconWarElephants from '../../images/war_elephants.png'
import * as data from './units.json';

export const unit_to_icon = Map<UnitType, string>()
  .set(UnitType.Archers, IconArcher)
  .set(UnitType.CamelCavalry, IconCamelCavalry)
  .set(UnitType.Chariots, IconChariots)
  .set(UnitType.HeavyCavalry, IconHeavyCavalry)
  .set(UnitType.HeavyInfantry, IconHeavyInfantry)
  .set(UnitType.HorseArchers, IconHorseArchers)
  .set(UnitType.LightCavalry, IconLightCavalry)
  .set(UnitType.LightInfantry, IconLightInfantry)
  .set(UnitType.WarElephants, IconWarElephants)

const setBaseValues = (unit: UnitDefinition): UnitDefinition => {
  const values: [UnitCalc, number][] = [
    [UnitCalc.AttritionWeight, 1],
    [UnitCalc.Offense, 1],
    [UnitCalc.Defense, 1],
    [UnitCalc.Discipline, 1],
    [UnitCalc.Manpower, 1000],
    [UnitCalc.Morale, 3],
    [UnitCalc.MoraleDamageTaken, 1],
    [UnitCalc.StrengthDamageTaken, 1],
    [UnitCalc.Experience, 0]
  ]
  const units = Object.keys(UnitType).map(k => UnitType[k as any]) as UnitType[]
  const unit_values: [UnitType, number][] = units.map(value => [value, 1])
  const terrains = Object.keys(TerrainType).map(k => TerrainType[k as any]) as TerrainType[]
  const terrain_values: [TerrainType, number][] = terrains.map(value => [value, 1])

  unit = unit.add_base_values('Base', values)
  unit = unit.add_base_values('Base', unit_values)
  unit = unit.add_base_values('Base', terrain_values)
  return unit
}

export const getDefaultDefinitions = (): Map<UnitType, UnitDefinition> => {
  let map = OrderedMap<UnitType, UnitDefinition>()
  for (const value of data.units) {
    const unit = createUnitFromJson(value)
    map = map.set(unit.type, unit)
  }
  return map
}

const createUnitFromJson = (data: UnitData): UnitDefinition => {
  let unit = new UnitDefinition(data.type as UnitType, unit_to_icon.get(data.type as UnitType)!, data.requirements, data.can_assault)
  unit = setBaseValues(unit)
  const base_values: [UnitCalc, number][] = [
    [UnitCalc.Cost, data.cost],
    [UnitCalc.RecruitTime, data.recruit_time],
    [UnitCalc.Upkeep, data.upkeep],
    [UnitCalc.MovementSpeed, data.movement_speed],
    [UnitCalc.Maneuver, data.maneuver]
  ]
  const modifier_values: [UnitCalc | UnitType, number][] = [
    [UnitCalc.AttritionWeight, data.attrition_weight || 0],
    [UnitCalc.MoraleDamageTaken, data.morale_damage_taken || 0],
    [UnitCalc.StrengthDamageTaken, data.strength_damage_taken || 0],
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
  unit = unit.add_base_values(unit.type, base_values)
  unit = unit.add_modifier_values(unit.type, modifier_values)
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
