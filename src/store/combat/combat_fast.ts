import { UnitCalc, UnitType } from '../units'
import { TerrainDefinition, TerrainType } from '../terrains'
import { TacticDefinition } from '../tactics'
import { RowTypes, Units } from '../battle'
import { CombatParameter, CombatSettings } from '../settings'
import { CountryName } from '../countries'

interface Loss {
  morale: number
  strength: number
}

export interface ParticipantState extends Units {
  readonly country: CountryName
  readonly tactic?: TacticDefinition
  readonly roll: number
  readonly general: number
  readonly row_types: RowTypes
  readonly flank_size: number
}
export type FrontLine = (CalculatedUnit | null)[]
export type StatusLine = (UnitStatus | null)[]

type UnitCalcs = { [key in (UnitCalc | UnitType | TerrainType)]: number }

const rollToDamage = [
  0.08, 0.08 + 0.02 * 1, 0.08 + 0.02 * 2, 0.08 + 0.02 * 3, 0.08 + 0.02 * 4, 0.08 + 0.02 * 5, 0.08 + 0.02 * 6
]

export interface CalculatedUnit extends UnitCalcs {
  type: UnitType
  is_loyal: boolean
  total: number
  target: number | null
}

export interface UnitStatus {
  [UnitCalc.Morale]: number
  [UnitCalc.Strength]: number
}

/**
 * Makes given armies attach each other.
 * @param attacker Attackers.
 * @param defender Defenders.
 * @param round Turn number to distinguish different rounds.
 * @param terrains Terrains of the battle, may affect amount of damage inflicted.
 */

export const doBattleFast = (status_a: StatusLine, status_d: StatusLine, attacker: FrontLine, defender: FrontLine, roll_a: number, roll_d: number, terrains: TerrainDefinition[], settings: CombatSettings) => {
  pickTargets(attacker, defender, settings)
  pickTargets(defender, attacker, settings)

  const base_a = rollToDamage[roll_a]
  const base_d = rollToDamage[roll_d]
  const losses_d = attack(status_a, attacker, defender, base_a, terrains, 0, 0, settings)
  const losses_a = attack(status_d, defender, attacker, base_d, terrains, 0, 0, settings)

  applyLosses(status_a, losses_a)
  applyLosses(status_d, losses_d)
  const minimum_morale = settings[CombatParameter.MinimumMorale]
  const minimum_strength = settings[CombatParameter.MinimumStrength]
  copyDefeated(status_a, minimum_morale, minimum_strength)
  copyDefeated(status_d, minimum_morale, minimum_strength)
}

/**
 * Selects targets for a given source_row from a given target_row.
 * Returns an array which maps attacker to defender.
 * @param source_row Attackers.
 * @param target_row Defenders.
 * @param settings Targeting setting.
 */
const pickTargets = (source_row: FrontLine, target_row: FrontLine, settings: CombatSettings) => {
  // Units attack mainly units on front of them. If not then first target from left to right.
  for (let source_index = 0; source_index < source_row.length; source_index++) {
    const source = source_row[source_index]
    if (!source)
      continue
    source.target = null
    if (target_row[source_index])
      source.target = source_index
    else {
      const maneuver = source[UnitCalc.Maneuver]
      if (settings[CombatParameter.FixTargeting] ? source_index < source_row.length / 2 : source_index <= source_row.length / 2) {
        for (let index = source_index - maneuver; index <= source_index + maneuver; ++index) {
          if (index >= 0 && index < source_row.length && target_row[index]) {
            source.target = index
            break
          }
        }
      }
      else {
        for (let index = source_index + maneuver; index >= source_index - maneuver; --index) {
          if (index >= 0 && index < source_row.length && target_row[index]) {
            source.target = index
            break
          }
        }
      }
    }
  }
}

/**
 * Adds losses to a frontline, causing damage to the units.
 * @param frontline Frontline.
 * @param losses Losses added to units. 
 */
