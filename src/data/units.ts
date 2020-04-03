import { ValuesType, UnitType, UnitDefinition, UnitAttribute, UnitValueType, UnitRole, TerrainType, UnitDefinitions, Mode, CultureType, CombatPhase } from 'types'
import { addValues } from 'definition_values'
import { toObj, removeUndefined, filter, toArr } from 'utils'

import * as ir_data from './json/ir/units.json'
import * as ir_basedata from './json/ir/base_units.json'
import * as euiv_basedata from './json/euiv/base_units.json'
import * as euiv_data from './json/euiv/units.json'
import IconArcher from 'images/archers.png'
import IconCamelCavalry from 'images/camel_cavalry.png'
import IconChariots from 'images/chariots.png'
import IconHeavyCavalry from 'images/heavy_cavalry.png'
import IconHeavyInfantry from 'images/heavy_infantry.png'
import IconHorseArchers from 'images/horse_archers.png'
import IconLightCavalry from 'images/light_cavalry.png'
import IconLightInfantry from 'images/light_infantry.png'
import IconWarElephants from 'images/war_elephants.png'
import IconSupplyTrain from 'images/supply_train.png'
import IconMilitaryPower from 'images/military_power.png'
import IconLiburnian from 'images/liburnian.png'
import IconTrireme from 'images/trireme.png'
import IconTetrere from 'images/tetrere.png'
import IconHexere from 'images/hexere.png'
import IconOctere from 'images/octere.png'
import IconMegaPolyreme from 'images/mega_polyreme.png'
import IconArtillery from 'images/artillery.png'
import IconCavalry from 'images/cavalry.png'
import IconInfantry from 'images/infantry.png'
import IconEmpty from 'images/empty.png'
import { uniq } from 'lodash'

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
  [UnitType.MegaPolyreme]: IconMegaPolyreme,
  [UnitType.Land]: IconMilitaryPower,
  [UnitType.Naval]: IconMilitaryPower,
  [UnitType.Cavalry]: IconCavalry,
  [UnitType.Infantry]: IconInfantry,
  [UnitType.Artillery]: IconArtillery,
  [UnitType.LightShip]: IconMilitaryPower,
  [UnitType.MediumShip]: IconMilitaryPower,
  [UnitType.HeavyShip]: IconMilitaryPower,
  [UnitType.Latest]: IconMilitaryPower,
  [UnitType.None]: IconEmpty
}

export const getUnitIcon = (type: UnitType) => unit_to_icon[type] || ''

export const GlobalKey = 'Base'

const createUnitFromJson = (data: UnitData): UnitDefinition => {
  let unit: UnitDefinition = {
    type: data.type as UnitType,
    mode: data.mode as Mode | undefined,
    image: unit_to_icon[data.type as UnitType] ?? unit_to_icon[data.base as UnitType] ?? '',
    role: data.role ? data.role as UnitRole : undefined,
    parent: data.base ? data.base as UnitType : undefined,
    culture: data.culture ? data.culture as CultureType : undefined,
    tech: data.tech
  }
  removeUndefined(unit)
  const base_values: [UnitValueType, number][] = [
    [UnitAttribute.AttritionWeight, data.attrition_weight ?? 0],
    [UnitAttribute.Cost, data.cost ?? 0],
    [UnitAttribute.Maintenance, data.maintenance ?? 0],
    [UnitAttribute.Strength, data.strength ?? 0],
    [UnitAttribute.Morale, data.morale ?? 0],
    [UnitAttribute.Maneuver, data.maneuver ?? 0],
    [UnitAttribute.MoraleDamageTaken, data.morale_damage_taken ?? 0],
    [UnitAttribute.StrengthDamageTaken, data.strength_damage_taken ?? 0],
    [UnitAttribute.MoraleDamageDone, data.morale_damage_done ?? 0],
    [UnitAttribute.StrengthDamageDone, data.strength_damage_done ?? 0],
    [UnitAttribute.DamageDone, data.damage_done ?? 0],
    [UnitAttribute.DamageTaken, data.damage_taken ?? 0],
    [UnitAttribute.FoodConsumption, data.food_consumption ?? 0],
    [UnitAttribute.FoodStorage, data.food_storage ?? 0],
    [UnitAttribute.CaptureChance, data.capture_chance ?? 0],
    [UnitAttribute.CaptureResist, data.capture_resist ?? 0],
    [UnitAttribute.OffensiveFirePips, data.offensive_fire ?? 0],
    [UnitAttribute.DefensiveFirePips, data.defensive_fire ?? 0],
    [UnitAttribute.OffensiveMoralePips, data.offensive_morale ?? 0],
    [UnitAttribute.DefensiveMoralePips, data.defensive_morale ?? 0],
    [UnitAttribute.OffensiveShockPips, data.offensive_shock ?? 0],
    [UnitAttribute.DefensiveShockPips, data.defensive_shock ?? 0],
    [UnitAttribute.MilitaryTactics, data.military_tactics ?? 0],
    [UnitAttribute.DefensiveSupport, data.back_row ?? 0],
    [UnitAttribute.OffensiveSupport, data.back_row ?? 0],
    [CombatPhase.Fire, data.fire ?? 0],
    [CombatPhase.Shock, data.shock ?? 0],
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

const initializeDefaultUnits = (): UnitDefinitions => {
  if (process.env.REACT_APP_GAME === 'euiv')
    return toObj(euiv_basedata.units.map(createUnitFromJson).concat(euiv_data.units.map(createUnitFromJson)), unit => unit.type)
  else
    return toObj(ir_basedata.units.map(createUnitFromJson).concat(ir_data.units.map(createUnitFromJson)), unit => unit.type)
}
const defaultUnits = initializeDefaultUnits()

export const getCultures = () => uniq(toArr(defaultUnits, value => value.culture).filter(culture => culture) as CultureType[]).sort()

export const getDefaultUnits = (culture?: CultureType): UnitDefinitions => culture ? filter(defaultUnits, unit => !unit.culture || unit.culture === culture) : defaultUnits
export const getDefaultUnit = (type: UnitType): UnitDefinition => defaultUnits[type]

interface UnitData {
  base: string | null
  type: string
  mode?: string
  culture?: string
  morale?: number
  strength?: number
  cost?: number
  role?: string
  tech?: number
  maintenance?: number
  maneuver?: number
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
  offensive_morale?: number
  defensive_morale?: number
  offensive_fire?: number
  defensive_fire?: number
  offensive_shock?: number
  defensive_shock?: number
  shock?: number
  fire?: number
  military_tactics?: number
  back_row?: number
}
