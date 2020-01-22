
import { sumBy } from 'lodash'
import { TerrainDefinition, TerrainCalc, Setting, Unit, UnitCalc, Settings } from 'types'
import { calculateValue } from 'definition_values'

/**
 * Calculates the roll modifier based on skill level difference of generals.
 * Every two levels increase dice roll by one (rounded down).
 */
export const calculateRollModifierFromGenerals = (skill: number, enemy_skill: number): number => Math.max(0, Math.floor((skill - enemy_skill) / 2.0))

/**
 * Calculates the roll modifier from terrains.
 */
export const calculateRollModifierFromTerrains = (terrains: TerrainDefinition[]): number => sumBy(terrains, terrain => calculateValue(terrain, TerrainCalc.Roll))

/**
 * Modifies a dice roll with terrains and general skill levels.
 * @param roll Initial dice roll.
 * @param terrains List of terrains in the battlefield.
 * @param general Skill level of own general.
 * @param opposing_general Skill level of the enemy general.
 */
export const calculateTotalRoll = (roll: number, terrains: TerrainDefinition[], general: number, opposing_general: number): number => {
  const modifier_terrain = calculateRollModifierFromTerrains(terrains)
  const modifier_effect = calculateRollModifierFromGenerals(general, opposing_general)
  return roll + modifier_terrain + modifier_effect
}

/**
 * Calculates the base damage value from roll.
 * @param roll Dice roll with modifiers.
 * @param settings Combat parameters.
 */
export const calculateBaseDamage = (roll: number, settings: Settings): number => {
  const base_damage = settings[Setting.BaseDamage]
  const roll_damage = settings[Setting.RollDamage]
  const max_damage = settings[Setting.MaxBaseDamage]
  return Math.min(max_damage, base_damage + roll_damage * roll)
}

export const calculateExperienceReduction = (settings: Settings, target: Unit) => {
  let damage_reduction_per_experience = settings[Setting.ExperienceDamageReduction]
  // Bug in game which makes morale damage taken and strength damage taken affect damage reduction from experience.
  if (!settings[Setting.FixExperience])
    damage_reduction_per_experience *= (2.0 + calculateValue(target, UnitCalc.MoraleDamageTaken) + calculateValue(target, UnitCalc.StrengthDamageTaken)) * 0.5
  return -damage_reduction_per_experience * calculateValue(target, UnitCalc.Experience)
}