const applyLosses = (status: StatusLine, losses: Loss[]) => {
  for (let i = 0; i < status.length; i++) {
    const unit = status[i]
    if (!unit)
      continue
    unit[UnitCalc.Morale] -= losses[i].morale
    unit[UnitCalc.Strength] -= losses[i].strength
  }
}

/**
 * Copies defeated units from a frontline to defeated.
 * Units on the frontline will be marked as defeated for visual purposes.
 * @param army Frontline and defeated.
 * @param definitions Full definitions for units in the frontline. Needed to check when defeated.
 * @param minimum_morale Minimum morale to stay in the fight.
 * @param minimum_strength Minimum strength to stay in the fight.
 */
const copyDefeated = (status: StatusLine, minimum_morale: number, minimum_strength: number) => {
  for (let i = 0; i < status.length; i++) {
    const state = status[i]
    if (!state)
      continue
    if (state[UnitCalc.Strength] > minimum_strength && state[UnitCalc.Morale] > minimum_morale)
      continue
    status[i] = null
  }
}

/**
 * Calculates losses when a given source row attacks a given target row.
 * @param source_row A row of attackers inflicting daamge on target_row.
 * @param target_row A row of defenders receiving damage from source_row.
 * @param source_to_target Selected targets for attackers.
 * @param roll Dice roll, affects amount of damage inflicted.
 * @param terrains Terrains of the battle, may affect amount of damage inflicted.
 * @param tactic_damage_multiplier Multiplier for damage from tactics.
 * @param casualties_multiplier Multiplier for strength lost from tactics.
 * @param settings Combat parameters.
 */
const attack = (status: StatusLine, source_row: FrontLine, target_row: FrontLine, roll: number, terrains: TerrainDefinition[], tactic_damage_multiplier: number, casualties_multiplier: number, settings: CombatSettings): Loss[] => {
  const target_losses = Array<Loss>(target_row.length)
  for (let i = 0; i < target_row.length; ++i)
    target_losses[i] = { morale: 0, strength: 0 }
  for (let source_index = 0; source_index < source_row.length; source_index++) {
    const source = source_row[source_index]
    if (!source)
      continue
    const state = status[source_index]
    if (!source || !state)
      continue
    const target_index = source.target
    if (target_index === null)
      continue
    const target = target_row[target_index]!
    const losses = calculateLosses(state, source, target, roll, terrains, tactic_damage_multiplier, casualties_multiplier, settings)
    target_losses[target_index].strength += losses.strength
    target_losses[target_index].morale += losses.morale
  }
  return target_losses
}

/**
 * Calculates the base damage value from roll.
 * @param roll Dice roll with modifiers.
 * @param settings Combat parameters.
 */
export const calculateBaseDamage = (roll: number, settings: CombatSettings): number => {
  const base_damage = settings[CombatParameter.BaseDamage]
  const roll_damage = settings[CombatParameter.RollDamage]
  const max_damage = settings[CombatParameter.MaxBaseDamage]
  return Math.min(max_damage, base_damage + roll_damage * roll)
}

export const calculateExperienceReduction = (settings: CombatSettings, target: CalculatedUnit) => {
  let damage_reduction_per_experience = settings[CombatParameter.ExperienceDamageReduction]
  // Bug in game which makes morale damage taken and strength damage taken affect damage reduction from experience.
  if (!settings[CombatParameter.FixExperience])
    damage_reduction_per_experience *= (2.0 + target[UnitCalc.MoraleDamageTaken] + target[UnitCalc.StrengthDamageTaken]) * 0.5
  return -damage_reduction_per_experience * target[UnitCalc.Experience]
}

export const totalDamageSource = (source: CalculatedUnit) => {
  let damage = 1
  damage = calculate(damage, 1.0 + source[UnitCalc.Discipline])
  damage = calculate(damage, 1.0 + source[UnitCalc.DamageDone])
  if (source.is_loyal)
    damage = calculate(damage, 1.1)
  return damage
}

