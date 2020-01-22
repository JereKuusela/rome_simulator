import { GlobalDefinitions, UnitDefinitions } from 'reducers/units'
import { ValuesType, DefinitionType, Mode } from 'base_definition'
import { UnitType, UnitDefinition, UnitCalc, UnitValueType, UnitDeployment, TerrainType } from 'types'
import { addValues } from 'definition_values'
import { toObj } from 'utils'

import * as data from './json/units.json'
import IconArcher from '../images/archers.png'
import IconCamelCavalry from '../images/camel_cavalry.png'
import IconChariots from '../images/chariots.png'
import IconHeavyCavalry from '../images/heavy_cavalry.png'
import IconHeavyInfantry from '../images/heavy_infantry.png'
import IconHorseArchers from '../images/horse_archers.png'
import IconLightCavalry from '../images/light_cavalry.png'
import IconLightInfantry from '../images/light_infantry.png'
import IconWarElephants from '../images/war_elephants.png'
import IconSupplyTrain from '../images/supply_train.png'
import IconMilitaryPower from '../images/military_power.png'
import IconLiburnian from '../images/liburnian.png'
import IconTrireme from '../images/trireme.png'
import IconTetrere from '../images/tetrere.png'
import IconHexere from '../images/hexere.png'
import IconOctere from '../images/octere.png'
import IconMegaPolyreme from '../images/mega_polyreme.png'

const unit_to_icon: { [key in UnitType]: string } = {
  [UnitType.Archers]: IconArcher,
  [UnitType.CamelCavalry]: IconCamelCavalry,
  [UnitType.Chariots]: IconChariots,
  [UnitType.HeavyCavalry]: IconHeavyCavalry,
  [UnitType.HeavyInfantry]: IconHeavyInfantry,
  [UnitType.HorseArchers]: IconHorseArchers,
  [UnitType.LightCavalry]: IconLightCavalry,
  [UnitType.LightInfantry]: IconLightInfantry,
  [UnitType.WarElephants]: IconWarElephants,
  [UnitType.SupplyTrain]: IconSupplyTrain,
  [UnitType.Liburnian]: IconLiburnian,
  [UnitType.Trireme]: IconTrireme,
  [UnitType.Tetrere]: IconTetrere,
  [UnitType.Hexere]: IconHexere,
  [UnitType.Octere]: IconOctere,
  [UnitType.MegaPolyreme]: IconMegaPolyreme
}

export const getUnitIcon = (type: UnitType) => unit_to_icon[type] || ''

export const GlobalKey = 'Base'

