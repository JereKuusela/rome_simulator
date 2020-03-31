
import { sumBy, values } from 'lodash'
import { TacticDefinition, Terrain, UnitType, Cohort, UnitAttribute, Setting, UnitRole, Settings, CombatPhase, UnitValueType, CombatCohorts, CombatCohort, CombatCohortCalculated, CombatCohortDefinition, CombatParticipant, CombatFrontline, CombatDefeated } from 'types'
import { toObj, map, noZero } from 'utils'
import { calculateValue, calculateValueWithoutLoss, calculateBase } from 'definition_values'
import { calculateExperienceReduction, getCombatPhase, calculateCohortPips, getDailyIncrease } from './combat_utils'
import { getStrengthBasedFlank } from 'managers/units'
import { reinforce } from './deployment'


export const iterateCohorts = (cohorts: CombatCohorts, func: (cohorts: (CombatCohort | null)[]) => void) => {
  for (let i = 0; i < cohorts.frontline.length; i++)
    func(cohorts.frontline[i])
  func(cohorts.reserve.front)
  func(cohorts.reserve.flank)
  func(cohorts.reserve.support)
  func(cohorts.defeated)
}

const applyPhaseDamageDone = (unit: Cohort, value: number) => ({
  [CombatPhase.Default]: value,
  [CombatPhase.Fire]: value * (1.0 + calculateValue(unit, UnitAttribute.FireDamageDone)),
  [CombatPhase.Shock]: value * (1.0 + calculateValue(unit, UnitAttribute.ShockDamageDone))
})

const applyPhaseDamageTaken = (unit: Cohort, value: number) => ({
  [CombatPhase.Default]: value,
  [CombatPhase.Fire]: value * (1.0 + calculateValue(unit, UnitAttribute.FireDamageTaken)),
  [CombatPhase.Shock]: value * (1.0 + calculateValue(unit, UnitAttribute.ShockDamageTaken))
})

const applyPhaseDamage = (unit: Cohort, value: number) => ({
  [CombatPhase.Default]: value,
  [CombatPhase.Fire]: value * calculateValue(unit, CombatPhase.Fire),
  [CombatPhase.Shock]: value * calculateValue(unit, CombatPhase.Shock)
})

const applyUnitTypes = (unit: Cohort, unit_types: UnitType[], settings: Settings, values: { [key in CombatPhase]: number }) => (
  toObj(unit_types, type => type, type => map(values, damage => damage * getValue(unit, type, settings[Setting.AttributeUnitType])))
)

const applyDamageTypes = (unit: Cohort, settings: Settings, casualties_multiplier: number, values: { [key in UnitType]: { [key in CombatPhase]: number } }) => {
  const morale_done = getValue(unit, UnitAttribute.MoraleDamageDone, settings[Setting.AttributeMoraleDamage]) * settings[Setting.MoraleLostMultiplier] / 1000.0
  const strength_done = applyPhaseDamageDone(unit, getValue(unit, UnitAttribute.StrengthDamageDone, settings[Setting.AttributeStrengthDamage]) * settings[Setting.StrengthLostMultiplier] * (1.0 + casualties_multiplier) / 1000.0)
  return {
    [UnitAttribute.Strength]: map(values, values => map(values, (value, phase) => value * strength_done[phase])),
    [UnitAttribute.Morale]: map(values, values => map(values, value => value * morale_done)),
    'Damage': values
  }
}

const getDamages = (settings: Settings, casualties_multiplier: number, terrains: Terrain[], unit_types: UnitType[], cohort: Cohort) => (
  applyDamageTypes(cohort, settings, casualties_multiplier, applyUnitTypes(cohort, unit_types, settings, applyPhaseDamage(cohort, precalculateDamage(terrains, cohort, settings))))
)

/**
 * Returns a precalculated info about a given unit.
 */
const precalculateUnit = (settings: Settings, casualties_multiplier: number, terrains: Terrain[], unit_types: UnitType[], cohort: Cohort) => {
  const damage_reduction = precalculateDamageReduction(cohort, settings)
  const info: CombatCohortCalculated = {
    damage: getDamages(settings, casualties_multiplier, terrains, unit_types, cohort),
    damage_taken_multiplier: damage_reduction,
    morale_taken_multiplier: damage_reduction * getValue(cohort, UnitAttribute.MoraleDamageTaken, settings[Setting.AttributeMoraleDamage]),
    strength_taken_multiplier: applyPhaseDamageTaken(cohort, damage_reduction * getValue(cohort, UnitAttribute.StrengthDamageTaken, settings[Setting.AttributeStrengthDamage]))
  }
  return info
}

