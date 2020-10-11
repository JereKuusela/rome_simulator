import { ValuesType, UnitType, UnitData, UnitAttribute, UnitValueType, UnitRole, TerrainType, UnitsData, Mode, CultureType, CombatPhase } from 'types'
import { addValues } from 'definition_values'
import { toObj, removeUndefined, filter, toArr, values } from 'utils'
import { uniq } from 'lodash'

import unitsIR from './json/ir/units.json'
import parentsIR from './json/ir/parent_units.json'
import parentsEU4 from './json/eu4/parent_units.json'
import unitsEU4 from './json/eu4/units.json'
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


const unitToIcon: { [key in UnitType]: string } = {
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

export const getUnitIcon = (type: UnitType) => unitToIcon[type] || ''


const createUnitFromJson = (data: UnitJSON): UnitData => {
  const handleAttributes = (attributes: any[]) => attributes.filter(type => (data as any)[type]).map(type => [type, (data as any)[type]] as [UnitValueType, number])

  let unit: UnitData = {
    type: data.Type as UnitType,
    mode: data.Mode as Mode | undefined,
    image: unitToIcon[data.Type as UnitType] ?? unitToIcon[data.Parent as UnitType] ?? '',
    role: data.Role ? data.Role as UnitRole : undefined,
    parent: data.Parent ? data.Parent as UnitType : undefined,
    culture: data.Culture ? data.Culture as CultureType : undefined,
    tech: data.Tech
  }
  removeUndefined(unit)
  const baseValues: [UnitValueType, number][] = [
    ...handleAttributes(values(UnitAttribute)),
    ...handleAttributes(values(TerrainType)),
    ...handleAttributes(values(UnitType)),
    ...handleAttributes(values(CombatPhase))
  ]
  unit = addValues(unit, ValuesType.Base, unit.type, baseValues)
  return unit
}

const initializeDefaultUnits = (): UnitsData => {
  if (process.env.REACT_APP_GAME === 'EU4')
    return toObj(parentsEU4.map(createUnitFromJson).concat(unitsEU4.map(createUnitFromJson)), unit => unit.type)
  else
    return toObj(parentsIR.map(createUnitFromJson).concat(unitsIR.map(createUnitFromJson)), unit => unit.type)
}
const defaultUnits = initializeDefaultUnits()

export const getCultures = () => uniq(toArr(defaultUnits, value => value.culture).filter(culture => culture) as CultureType[]).sort()

export const getDefaultUnits = (culture?: CultureType): UnitsData => culture ? filter(defaultUnits, unit => !unit.culture || unit.culture === culture) : defaultUnits
export const getDefaultUnit = (type: UnitType): UnitData => defaultUnits[type]

interface UnitJSON {
  Parent: string | null
  Type: string
  Mode?: string
  Culture?: string
  Role?: string
  Tech?: number
}
