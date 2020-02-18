
import { sumBy, clamp } from 'lodash'
import { Terrain, TerrainCalc, Setting, UnitAttribute, Settings, BaseUnit, CombatPhase, General, GeneralCalc } from 'types'
import { calculateValue } from 'definition_values'
import { CombatUnit } from './combat'

/**
 * Calculates the roll modifier based on skill level difference of generals.
 * Every two levels increase dice roll by one (rounded down).
 */
export const calculateGeneralPips = (general: General, enemy: General, phase: CombatPhase): number => {
  const martial_pip = Math.max(0, Math.floor((calculateValue(general, GeneralCalc.Martial) - calculateValue(enemy, GeneralCalc.Martial)) / 2.0))
  const phase_pip = Math.max(0, Math.floor((calculateValue(general, phase) - calculateValue(enemy, phase))))
  return martial_pip + phase_pip
}

/**
 * Calculates the roll modifier from terrains.
 */
export const calculateTerrainPips = (terrains: Terrain[]): number => sumBy(terrains, terrain => calculateValue(terrain, TerrainCalc.Roll))

/**
 * Calculates the roll modifier from unit pips.
 */
export const calculateUnitPips = (source: CombatUnit, target: CombatUnit, type: UnitAttribute.Strength | UnitAttribute.Morale, phase?: CombatPhase): number => {
  return getOffensiveUnitPips(source, type, phase) + getDefensiveUnitPips(target, type, phase)
}

export const getOffensiveUnitPips = (unit: CombatUnit, type: UnitAttribute.Strength | UnitAttribute.Morale, phase?: CombatPhase): number => {
  if (type === UnitAttribute.Morale)
    return unit[UnitAttribute.OffensiveMoralePips] 
  if (phase === CombatPhase.Shock)
    return unit[UnitAttribute.OffensiveShockPips]
  if (phase === CombatPhase.Fire)
    return unit[UnitAttribute.OffensiveFirePips]
  return 0
}

export const getDefensiveUnitPips = (unit: CombatUnit, type: UnitAttribute.Strength | UnitAttribute.Morale, phase?: CombatPhase): number => {
  if (type === UnitAttribute.Morale)
    return -unit[UnitAttribute.DefensiveMoralePips] 
  if (phase === CombatPhase.Shock)
    return -unit[UnitAttribute.DefensiveShockPips]
  if (phase === CombatPhase.Fire)
    return -unit[UnitAttribute.DefensiveFirePips]
  return 0
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
