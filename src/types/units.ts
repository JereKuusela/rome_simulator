import { TerrainType } from "./terrains"
import { DefinitionValues, calculateValue } from "definition_values"
import { Definition, DefinitionType } from "base_definition"
import { toNumber, toPercent, toSignedPercent } from "formatters"

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
  MegaPolyreme = 'Mega-Polyreme'
}

export enum UnitDeployment {
  Front = 'Front',
  Flank = 'Flank',
  Support = 'Support'
}

export enum UnitCalc {
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
  DamageDone = 'Damage done',
  DamageTaken = 'Damage taken',
  MovementSpeed = 'Movement speed',
  RecruitTime = 'Recruit time',
  Cost = 'Cost',
  Maintenance = 'Maintenance',
  AttritionWeight = 'Attrition weight',
  Experience = 'Experience',
  FoodConsumption = 'Food Consumption',
  FoodStorage = 'Food Storage',
  CaptureChance = 'Capture Chance',
  CaptureResist = 'Capture Resist'
}

export enum GeneralCalc {
  Martial = 'Martial'
}

export type UnitValueType = UnitCalc | UnitType | TerrainType
export type UnitDefinitionValues = { [key in UnitType]: UnitDefinitionValue }
export type UnitDefinitionValue = DefinitionValues<UnitValueType>


export interface BaseUnit extends DefinitionValues<UnitValueType> {
  type: UnitType
  id: number
  is_loyal?: boolean
}

export interface UnitDefinition extends Definition<UnitType>, DefinitionValues<UnitValueType> {
  deployment: UnitDeployment
  mode: DefinitionType
  is_loyal?: boolean
}

export interface Unit extends BaseUnit, UnitDefinition { }


export const unitValueToString = (definition: DefinitionValues<UnitValueType>, type: UnitValueType): string => {
  const value = calculateValue(definition, type)
  switch (type) {
    case UnitCalc.Cost:
    case UnitCalc.Maneuver:
    case UnitCalc.Strength:
    case UnitCalc.StrengthDepleted:
    case UnitCalc.Morale:
    case UnitCalc.MoraleDepleted:
    case UnitCalc.MovementSpeed:
    case UnitCalc.RecruitTime:
      return toNumber(value)
    case UnitCalc.Experience:
    case UnitCalc.Maintenance:
    case UnitCalc.AttritionWeight:
      return toPercent(value)
    default:
      return toSignedPercent(value)
  }
}