const getValue = (unit: Cohort, attribute: UnitValueType, enabled: boolean) => 1.0 + getMultiplier(unit, attribute, enabled)
const getMultiplier = (unit: Cohort, attribute: UnitValueType, enabled: boolean) => enabled ? calculateValue(unit, attribute) : 0

export const getUnitDefinition = (combatSettings: Settings, terrains: Terrain[], unit_types: UnitType[], cohort: Cohort): CombatCohortDefinition => {
  const info = {
    id: cohort.id,
    type: cohort.type,
    is_loyal: !!cohort.is_loyal,
    image: cohort.image,
    deployment: cohort.role,
    max_morale: calculateValueWithoutLoss(cohort, UnitAttribute.Morale),
    max_strength: calculateValueWithoutLoss(cohort, UnitAttribute.Strength),
    experience_reduction: calculateExperienceReduction(combatSettings, cohort),
    // Unmodified value is used to determine deployment order.
    deployment_cost: calculateBase(cohort, UnitAttribute.Cost),
    tech: cohort.tech,
    mode: cohort.mode,
    role: cohort.role,
    base: cohort.base
  } as CombatCohortDefinition
  values(UnitAttribute).forEach(calc => { info[calc] = calculateValue(cohort, calc) })
  values(CombatPhase).forEach(calc => { info[calc] = calculateValue(cohort, calc) })
  terrains.forEach(({ type }) => { info[type] = calculateValue(cohort, type) })
  unit_types.forEach(calc => { info[calc] = calculateValue(cohort, calc) })
  return info
}

/**
 * Transforms a unit to a combat unit.
 */
export const getCombatUnit = (combatSettings: Settings, casualties_multiplier: number, terrains: Terrain[], unit_types: UnitType[], cohort: Cohort | null): CombatCohort | null => {
  if (!cohort)
    return null
  const combat_unit: CombatCohort = {
    [UnitAttribute.Morale]: calculateValue(cohort, UnitAttribute.Morale),
    [UnitAttribute.Strength]: calculateValue(cohort, UnitAttribute.Strength),
    calculated: precalculateUnit(combatSettings, casualties_multiplier, terrains, unit_types, cohort),
    state: { target: null, target_support: null, flanking: false, morale_loss: 0, strength_loss: 0, morale_dealt: 0, strength_dealt: 0, damage_multiplier: 0, is_defeated: false, is_destroyed: false, total_morale_dealt: 0, total_strength_dealt: 0 },
    definition: getUnitDefinition(combatSettings, terrains, unit_types, cohort),
    is_weak: false
  }
  return combat_unit
}

/**
 * Makes given armies attach each other.
 */
