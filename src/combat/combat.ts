
import { sumBy, values } from 'lodash'
import { Tactic, UnitPreferences, Terrain, UnitType, Cohort, UnitAttribute, Setting, UnitRole, Settings, CombatPhase, UnitValueType } from 'types'
import { toObj, map, noZero } from 'utils'
import { calculateValue, calculateValueWithoutLoss, calculateBase } from 'definition_values'
import { calculateExperienceReduction, getCombatPhase, calculateCohortPips, getDailyIncrease } from './combat_utils'
import { getStrengthBasedFlank } from 'managers/units'
import { SortedReserve, reinforce } from './deployment'


/**
 * Information required for fast combat calculation.
 * CombatUnits contain most of the information precalculated.
 */
export type CombatParticipant = {
  cohorts: CombatCohorts
  tactic_bonus: number
  round: number
  unit_types: CombatUnitTypes
  tactic: Tactic
  flank_ratio: number
  flank_ratio_bonus: number
  flank: number
  dice: number
  terrain_pips: number
  general_pips: { [key in CombatPhase]: number }
  roll_pips: { [key in CombatPhase]: number }
  unit_preferences: UnitPreferences
}
export type Frontline = (CombatCohort | null)[][]
export type Reserve = CombatCohort[]
export type Defeated = CombatCohort[]
export type CombatUnitTypes = { [key in UnitType]: CombatCohortDefinition }

export type CombatCohorts = {
  frontline: Frontline
  reserve: SortedReserve
  defeated: Defeated
  left_flank: number
  right_flank: number
}


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
  const morale_done = getValue(unit, UnitAttribute.MoraleDamageDone, settings[Setting.AttributeMoraleDamage]) * settings[Setting.MoraleLostMultiplier]
  const strength_done = applyPhaseDamageDone(unit, getValue(unit, UnitAttribute.StrengthDamageDone, settings[Setting.AttributeStrengthDamage]) * settings[Setting.StrengthLostMultiplier] * (1.0 + casualties_multiplier))
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
    deployment_cost: calculateBase(cohort, UnitAttribute.Cost)
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
    definition: getUnitDefinition(combatSettings, terrains, unit_types, cohort)
  }
  return combat_unit
}

type UnitCalcs = { [key in (UnitValueType)]: number }

/**
 * Static part of a unit. Properties which don't change during the battle.
 */
export interface CombatCohortCalculated {
  damage: { [key in UnitAttribute.Strength | UnitAttribute.Morale | 'Damage']: { [key in UnitType]: { [key in CombatPhase]: number } } }  // Damage multiplier for each damage type, versus each unit and for each phase.
  damage_taken_multiplier: number
  morale_taken_multiplier: number
  strength_taken_multiplier: { [key in CombatPhase]: number }
}

export interface CombatCohortDefinition extends UnitCalcs {
  id: number
  image: string
  type: UnitType
  is_loyal: boolean
  experience: number
  deployment: UnitRole
  max_strength: number
  max_morale: number
  experience_reduction: number
  deployment_cost: number
}

/** Round specific state for a cohort. */
export interface CombatCohortRoundInfo {
  /** Is attacking diagonally. */
  flanking: boolean
  /** Targeted enemy cohort. */
  target: CombatCohort | null
  /** Support cohort behind the targeted enemy. */
  target_support: CombatCohort | null
  /** Lost morale this round. */
  morale_loss: number
  /** Lost strength this round. */
  strength_loss: number
  /** Morale losses inflicted this round. */
  morale_dealt: number
  /** Strength losses inflicted this round. */
  strength_dealt: number
  /** Damage multiplier. */
  damage_multiplier: number
  /** Did the cohort get defeated. */
  is_defeated: boolean
  /** Did the cohort get destroyed.  */
  is_destroyed: boolean
  /** Total morale losses inflicted during the battle. */
  total_morale_dealt: number
  /** Total strength losses inflicted during the battle. */
  total_strength_dealt: number
  /** Chance to get captured in case of getting defeated.  */
  capture_chance?: number
}

/**
 * Interface designed for fast combat calculations. This data is cached in simulations (keep lightweight).
 */
