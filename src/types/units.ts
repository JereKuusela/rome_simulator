import { DefinitionValues, calculateValue } from 'definition_values'
import { TerrainType, Definition, Mode } from 'types'
import { toNumber, toPercent, toSignedPercent, toMultiplier } from 'formatters'
import { CombatPhase } from './battle'
import { CultureType } from './modifiers'

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
  MegaPolyreme = 'Mega Polyreme',
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
  StrengthDepleted = 'Strength depleted',
  MoraleDepleted = 'Morale depleted',
  Morale = 'Morale',
  Strength = 'Strength',
  Discipline = 'Discipline',
  Offense = 'Offense',
  Defense = 'Defense',
  Maneuver = 'Maneuver',
  MoraleDamageDone = 'Morale damage done',
  MoraleDamageTaken = 'Morale damage taken',
  StrengthDamageDone = 'Strength damage done',
  StrengthDamageTaken = 'Strength damage taken',
  FireDamageDone = 'Fire damage done',
  FireDamageTaken = 'Fire damage taken',
  ShockDamageDone = 'Shock damage done',
  ShockDamageTaken = 'Shock damage taken',
  OffensiveFirePips = 'Offensive fire pips',
  OffensiveShockPips = 'Offensive shock pips',
  OffensiveMoralePips = 'Offensive morale pips',
  DefensiveFirePips = 'Defensive fire pips',
  DefensiveShockPips = 'Defensive shock pips',
  DefensiveMoralePips = 'Defensive morale pips',
  OffensiveSupport = 'Damage from backrow',
  DefensiveSupport = 'Defensive pips to frontrow',
  MilitaryTactics = 'Military tactics',
  CombatAbility = 'Combat Ability',
  DamageDone = 'Damage done',
  DamageTaken = 'Damage taken',
  Cost = 'Cost',
  Maintenance = 'Maintenance',
  AttritionWeight = 'Attrition weight',
  Experience = 'Experience',
  Drill = 'Drill',
  FoodConsumption = 'Food consumption',
  FoodStorage = 'Food storage',
  CaptureChance = 'Capture chance',
  CaptureResist = 'Capture resist',
  DailyLossResist = 'Daily loss resist'
}

export type UnitValueType = UnitAttribute | UnitType | TerrainType | CombatPhase
export type UnitDefinitionValues = { [key in UnitType]: UnitDefinitionValue }
export type UnitDefinitionValue = DefinitionValues<UnitValueType>

/** An identity of a cohort. Used to store data but shouldn't be used for anything else. */
export interface CohortDefinition extends DefinitionValues<UnitValueType> {
  type: UnitType
  id: number
  is_loyal?: boolean
}

/** A single (sub) unit definition. Used to store data but shouldn't be used for anything else. */
export interface UnitDefinition extends Definition<UnitType>, DefinitionValues<UnitValueType> {
  role?: UnitRole
  is_loyal?: boolean
  parent?: UnitType
  culture?: CultureType
  tech?: number
}

/** A full unit definition (merged with definitions of country, general and parent unit types). */
export interface Unit extends UnitDefinition {
  mode: Mode
}

/** A full cohort (merged with unit definition). */
export interface Cohort extends CohortDefinition, Unit { }


export const unitValueToString = (definition: DefinitionValues<UnitValueType>, type: UnitValueType): string => {
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

export type UnitDefinitions = { [key in UnitType]: UnitDefinition }
export type Units = { [key in UnitType]: Unit }

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