export const calculateTotalDamage = (state: UnitStatus, settings: CombatSettings, base_damage: number, source: CalculatedUnit, target: CalculatedUnit, terrains: TerrainDefinition[], tactic_damage_multiplier: number) => {
  let damage = 100000.0 * base_damage
  damage = calculate(damage, source.total)
  /*if (settings[CombatParameter.FixDamageTaken])
    damage = calculate(damage, 1.0 + target[UnitCalc.DamageTaken])
  else
    damage = calculate(damage, 1.0 + source[UnitCalc.DamageDone])*/
  //damage = calculate(damage, 1.0 + sumBy(terrains, terrain => source[terrain.type]))
  damage = calculate(damage, 1.0 + source[target.type])
  //damage = calculate(damage, 1.0 + tactic_damage_multiplier)
  //damage = calculate(damage, 1.0 + source[UnitCalc.Offense] - target[UnitCalc.Defense])
  //damage = calculate(damage, 1.0 + calculateExperienceReduction(settings, target))
  damage = calculate(damage, state[UnitCalc.Strength])
  return damage / 100000.0
}

const precalc2 = 100000.0 * 0.2

export const calculateStrengthDamage = (settings: CombatSettings, total_damage: number, source: CalculatedUnit, target: CalculatedUnit, casualties_multiplier: number) => {
  //const strength_lost_multiplier = settings[CombatParameter.StrengthLostMultiplier]
  let strength_lost = total_damage * precalc2
  //strength_lost = calculate(strength_lost, 1.0 + casualties_multiplier)
  //strength_lost = calculate(strength_lost, strength_lost_multiplier)
  //strength_lost = calculate(strength_lost, 1.0 + source[UnitCalc.StrengthDamageDone])
  strength_lost = calculate(strength_lost, 1.0 + target[UnitCalc.StrengthDamageTaken])
  return strength_lost / 100000.0
}

const precalc1 = 100000.0 * 1.5 / 2.0

export const calculateMoraleDamage = (state: UnitStatus, settings: CombatSettings, total_damage: number, source: CalculatedUnit, target: CalculatedUnit) => {
  let morale_lost = total_damage * precalc1 * state[UnitCalc.Morale]
  //morale_lost = calculate(morale_lost, 1.0 + source[UnitCalc.MoraleDamageDone])
  morale_lost = calculate(morale_lost, 1.0 + target[UnitCalc.MoraleDamageTaken])
  return morale_lost / 100000.0
}

/**
 * Calculates both strength and morale losses caused by a given attacker to a given defender.
 * Experimental: Tested with unit tests from in-game results. Not 100% accurate.
 * @param source An attacker inflicting damange on the target.
 * @param target A defender receiving damage from the source.
 * @param roll Dice roll, affects amount of damage inflicted.
 * @param terrains Terrains of the battle, may affect amount of damage inflicted.
 * @param tactic_damage_multiplier Multiplier for damage from tactics.
 * @param casualties_multiplier Multiplier for strength lost from tactics.
 * @param settings Combat parameters.
 */
const calculateLosses = (state: UnitStatus, source: CalculatedUnit, target: CalculatedUnit, base_damage: number, terrains: TerrainDefinition[], tactic_damage_multiplier: number, casualties_multiplier: number, settings: CombatSettings): Loss => {

  const total_damage = calculateTotalDamage(state, settings, base_damage, source, target, terrains, tactic_damage_multiplier)
  const strength_lost = calculateStrengthDamage(settings, total_damage, source, target, casualties_multiplier)
  const morale_lost = calculateMoraleDamage(state, settings, total_damage, source, target)

  return { strength: strength_lost, morale: morale_lost }
}

/**
 * Similar rounding formula like in the game.
 */
const calculate = (value1: number, value2: number) => Math.floor(value1 * value2)