export interface CombatCohort {
  [UnitAttribute.Morale]: number
  [UnitAttribute.Strength]: number
  calculated: CombatCohortCalculated
  state: CombatCohortRoundInfo
  definition: CombatCohortDefinition
}

/**
 * Makes given armies attach each other.
 */
export const doBattleFast = (a: CombatParticipant, d: CombatParticipant, mark_defeated: boolean, base_damages: number[], settings: Settings, round: number) => {
  const phase = getCombatPhase(round, settings)
  if (mark_defeated) {
    removeDefeated(a.cohorts.frontline)
    removeDefeated(d.cohorts.frontline)
  }
  reinforce(a)
  if (!settings[Setting.DefenderAdvantage])
    reinforce(d)
  pickTargets(a.cohorts.frontline, d.cohorts.frontline, settings)
  if (settings[Setting.DefenderAdvantage])
    reinforce(d)
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
  attack(base_damages, a.cohorts.frontline, a.dice + a.roll_pips[phase], multiplier_a, phase, settings)
  attack(base_damages, d.cohorts.frontline, d.dice + d.roll_pips[phase], multiplier_d, phase, settings)

  applyLosses(a.cohorts.frontline)
  applyLosses(d.cohorts.frontline)
  const minimum_morale = settings[Setting.MinimumMorale]
  const minimum_strength = settings[Setting.MinimumStrength]
  moveDefeated(a.cohorts.frontline, a.cohorts.defeated, minimum_morale, minimum_strength, mark_defeated)
  moveDefeated(d.cohorts.frontline, d.cohorts.defeated, minimum_morale, minimum_strength, mark_defeated)
}


const getBackTarget = (target: Frontline, index: number) => target.length > 1 ? target[1][index] : null

/**
 * Selects targets for units.
 */
const pickTargets = (source: Frontline, target: Frontline, settings: Settings) => {
  const source_length = source[0].length
  const target_length = target[0].length
  for (let i = 0; i < source.length; i++) {
    for (let j = 0; j < source[i].length; j++) {
      const unit = source[i][j]
      if (!unit)
        continue
      // No need to select targets for units without effect.
      if (i > 0 && !unit.definition[UnitAttribute.OffensiveSupport])
        continue
      const state = unit.state
      state.damage_multiplier = 0
      state.morale_dealt = 0
      state.strength_dealt = 0
      state.morale_loss = settings[Setting.DailyMoraleLoss] * (1 - unit.definition[UnitAttribute.DailyLossResist])
      state.strength_loss = 0
      state.target = null
      state.flanking = false
      if (target[0][j]) {
        state.target = target[0][j]
        state.target_support = getBackTarget(target, j)
      }
      else {
        const maneuver = Math.floor(unit.definition[UnitAttribute.Maneuver] * (settings[Setting.StrengthBasedFlank] ? getStrengthBasedFlank(unit[UnitAttribute.Strength]) : 1.0))
        if (settings[Setting.FixTargeting] ? j < source_length / 2 : j <= source_length / 2) {
          for (let index = j - maneuver; index <= j + maneuver; ++index) {
            if (index >= 0 && index < target_length && target[0][index]) {
              state.target = target[0][index]
              state.flanking = true
              state.target_support = getBackTarget(target, index)
              break
            }
          }
        }
        else {
          for (let index = j + maneuver; index >= j - maneuver; --index) {
            if (index >= 0 && index < target_length && target[0][index]) {
              state.target = target[0][index]
              state.flanking = true
              state.target_support = getBackTarget(target, index)
              break
            }
          }
        }
      }
    }
  }
}

/**
 * Calculates effectiveness of a tactic against another tactic with a given army.
 */
export const calculateTactic = (army: CombatCohorts, tactic: Tactic, counter_tactic?: Tactic): number => {
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
  return ratio && calculateFlankRatio(army) > ratio ? setting[Setting.InsufficientSupportPenalty] : 0.0
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

  return flank / noZero(infantry)
}

/**
 * Applies stored losses to units.
 */
