
import { TacticDefinition, UnitAttribute, Setting, UnitRole, Settings, CombatPhase, CombatCohorts, CombatCohort, CombatParticipant, CombatFrontline, CombatDefeated } from 'types'
import { noZero } from 'utils'
import { calculateValue } from 'definition_values'
import { getCombatPhase, calculateCohortPips, getDailyIncrease, iterateCohorts, removeDefeated, calculateTotalStrength, stackWipe, reserveSize, reinforce } from 'combat'

/**
 * Makes given armies attach each other.
 */
export const doBattle = (a: CombatParticipant, d: CombatParticipant, mark_defeated: boolean, settings: Settings, round: number) => {
  const phase = getCombatPhase(round, settings)
  if (mark_defeated) {
    removeDefeated(a.cohorts.frontline)
    removeDefeated(d.cohorts.frontline)
  }
  reinforce(a, settings)
  if (!settings[Setting.DefenderAdvantage])
    reinforce(d, settings)
  pickTargets(a.cohorts.frontline, d.cohorts.frontline, settings)
  if (settings[Setting.DefenderAdvantage])
    reinforce(d, settings)
  pickTargets(d.cohorts.frontline, a.cohorts.frontline, settings)

  // Tactic bonus changes dynamically when units lose strength so it can't be precalculated.
  // If this is a problem a fast mode can be implemeted where to bonus is only calculated once.
  a.round = round
  d.round = round
  const daily_multiplier = 1 + getDailyIncrease(round, settings)
  a.tactic_bonus = settings[Setting.Tactics] ? calculateTactic(a.cohorts, a.tactic, d.tactic) : 0.0
  d.tactic_bonus = settings[Setting.Tactics] ? calculateTactic(d.cohorts, d.tactic, a.tactic) : 0.0
  a.flank_ratio_bonus = calculateFlankRatioPenalty(d.cohorts, d.flank_ratio, settings)
  d.flank_ratio_bonus = calculateFlankRatioPenalty(a.cohorts, a.flank_ratio, settings)
  const multiplier_a = (1 + a.tactic_bonus) * daily_multiplier * (1 + a.flank_ratio_bonus)
  const multiplier_d = (1 + d.tactic_bonus) * daily_multiplier * (1 + d.flank_ratio_bonus)
  attack(a.cohorts.frontline, a.dice + a.roll_pips[phase], multiplier_a, phase, settings)
  attack(d.cohorts.frontline, d.dice + d.roll_pips[phase], multiplier_d, phase, settings)

  applyLosses(a.cohorts.frontline)
  applyLosses(d.cohorts.frontline)
  a.alive = moveDefeated(a.cohorts.frontline, a.cohorts.defeated, mark_defeated, round, settings) || reserveSize(a.cohorts.reserve) > 0
  d.alive = moveDefeated(d.cohorts.frontline, d.cohorts.defeated, mark_defeated, round, settings) || reserveSize(d.cohorts.reserve) > 0
  if (settings[Setting.Stackwipe] && !d.alive)
    checkHardStackWipe(d.cohorts, a.cohorts, settings, round < settings[Setting.StackwipeRounds])
  else if (settings[Setting.Stackwipe] && !a.alive)
    checkHardStackWipe(a.cohorts, d.cohorts, settings, round < settings[Setting.StackwipeRounds])
}

const checkHardStackWipe = (defeated: CombatCohorts, enemy: CombatCohorts, settings: Settings, soft: boolean) => {
  const total = calculateTotalStrength(defeated)
  const total_enemy = calculateTotalStrength(enemy)
  if (total_enemy / total > (soft ? settings[Setting.SoftStackWipeLimit] : settings[Setting.HardStackWipeLimit]))
    stackWipe(defeated)
}

const getBackTarget = (target: CombatFrontline, index: number) => target.length > 1 ? target[1][index] : null

/**
 * Selects targets for units.
 */
