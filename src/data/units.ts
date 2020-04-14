import { ValuesType, UnitType, UnitDefinition, UnitAttribute, UnitValueType, UnitRole, TerrainType, UnitDefinitions, Mode, CultureType, CombatPhase } from 'types'
import { addValues } from 'definition_values'
import { toObj, removeUndefined, filter, toArr, values } from 'utils'

import * as ir_units from './json/ir/units.json'
import * as ir_parents from './json/ir/parent_units.json'
import * as euiv_parents from './json/euiv/parent_units.json'
import * as euiv_units from './json/euiv/units.json'
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


const createUnitFromJson = (data: UnitData): UnitDefinition => {

  const handleAttributes = (attributes: any[]) => attributes.filter(type => (data as any)[type]).map(type => [type, (data as any)[type]] as [UnitValueType, number])

  let unit: UnitDefinition = {
    type: data.Type as UnitType,
    mode: data.Mode as Mode | undefined,
    image: unit_to_icon[data.Type as UnitType] ?? unit_to_icon[data.Parent as UnitType] ?? '',
    role: data.Role ? data.Role as UnitRole : undefined,
    parent: data.Parent ? data.Parent as UnitType : undefined,
    culture: data.Culture ? data.Culture as CultureType : undefined,
    tech: data.Tech
  }
  removeUndefined(unit)
  const base_values: [UnitValueType, number][] = [
    ...handleAttributes(values(UnitAttribute)),
    ...handleAttributes(values(TerrainType)),
    ...handleAttributes(values(UnitType)),
    ...handleAttributes(values(CombatPhase))
  ]
  unit = addValues(unit, ValuesType.Base, unit.type, base_values)
  return unit
}

const initializeDefaultUnits = (): UnitDefinitions => {
  if (process.env.REACT_APP_GAME === 'euiv')
    return toObj(euiv_parents.units.map(createUnitFromJson).concat(euiv_units.units.map(createUnitFromJson)), unit => unit.type)
  else
    return toObj(ir_parents.units.map(createUnitFromJson).concat(ir_units.units.map(createUnitFromJson)), unit => unit.type)
}
const defaultUnits = initializeDefaultUnits()

export const getCultures = () => uniq(toArr(defaultUnits, value => value.culture).filter(culture => culture) as CultureType[]).sort()

export const getDefaultUnits = (culture?: CultureType): UnitDefinitions => culture ? filter(defaultUnits, unit => !unit.culture || unit.culture === culture) : defaultUnits
export const getDefaultUnit = (type: UnitType): UnitDefinition => defaultUnits[type]

interface UnitData {
  Parent: string | null
  Type: string
  Mode?: string
  Culture?: string
  Role?: string
  Tech?: number
}
