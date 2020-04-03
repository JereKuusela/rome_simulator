
import { sumBy } from 'lodash'
import { TerrainDefinition, TerrainCalc, Setting, UnitAttribute, UnitDefinition, CombatPhase, GeneralAttribute, Side, LocationType, General, CombatCohortDefinition, SiteSettings } from 'types'
import { calculateValue } from 'definition_values'

/**
 * Calculates the roll modifier based on skill level difference of generals.
 * Every two levels increase dice roll by one (rounded down).
 */
export const calculateGeneralPips = (general: General, enemy: General, phase: CombatPhase): number => {
  const martial_pip = Math.floor((general.total_values[GeneralAttribute.Martial] - enemy.total_values[GeneralAttribute.Martial]) / 2.0)
  const phase_pip = general.total_values[phase] - enemy.total_values[phase]
  return Math.max(0, martial_pip + phase_pip)
}

export const getTerrainPips = (terrains: TerrainDefinition[], side: Side, general: General, enemy: General) => {
  const enable_tiles = side === Side.Attacker
  const enable_borders = side === Side.Attacker || general.total_values[GeneralAttribute.Maneuver] <= enemy.total_values[GeneralAttribute.Maneuver]
  terrains = terrains.filter(terrain => terrain.location === LocationType.Border ? enable_borders : enable_tiles)
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

export const calculateExperienceReduction = (settings: SiteSettings, target: UnitDefinition) => {
  let damage_reduction_per_experience = settings[Setting.ExperienceDamageReduction]
  // Bug in game which makes morale damage taken and strength damage taken affect damage reduction from experience.
  if (!settings[Setting.FixExperience])
    damage_reduction_per_experience *= (2.0 + calculateValue(target, UnitAttribute.MoraleDamageTaken) + calculateValue(target, UnitAttribute.StrengthDamageTaken)) * 0.5
  return -damage_reduction_per_experience * calculateValue(target, UnitAttribute.Experience)
}

export const getCombatPhase = (round: number, settings: SiteSettings) => {
  if (settings[Setting.FireAndShock]) {
    const phase = getCombatPhaseNumber(round, settings)
    if (phase)
      return phase % 2 ? CombatPhase.Fire : CombatPhase.Shock
  }
  return CombatPhase.Default
}

export const getCombatPhaseNumber = (round: number, settings: SiteSettings) => Math.ceil(round  / settings[Setting.RollFrequency])

export const getDailyIncrease = (round: number, settings: SiteSettings) => settings[Setting.DailyDamageIncrease] * round
