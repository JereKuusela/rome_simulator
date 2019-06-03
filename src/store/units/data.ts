import { Map, OrderedMap } from 'immutable'
import { UnitType, UnitDefinition, UnitCalc, ValueType } from './types'
import { add_base_values } from '../../base_definition'
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
  .set('' as UnitType, IconMilitaryPower)

const setBaseValues = (unit: UnitDefinition): UnitDefinition => {
  const values: [UnitCalc, number][] = [
    [UnitCalc.Offense, 1],
    [UnitCalc.Defense, 1],
    [UnitCalc.Discipline, 1],
    [UnitCalc.Manpower, 1000],
    [UnitCalc.Morale, 3],
    [UnitCalc.Experience, 0]
  ]
  unit = add_base_values(unit, 'Base', values)
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

export const getDefaultGlobalDefinition = (): UnitDefinition => {
  return { type: '' as UnitType, requirements: '', can_assault: false }
}

const createUnitFromJson = (data: UnitData): UnitDefinition => {
  let unit: UnitDefinition = { type: data.type as UnitType, requirements: data.requirements, can_assault: data.can_assault }
  unit = setBaseValues(unit)
  const base_values: [ValueType, number][] = [
    [UnitCalc.AttritionWeight, data.attrition_weight || 0],
    [UnitCalc.Cost, data.cost],
    [UnitCalc.RecruitTime, data.recruit_time],
    [UnitCalc.Upkeep, data.upkeep],
    [UnitCalc.MovementSpeed, data.movement_speed],
    [UnitCalc.Maneuver, data.maneuver],
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
  unit = add_base_values(unit, unit.type, base_values)
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
