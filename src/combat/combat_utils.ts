
import { sumBy, clamp } from 'lodash'
import { Terrain, TerrainCalc, Setting, UnitAttribute, Settings, BaseUnit, CombatPhase, GeneralAttribute, Side, LocationType, General } from 'types'
import { calculateValue } from 'definition_values'
import { CombatCohortDefinition } from './combat'

/**
 * Calculates the roll modifier based on skill level difference of generals.
 * Every two levels increase dice roll by one (rounded down).
 */
export const calculateGeneralPips = (general: General, enemy: General, phase: CombatPhase): number => {
  const martial_pip = Math.floor((general.total_values[GeneralAttribute.Martial] - enemy.total_values[GeneralAttribute.Martial]) / 2.0)
  const phase_pip = general.total_values[phase] - enemy.total_values[phase]
  return Math.max(0, martial_pip + phase_pip)
}

export const getTerrainPips = (terrains: Terrain[], side: Side, general: General, enemy: General) => {
  const ignore_tiles = side === Side.Defender
  const ignore_borders = side === Side.Defender || general.total_values[GeneralAttribute.Maneuver] <= enemy.total_values[GeneralAttribute.Maneuver]
  terrains = terrains.filter(terrain => terrain.location === LocationType.Border ? ignore_borders : ignore_tiles)
  return sumBy(terrains, terrain => calculateValue(terrain, TerrainCalc.Roll))
}

/**
 * Calculates the roll modifier from unit pips.
 */
export const calculateCohortPips = (source: CombatCohortDefinition, target: CombatCohortDefinition, target_support: CombatCohortDefinition | null, type: UnitAttribute.Strength | UnitAttribute.Morale, phase?: CombatPhase): number => {
  return getOffensiveCohortPips(source, type, phase) + getDefensiveCohortPips(target, type, phase) + getDefensiveSupportCohortPips(target_support, type, phase)
}

export const getOffensiveCohortPips = (cohort: CombatCohortDefinition, type: UnitAttribute.Strength | UnitAttribute.Morale, phase?: CombatPhase): number => {
  if (type === UnitAttribute.Morale)
    return cohort[UnitAttribute.OffensiveMoralePips]
  if (phase === CombatPhase.Shock)
    return cohort[UnitAttribute.OffensiveShockPips]
  if (phase === CombatPhase.Fire)
    return cohort[UnitAttribute.OffensiveFirePips]
  return 0
}

export const getDefensiveCohortPips = (cohort: CombatCohortDefinition, type: UnitAttribute.Strength | UnitAttribute.Morale, phase?: CombatPhase): number => {
  if (type === UnitAttribute.Morale)
    return -cohort[UnitAttribute.DefensiveMoralePips]
  if (phase === CombatPhase.Shock)
    return -cohort[UnitAttribute.DefensiveShockPips]
  if (phase === CombatPhase.Fire)
    return -cohort[UnitAttribute.DefensiveFirePips]
  return 0
}

export const getDefensiveSupportCohortPips = (cohort: CombatCohortDefinition | null, type: UnitAttribute.Strength | UnitAttribute.Morale, phase?: CombatPhase): number => {
  return cohort ?  Math.ceil(cohort[UnitAttribute.DefensiveSupport] * getDefensiveCohortPips(cohort, type, phase)) : 0
}

/**
 * Calculates the base damage value from roll.
 * @param roll Dice roll with modifiers.
 * @param settings Settings.
 */
export const calculateBaseDamage = (roll: number, settings: Settings): number => {
  const base_roll = settings[Setting.BaseRoll]
  const roll_damage = settings[Setting.RollDamage]
  const max_roll = settings[Setting.MaxRoll]
  return roll_damage * clamp(base_roll + roll, 0, max_roll)
}

export const calculateExperienceReduction = (settings: Settings, target: BaseUnit) => {
  let damage_reduction_per_experience = settings[Setting.ExperienceDamageReduction]
  // Bug in game which makes morale damage taken and strength damage taken affect damage reduction from experience.
  if (!settings[Setting.FixExperience])
    damage_reduction_per_experience *= (2.0 + calculateValue(target, UnitAttribute.MoraleDamageTaken) + calculateValue(target, UnitAttribute.StrengthDamageTaken)) * 0.5
  return -damage_reduction_per_experience * calculateValue(target, UnitAttribute.Experience)
}

export const getCombatPhase = (round: number, settings: Settings) => {
  if (settings[Setting.FireAndShock]) {
    const phase = Math.floor(round / settings[Setting.RollFrequency])
    return phase % 2 ? CombatPhase.Shock : CombatPhase.Fire
  }
  return CombatPhase.Default
}

export const getDailyIncrease = (round: number, settings: Settings) => settings[Setting.DailyDamageIncrease] * (round + 1)