const pickTargets = (source: CombatFrontline, target: CombatFrontline, settings: Settings) => {
  const source_length = source[0].length
  const target_length = target[0].length
  for (let i = 0; i < source.length; i++) {
    for (let j = 0; j < source[i].length; j++) {
      const unit = source[i][j]
      if (!unit)
        continue
      const state = unit.state
      state.damage_multiplier = 0
      state.morale_dealt = 0
      state.strength_dealt = 0
      state.morale_loss = settings[Setting.DailyMoraleLoss] * (1 - unit.definition[UnitAttribute.DailyLossResist])
      state.strength_loss = 0
      state.target = null
      state.flanking = false
      // No need to select targets for units without effect.
      if (i > 0 && !unit.definition[UnitAttribute.OffensiveSupport])
        continue
      if (target[0][j] && !target[0][j]?.is_weak) {
        state.target = target[0][j]
        state.target_support = getBackTarget(target, j)
      }
      else {
        const maneuver = Math.floor(unit.definition[UnitAttribute.Maneuver])
        if (!settings[Setting.FixFlankTargeting] || (settings[Setting.FixTargeting] ? j < source_length / 2 : j <= source_length / 2)) {
          const start = Math.max(0, j - maneuver)
          const end = Math.min(target_length - 1, j + maneuver)
          for (let index = start; index <= end; ++index) {
            if (target[0][index] && !target[0][index]?.is_weak) {
              state.target = target[0][index]
              state.flanking = true
              state.target_support = getBackTarget(target, index)
              break
            }
          }
        }
        else {
          const start = Math.min(target_length - 1, j + maneuver)
          const end = Math.max(0, j - maneuver)
          for (let index = start; index >= end; --index) {
            if (target[0][index] && !target[0][index]?.is_weak) {
              state.target = target[0][index]
              state.flanking = true
              state.target_support = getBackTarget(target, index)
              break
            }
          }
        }
      }
      // Fallback if all targets are considered weak.
      if (!state.target && target[0][j]) {
        state.target = target[0][j]
        state.target_support = getBackTarget(target, j)
      }
    }
  }
}

/**
 * Calculates effectiveness of a tactic against another tactic with a given army.
 */
export const calculateTactic = (army: CombatCohorts, tactic: TacticDefinition, counter_tactic?: TacticDefinition): number => {
  const effectiveness = counter_tactic ? calculateValue(tactic, counter_tactic.type) : 1.0
  let average_weight = 1.0
  if (effectiveness > 0 && tactic && army) {
    let total_strength = 0
    let total_weight = 0.0

    const addWeight = (cohorts: (CombatCohort | null)[]) => {
      for (let i = 0; i < cohorts.length; i++) {
        const cohort = cohorts[i]
        if (!cohort || cohort.state.is_defeated)
          continue
        total_strength += cohort[UnitAttribute.Strength]
        total_weight += calculateValue(tactic, cohort.definition.type) * cohort[UnitAttribute.Strength]
      }
    }
    iterateCohorts(army, addWeight)
    if (total_strength)
      average_weight = total_weight / total_strength
  }

  return effectiveness * Math.min(1.0, average_weight)
}

const calculateFlankRatioPenalty = (army: CombatCohorts, ratio: number, setting: Settings) => {
  return ratio && calculateFlankRatio(army) > ratio ? setting[Setting.InsufficientSupportPenalty] / (1 - setting[Setting.InsufficientSupportPenalty]) : 0.0
}

const calculateFlankRatio = (army: CombatCohorts): number => {
  let infantry = 0.0
  let flank = 0.0

  const addRatio = (cohorts: (CombatCohort | null)[]) => {
    for (let i = 0; i < cohorts.length; i++) {
      const cohort = cohorts[i]
      if (!cohort || cohort.state.is_defeated)
        continue
      if (cohort.definition.role === UnitRole.Front)
        infantry += cohort[UnitAttribute.Strength]
      if (cohort.definition.role === UnitRole.Flank)
        flank += cohort[UnitAttribute.Strength]
    }
  }
  iterateCohorts(army, addRatio)
  return flank / noZero(flank + infantry)
}

/**
 * Applies stored losses to units.
 */
const applyLosses = (frontline: CombatFrontline) => {
  for (let i = 0; i < frontline.length; i++) {
    for (let j = 0; j < frontline[i].length; j++) {
      const unit = frontline[i][j]
      if (!unit)
        continue
      unit[UnitAttribute.Morale] = Math.max(0, unit[UnitAttribute.Morale] - unit.state.morale_loss)
      unit[UnitAttribute.Strength] = Math.max(0, unit[UnitAttribute.Strength] - unit.state.strength_loss)
    }
  }
}

/**
 * Moves defeated units from a frontline to defeated.
 */