const applyLosses = (frontline: Frontline) => {
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
const moveDefeated = (frontline: Frontline, defeated: Reserve, minimum_morale: number, minimum_strength: number, mark_defeated: boolean) => {
  for (let i = 0; i < frontline.length; i++) {
    for (let j = 0; j < frontline[i].length; j++) {
      const unit = frontline[i][j]
      if (!unit)
        continue
      if (unit[UnitAttribute.Strength] > minimum_strength && unit[UnitAttribute.Morale] > minimum_morale)
        continue
      unit.state.is_destroyed = unit[UnitAttribute.Strength] <= minimum_strength
      if (mark_defeated)
        frontline[i][j] = { ...unit, state: { ...unit.state, is_defeated: true } }
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
export const removeDefeated = (frontline: Frontline) => {
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
const attack = (base_damages: number[], frontline: Frontline, roll: number, dynamic_multiplier: number, phase: CombatPhase, settings: Settings) => {
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
      calculateMoraleLosses(base_damages, source, target, source.state.target_support, roll, multiplier, phase, settings[Setting.UseMaxMorale])
      calculateStrengthLosses(base_damages, source, target, source.state.target_support, roll, multiplier, phase)
    }
  }
}

const PRECISION = 100000.0

const precalculateDamage = (terrains: Terrain[], unit: Cohort, settings: Settings) => (
  PRECISION
  * getValue(unit, UnitAttribute.Discipline, true)
  * getValue(unit, UnitAttribute.CombatAbility, settings[Setting.AttributeCombatAbility])
  * getValue(unit, UnitAttribute.DamageDone, settings[Setting.AttributeDamage])
  * (1.0 + sumBy(terrains, terrain => getMultiplier(unit, terrain.type, settings[Setting.AttributeTerrainType])))
  * (unit.is_loyal ? 1.1 : 1.0)
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
  source.state.damage_multiplier = dynamic_multiplier * source.calculated.damage['Damage'][target.definition.type][phase] * target.calculated.damage_taken_multiplier / PRECISION
  return dynamic_multiplier
}


const calculateDynamicBaseDamage = (roll: number, source: CombatCohort, target: CombatCohort, target_support: CombatCohort | null, type: UnitAttribute.Morale | UnitAttribute.Strength, phase?: CombatPhase) => {
  return Math.max(0, roll + calculateCohortPips(source.definition, target.definition, target_support ? target_support.definition : null, type, phase))
}

const calculateMoraleLosses = (base_damages: number[], source: CombatCohort, target: CombatCohort, target_support: CombatCohort | null, roll: number, dynamic_multiplier: number, phase: CombatPhase, use_max_morale: boolean) => {
  const morale_roll = calculateDynamicBaseDamage(roll, source, target, target_support, UnitAttribute.Morale)
  const morale = use_max_morale ? source.definition.max_morale : source[UnitAttribute.Morale]
  const morale_lost = base_damages[morale_roll] * dynamic_multiplier * source.calculated.damage[UnitAttribute.Morale][target.definition.type][phase] * morale * target.calculated.morale_taken_multiplier

  source.state.morale_dealt = Math.floor(morale_lost) / PRECISION
  source.state.total_morale_dealt += source.state.morale_dealt
  target.state.morale_loss += source.state.morale_dealt
  // Morale damage seems to carry over only when not flanking (but this can be wrong).
  if (!source.state.flanking && target_support)
    target_support.state.morale_loss += source.state.morale_dealt
}

const calculateStrengthLosses = (base_damages: number[], source: CombatCohort, target: CombatCohort, target_support: CombatCohort | null, roll: number, dynamic_multiplier: number, phase: CombatPhase) => {
  const strength_roll = calculateDynamicBaseDamage(roll, source, target, target_support, UnitAttribute.Strength, phase)
  const strength_lost = base_damages[strength_roll] * dynamic_multiplier * source.calculated.damage[UnitAttribute.Strength][target.definition.type][phase] * target.calculated.strength_taken_multiplier[phase]

  source.state.strength_dealt = Math.floor(strength_lost) / PRECISION
  source.state.total_strength_dealt += source.state.strength_dealt
  target.state.strength_loss += source.state.strength_dealt
}