const createUnitFromJson = (data: UnitData): UnitDefinition => {
  let unit: UnitDefinition = { type: data.type as UnitType, mode: data.mode as DefinitionType, image: unit_to_icon[data.type as UnitType] ?? '', deployment: data.deployment as UnitDeployment }
  const base_values: [UnitValueType, number][] = [
    [UnitCalc.AttritionWeight, data.attrition_weight ?? 0],
    [UnitCalc.Cost, data.cost],
    [UnitCalc.RecruitTime, data.recruit_time],
    [UnitCalc.Maintenance, data.maintenance ?? 0],
    [UnitCalc.MovementSpeed, data.movement_speed],
    [UnitCalc.Maneuver, data.maneuver],
    [UnitCalc.MoraleDamageTaken, data.morale_damage_taken ?? 0],
    [UnitCalc.StrengthDamageTaken, data.strength_damage_taken ?? 0],
    [UnitCalc.MoraleDamageDone, data.morale_damage_done ?? 0],
    [UnitCalc.StrengthDamageDone, data.strength_damage_done ?? 0],
    [UnitCalc.DamageDone, data.damage_done ?? 0],
    [UnitCalc.DamageTaken, data.damage_taken ?? 0],
    [UnitCalc.FoodConsumption, data.food_consumption ?? 0],
    [UnitCalc.FoodStorage, data.food_storage ?? 0],
    [UnitCalc.CaptureChance, data.capture_chance ?? 0],
    [UnitCalc.CaptureResist, data.capture_resist ?? 0],
    [UnitType.Archers, data.archers ?? 0],
    [UnitType.CamelCavalry, data.camel_cavalry ?? 0],
    [UnitType.Chariots, data.chariots ?? 0],
    [UnitType.HeavyCavalry, data.heavy_cavalry ?? 0],
    [UnitType.HeavyInfantry, data.heavy_infantry ?? 0],
    [UnitType.HorseArchers, data.horse_archers ?? 0],
    [UnitType.LightCavalry, data.light_cavalry ?? 0],
    [UnitType.LightInfantry, data.light_infantry ?? 0],
    [UnitType.WarElephants, data.war_elephants ?? 0],
    [UnitType.SupplyTrain, data.supply_train ?? 0],
    [UnitType.Liburnian, data.liburnian ?? 0],
    [UnitType.Trireme, data.trireme ?? 0],
    [UnitType.Tetrere, data.tetrere ?? 0],
    [UnitType.Hexere, data.hexere ?? 0],
    [UnitType.Octere, data.octere ?? 0],
    [UnitType.MegaPolyreme, data.mega_polyreme ?? 0],
    [TerrainType.Riverine, data.riverine ?? 0]
  ]
  unit = addValues(unit, ValuesType.Base, unit.type, base_values)
  return unit
}

const initializeDefaultUnits = (): UnitDefinitions => toObj(data.units.map(createUnitFromJson), unit => unit.type)

const initializeDefaultGlobal = (): GlobalDefinitions => {
  const land: UnitDefinition = { type: '' as UnitType, mode: DefinitionType.Land, image: IconMilitaryPower, deployment: UnitDeployment.Front }
  const naval: UnitDefinition = { type: '' as UnitType, mode: DefinitionType.Naval, image: IconMilitaryPower, deployment: UnitDeployment.Front }
  const landValues: [UnitCalc, number][] = [
    [UnitCalc.Strength, 1],
    [UnitCalc.Morale, 3],
    [UnitCalc.AttritionWeight, 1],
    [UnitCalc.Maintenance, 0.04166]
  ]
  const navalValues: [UnitCalc, number][] = [
    [UnitCalc.Strength, 1],
    [UnitCalc.Morale, 3],
    [UnitCalc.AttritionWeight, 1],
    [UnitCalc.Maintenance, 0.02083],
    [UnitCalc.CaptureChance, 0.06]
  ]
  return {
    [DefinitionType.Land]: addValues(land, ValuesType.Base, GlobalKey, landValues),
    [DefinitionType.Naval]: addValues(naval, ValuesType.Base, GlobalKey, navalValues)
  }
}

const defaultUnits = initializeDefaultUnits()
const defaultGlobal = initializeDefaultGlobal()

export const getDefaultUnits = (): UnitDefinitions => defaultUnits
export const getDefaultUnit = (type: UnitType): UnitDefinition => defaultUnits[type]
export const getDefaultGlobals = (): GlobalDefinitions => defaultGlobal
export const getDefaultGlobal = (mode: Mode): UnitDefinition => defaultGlobal[mode]

interface UnitData {
  type: string
  mode: string
  cost: number
  recruit_time: number
  deployment: string
  maintenance?: number
  requirements: string
  can_assault?: boolean
  movement_speed: number
  maneuver: number
  morale_damage_taken?: number
  strength_damage_taken?: number
  food_consumption?: number
  food_storage?: number
  capture_chance?: number
  capture_resist?: number
  damage_taken?: number
  morale_damage_done?: number
  strength_damage_done?: number
  damage_done?: number
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
  supply_train?: number
  liburnian?: number
  trireme?: number
  tetrere?: number
  hexere?: number
  octere?: number
  mega_polyreme?: number
  riverine?: number
}