const moveDefeated = (frontline: CombatFrontline, defeated: CombatDefeated, mark_defeated: boolean, round: number, settings: Settings) => {
  const minimum_morale = settings[Setting.MinimumMorale]
  const minimum_strength = settings[Setting.MinimumStrength]
  let alive = false
  for (let i = 0; i < frontline.length; i++) {
    for (let j = 0; j < frontline[i].length; j++) {
      const unit = frontline[i][j]
      if (!unit)
        continue
      if (unit[UnitAttribute.Strength] > minimum_strength && unit[UnitAttribute.Morale] > minimum_morale) {
        alive = true
        continue
      }
      if (i > 0 && !settings[Setting.BackRowRetreat]) {
        alive = true
        continue
      }
      if (settings[Setting.DynamicTargeting])
        unit.is_weak = true
      if (settings[Setting.RetreatRounds] > round + 1) {
        alive = true
        continue
      }
      unit.state.is_destroyed = unit[UnitAttribute.Strength] <= 0
      if (mark_defeated)
        frontline[i][j] = { ...unit, state: { ...unit.state, is_defeated: true } } // Temporary copy for UI purposes.
      else
        frontline[i][j] = null
      unit.state.target = null
      defeated.push(unit)
    }
  }
  return alive
}

/**
 * Calculates losses when units attack their targets.
 */
const attack = (frontline: CombatFrontline, roll: number, dynamic_multiplier: number, phase: CombatPhase, settings: Settings) => {
  for (let i = 0; i < frontline.length; i++) {
    for (let j = 0; j < frontline[i].length; j++) {
      const source = frontline[i][j]
      if (!source)
        continue
      const target = source.state.target
      if (!target)
        continue
      target.state.capture_chance = source.definition[UnitAttribute.CaptureChance]
      const multiplier = calculateDamageMultiplier(source, target, dynamic_multiplier, i > 0, phase, settings)
      calculateMoraleLosses(source, target, source.state.target_support, roll, multiplier, phase, settings)
      calculateStrengthLosses(source, target, source.state.target_support, roll, multiplier, phase, settings)
    }
  }
}

const calculateCohortDamageMultiplier = (source: CombatCohort, target: CombatCohort, is_support: boolean, settings: Settings) => {
  const definition_s = source.definition
  const definition_t = target.definition

  return source[UnitAttribute.Strength]
    * (settings[Setting.AttributeOffenseDefense] ? 1.0 + definition_s[UnitAttribute.Offense] - definition_t[UnitAttribute.Defense] : 1.0)
    * (is_support ? definition_s[UnitAttribute.OffensiveSupport] : 1.0)
}

const calculateDamageMultiplier = (source: CombatCohort, target: CombatCohort, dynamic_multiplier: number, is_support: boolean, phase: CombatPhase, settings: Settings) => {
  dynamic_multiplier *= calculateCohortDamageMultiplier(source, target, is_support, settings)
  source.state.damage_multiplier = dynamic_multiplier * source.calculated.damage['Damage'][target.definition.type][phase] * target.calculated.damage_taken_multiplier / settings[Setting.Precision]
  return dynamic_multiplier
}


const calculatePips = (roll: number, max_pips: number, source: CombatCohort, target: CombatCohort, target_support: CombatCohort | null, type: UnitAttribute.Morale | UnitAttribute.Strength, phase?: CombatPhase) => {
  return Math.min(max_pips, Math.max(0, roll + calculateCohortPips(source.definition, target.definition, target_support ? target_support.definition : null, type, phase)))
}

const calculateMoraleLosses = (source: CombatCohort, target: CombatCohort, target_support: CombatCohort | null, roll: number, dynamic_multiplier: number, phase: CombatPhase, settings: Settings) => {
  const pips = calculatePips(roll, settings[Setting.MaxPips], source, target, target_support, UnitAttribute.Morale)
  const morale = settings[Setting.UseMaxMorale] ? source.definition.max_morale : source[UnitAttribute.Morale]
  const damage = pips * dynamic_multiplier * source.calculated.damage[UnitAttribute.Morale][target.definition.type][phase] * morale * target.calculated.morale_taken_multiplier

  source.state.morale_dealt = Math.floor(damage) / settings[Setting.Precision]
  source.state.total_morale_dealt += source.state.morale_dealt
  target.state.morale_loss += source.state.morale_dealt
  // Morale damage seems to carry over only when not flanking (but this can be wrong).
  if (!source.state.flanking && target_support)
    target_support.state.morale_loss += source.state.morale_dealt
}

const calculateStrengthLosses = (source: CombatCohort, target: CombatCohort, target_support: CombatCohort | null, roll: number, dynamic_multiplier: number, phase: CombatPhase, settings: Settings) => {
  const pips = calculatePips(roll, settings[Setting.MaxPips], source, target, target_support, UnitAttribute.Strength, phase)
  const damage = pips * dynamic_multiplier * source.calculated.damage[UnitAttribute.Strength][target.definition.type][phase] * target.calculated.strength_taken_multiplier[phase]

  source.state.strength_dealt = Math.floor(damage) / settings[Setting.Precision]
  source.state.total_strength_dealt += source.state.strength_dealt
  target.state.strength_loss += source.state.strength_dealt
}
