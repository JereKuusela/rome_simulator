import { DataValues, calculateValue } from 'data_values'
import { TerrainType, Mode, CultureType, TerrainData } from 'types'
import { toNumber, toPercent, toSignedPercent, toMultiplier } from 'formatters'
import { CombatPhase } from './battle'
import { flatten } from 'lodash'
import { DataWithMode } from './definition'

export enum UnitType {
  Archers = 'Archers',
  CamelCavalry = 'Camel Cavalry',
  Chariots = 'Chariots',
  HeavyCavalry = 'Heavy Cavalry',
  HeavyInfantry = 'Heavy Infantry',
  HorseArchers = 'Horse Archers',
  LightCavalry = 'Light Cavalry',
  LightInfantry = 'Light Infantry',
  WarElephants = 'War Elephants',
  SupplyTrain = 'Supply Train',
  Liburnian = 'Liburnian',
  Trireme = 'Trireme',
  Tetrere = 'Tetrere',
  Hexere = 'Hexere',
  Octere = 'Octere',
  MegaPolyreme = 'Mega-Polyreme',
  Land = 'Land Unit',
  Naval = 'Naval Unit',
  Infantry = 'Infantry',
  Cavalry = 'Cavalry',
  Artillery = 'Artillery',
  LightShip = 'Light Ship',
  MediumShip = 'Medium Ship',
  HeavyShip = 'Heavy Ship',
  Latest = 'Latest',
  None = 'None'
}

export enum UnitRole {
  Front = 'Front',
  Flank = 'Flank',
  Support = 'Support'
}

export enum UnitAttribute {
  StrengthDepleted = 'Strength Depleted',
  MoraleDepleted = 'Morale Depleted',
  Morale = 'Morale',
  Strength = 'Strength',
  Discipline = 'Discipline',
  Offense = 'Offense',
  Defense = 'Defense',
  Damage = 'Damage',
  Toughness = 'Toughness',
  Pursuit = 'Pursuit',
  Screen = 'Screen',
  Maneuver = 'Maneuver',
  MoraleDamageDone = 'Morale Damage Done',
  MoraleDamageTaken = 'Morale Damage Taken',
  StrengthDamageDone = 'Strength Damage Done',
  StrengthDamageTaken = 'Strength Damage Taken',
  FireDamageDone = 'Fire Damage Done',
  FireDamageTaken = 'Fire Damage Taken',
  ShockDamageDone = 'Shock Damage Done',
  ShockDamageTaken = 'Shock Damage Taken',
  OffensiveFirePips = 'Offensive Fire Pips',
  OffensiveShockPips = 'Offensive Shock Pips',
  OffensiveMoralePips = 'Offensive Morale Pips',
  DefensiveFirePips = 'Defensive Fire Pips',
  DefensiveShockPips = 'Defensive Shock Pips',
  DefensiveMoralePips = 'Defensive Morale Pips',
  OffensiveSupport = 'Damage from Backrow',
  DefensiveSupport = 'Defensive Pips to Frontrow',
  MilitaryTactics = 'Military Tactics',
  CombatAbility = 'Combat Ability',
  DamageDone = 'Damage Done',
  DamageTaken = 'Damage Taken',
  Cost = 'Cost',
  Maintenance = 'Maintenance',
  AttritionWeight = 'Attrition Weight',
  Experience = 'Experience',
  Drill = 'Drill',
  FoodConsumption = 'Food Consumption',
  FoodStorage = 'Food Storage',
  CaptureChance = 'Capture Chance',
  CaptureResist = 'Capture Resist',
  DailyLossResist = 'Daily Loss Resist',
  CrossingSupport = 'Crossing Support'
}

export type UnitValueType = UnitAttribute | UnitType | TerrainType | CombatPhase
export type UnitValues = { [key in UnitType]: UnitValue }
export type UnitValue = DataValues<UnitValueType>

export const formTerrainAttribute = (terrain: TerrainData | TerrainType, attribute: UnitAttribute) => {
  if (typeof terrain === 'object') return `${terrain.type} ${attribute}` as UnitValueType
  return `${terrain} ${attribute}` as UnitValueType
}

export const getTerrainAttributes = (terrains: (TerrainData | TerrainType)[]) => {
  return flatten(
    terrains.map(terrain => [
      formTerrainAttribute(terrain, UnitAttribute.Damage),
      formTerrainAttribute(terrain, UnitAttribute.Toughness),
      formTerrainAttribute(terrain, UnitAttribute.Pursuit),
      formTerrainAttribute(terrain, UnitAttribute.Screen)
    ])
  )
}

/** A single (sub) unit definition. Used to store data but shouldn't be used for anything else. */
export interface UnitData extends DataWithMode<UnitType>, DataValues<UnitValueType> {
  role?: UnitRole
  isLoyal?: boolean
  parent?: UnitType
  culture?: CultureType
  tech?: number
}

/** A full unit definition (merged with definitions of country, general and parent unit types). */
export interface UnitDefinition extends UnitData {
  mode: Mode
}

export const unitValueToString = (definition: DataValues<UnitValueType>, type: UnitValueType): string => {
  const value = calculateValue(definition, type)
  switch (type) {
    case UnitAttribute.Maneuver:
      return toNumber(Math.floor(value))
    case UnitAttribute.Cost:
    case UnitAttribute.Strength:
    case UnitAttribute.StrengthDepleted:
    case UnitAttribute.Morale:
    case UnitAttribute.MoraleDepleted:
    case UnitAttribute.FoodConsumption:
    case UnitAttribute.FoodStorage:
      return toNumber(value)
    case CombatPhase.Fire:
    case CombatPhase.Shock:
      return toMultiplier(value)
    case UnitAttribute.Experience:
    case UnitAttribute.Maintenance:
    case UnitAttribute.AttritionWeight:
      return toPercent(value)
    default:
      return toSignedPercent(value)
  }
}

export type UnitsData = { [key in UnitType]: UnitData }
export type UnitDefinitions = { [key in UnitType]: UnitDefinition }

export const dictionaryUnitType: { [key: string]: UnitType } = {
  archers: UnitType.Archers,
  camels: UnitType.CamelCavalry,
  chariots: UnitType.Chariots,
  heavy_cavalry: UnitType.HeavyCavalry,
  heavy_infantry: UnitType.HeavyInfantry,
  horse_archers: UnitType.HorseArchers,
  light_cavalry: UnitType.LightCavalry,
  light_infantry: UnitType.LightInfantry,
  warelephant: UnitType.WarElephants,
  supply_train: UnitType.SupplyTrain,
  liburnian: UnitType.Liburnian,
  trireme: UnitType.Trireme,
  tetrere: UnitType.Tetrere,
  hexere: UnitType.Hexere,
  octere: UnitType.Octere,
  mega_galley: UnitType.MegaPolyreme
}