export const doBattleFast = (a: CombatParticipant, d: CombatParticipant, mark_defeated: boolean, settings: Settings, round: number) => {
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
  a.tactic_bonus = calculateTactic(a.cohorts, a.tactic, d.tactic)
  d.tactic_bonus = calculateTactic(d.cohorts, d.tactic, a.tactic)
  a.flank_ratio_bonus = calculateFlankRatioPenalty(d.cohorts, d.flank_ratio, settings)
  d.flank_ratio_bonus = calculateFlankRatioPenalty(a.cohorts, a.flank_ratio, settings)
  const multiplier_a = (1 + a.tactic_bonus) * daily_multiplier * (1 + a.flank_ratio_bonus)
  const multiplier_d = (1 + d.tactic_bonus) * daily_multiplier * (1 + d.flank_ratio_bonus)
  attack(a.cohorts.frontline, a.dice + a.roll_pips[phase], multiplier_a, phase, settings)
  attack(d.cohorts.frontline, d.dice + d.roll_pips[phase], multiplier_d, phase, settings)

  applyLosses(a.cohorts.frontline)
  applyLosses(d.cohorts.frontline)
  moveDefeated(a.cohorts.frontline, a.cohorts.defeated, mark_defeated, round, settings)
  moveDefeated(d.cohorts.frontline, d.cohorts.defeated, mark_defeated, round, settings)
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
        const maneuver = Math.floor(unit.definition[UnitAttribute.Maneuver] * (settings[Setting.StrengthBasedFlank] ? getStrengthBasedFlank(unit[UnitAttribute.Strength]) : 1.0))
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
        if (!cohort)
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

export const calculateFlankRatioPenalty = (army: CombatCohorts, ratio: number, setting: Settings) => {
  return ratio && calculateFlankRatio(army) > ratio ? setting[Setting.InsufficientSupportPenalty] / (1 - setting[Setting.InsufficientSupportPenalty]) : 0.0
}

const calculateFlankRatio = (army: CombatCohorts): number => {
  let infantry = 0.0
  let flank = 0.0

  const addRatio = (cohorts: (CombatCohort | null)[]) => {
    for (let i = 0; i < cohorts.length; i++) {
      const cohort = cohorts[i]
      if (!cohort)
        continue
      if (cohort.definition.deployment === UnitRole.Front)
        infantry += cohort[UnitAttribute.Strength]
      if (cohort.definition.deployment === UnitRole.Flank)
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
      unit[UnitAttribute.Morale] -= unit.state.morale_loss
      unit[UnitAttribute.Strength] -= unit.state.strength_loss
    }
  }
}

/**
 * Moves defeated units from a frontline to defeated.
 */
const moveDefeated = (frontline: CombatFrontline, defeated: CombatDefeated, mark_defeated: boolean, round: number, settings: Settings) => {
  const minimum_morale = settings[Setting.MinimumMorale]
  const minimum_strength = settings[Setting.MinimumStrength]
  for (let i = 0; i < frontline.length; i++) {
    if (i > 0 && !settings[Setting.BackRowRetreat])
      return
    for (let j = 0; j < frontline[i].length; j++) {
      const unit = frontline[i][j]
      if (!unit)
        continue
      if (unit[UnitAttribute.Strength] > minimum_strength && unit[UnitAttribute.Morale] > minimum_morale)
        continue
      if (settings[Setting.DynamicTargeting])
        unit.is_weak = true
      if (settings[Setting.RetreatRounds] > round + 1)
        continue
      unit.state.is_destroyed = unit[UnitAttribute.Strength] <= minimum_strength
      if (mark_defeated)
        frontline[i][j] = { ...unit, state: { ...unit.state, is_defeated: true } } // Temporary copy for UI purposes.
      else
        frontline[i][j] = null
      unit.state.target = null
      defeated.push(unit)
    }
  }
}

/**
 * Removes temporary defeated units from frontline.
 */
export const removeDefeated = (frontline: CombatFrontline) => {
  for (let i = 0; i < frontline.length; i++) {
    for (let j = 0; j < frontline[i].length; j++) {
      const unit = frontline[i][j]
      if (!unit)
        continue
      if (unit.state.is_defeated)
        frontline[i][j] = null
    }
  }
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

const precalculateDamage = (terrains: Terrain[], unit: Cohort, settings: Settings) => (
  settings[Setting.Precision]
  * getValue(unit, UnitAttribute.Discipline, true)
  * getValue(unit, UnitAttribute.CombatAbility, settings[Setting.AttributeCombatAbility])
  * getValue(unit, UnitAttribute.DamageDone, settings[Setting.AttributeDamage])
  * (1.0 + sumBy(terrains, terrain => getMultiplier(unit, terrain.type, settings[Setting.AttributeTerrainType])))
  * (settings[Setting.AttributeLoyal] && unit.is_loyal ? 1.1 : 1.0)
)

const precalculateDamageReduction = (unit: Cohort, settings: Settings) => (
  (settings[Setting.AttributeExperience] ? 1.0 + calculateExperienceReduction(settings, unit) : 1.0)
  * getValue(unit, UnitAttribute.DamageTaken, settings[Setting.AttributeDamage])
  / noZero(getValue(unit, UnitAttribute.Discipline, settings[Setting.DisciplineDamageReduction]))
  / noZero(getMultiplier(unit, UnitAttribute.MilitaryTactics, settings[Setting.AttributeMilitaryTactics]))
)

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
