
import { sumBy, values } from 'lodash'
import { Tactic, UnitPreferences, Terrain, UnitType, Cohort, UnitAttribute, Setting, UnitRole, Settings, CombatPhase, UnitValueType } from 'types'
import { toObj, map, noZero } from 'utils'
import { calculateValue, calculateValueWithoutLoss, calculateBase } from 'definition_values'
import { calculateExperienceReduction, getCombatPhase, calculateUnitPips, getDailyIncrease } from './combat_utils'
import { reinforce } from './reinforcement'
import { getStrengthBasedFlank } from 'managers/units'


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
export type CombatUnitTypes = { [key in UnitType]: CombatUnit }

export type CombatCohorts = {
  frontline: (CombatCohort | null)[][]
  reserve: CombatCohort[]
  defeated: CombatCohort[]
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
  const info: CombatUnitPreCalculated = {
    damage: getDamages(settings, casualties_multiplier, terrains, unit_types, cohort),
    damage_taken_multiplier: damage_reduction,
    morale_taken_multiplier: damage_reduction * getValue(cohort, UnitAttribute.MoraleDamageTaken, settings[Setting.AttributeMoraleDamage]),
    strength_taken_multiplier: applyPhaseDamageTaken(cohort, damage_reduction * getValue(cohort, UnitAttribute.StrengthDamageTaken, settings[Setting.AttributeStrengthDamage]))
  }
  return info
}

const getValue = (unit: Cohort, attribute: UnitValueType, enabled: boolean) => 1.0 + getMultiplier(unit, attribute, enabled)
const getMultiplier = (unit: Cohort, attribute: UnitValueType, enabled: boolean) => enabled ? calculateValue(unit, attribute): 0

export const getUnitDefinition = (combatSettings: Settings, terrains: Terrain[], unit_types: UnitType[], cohort: Cohort): CombatUnit => {
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
  } as CombatUnit
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
    state: { target: null, morale_loss: 0, strength_loss: 0, morale_dealt: 0, strength_dealt: 0, damage_multiplier: 0, is_defeated: false, is_destroyed: false, total_morale_dealt: 0, total_strength_dealt: 0 },
    definition: getUnitDefinition(combatSettings, terrains, unit_types, cohort)
  }
  return combat_unit
}

type UnitCalcs = { [key in (UnitValueType)]: number }

/**
 * Static part of a unit. Properties which don't change during the battle.
 */
export interface CombatUnitPreCalculated {
  damage: { [key in UnitAttribute.Strength | UnitAttribute.Morale | 'Damage']: { [key in UnitType]: { [key in CombatPhase]: number } } }  // Damage multiplier for each damage type, versus each unit and for each phase.
  damage_taken_multiplier: number
  morale_taken_multiplier: number
  strength_taken_multiplier: { [key in CombatPhase]: number }
}

export interface CombatUnit extends UnitCalcs {
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

/**
 * Round specific state for a unit.
 */
export interface CombatUnitRoundInfo {
  target: CombatCohort | null
  morale_loss: number
  strength_loss: number
  morale_dealt: number
  strength_dealt: number
  damage_multiplier: number
  is_defeated: boolean
  is_destroyed: boolean
  total_morale_dealt: number
  total_strength_dealt: number
  capture_chance?: number
}

/**
 * Interface designed for fast combat calculations. This data is cached in simulations (keep lightweight).
 */
export interface CombatCohort {
  [UnitAttribute.Morale]: number
  [UnitAttribute.Strength]: number
  calculated: CombatUnitPreCalculated
  state: CombatUnitRoundInfo
  definition: CombatUnit
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
  reinforce(a.cohorts.frontline, a.cohorts.reserve)
  if (!settings[Setting.DefenderAdvantage])
    reinforce(d.cohorts.frontline, d.cohorts.reserve)
  pickTargets(a.cohorts.frontline, d.cohorts.frontline, settings)
  if (settings[Setting.DefenderAdvantage])
    reinforce(d.cohorts.frontline, d.cohorts.reserve)
  pickTargets(d.cohorts.frontline, a.cohorts.frontline, settings)

  // Tactic bonus changes dynamically when units lose strength so it can't be precalculated.
  // If this is a problem a fast mode can be implemeted where to bonus is only calculated once.
  a.round = round
  d.round = round
  const daily_multiplier = 1 + getDailyIncrease(round, settings)
  const multiplier_a = (1 + calculateTactic(a.cohorts, a.tactic, d.tactic)) * daily_multiplier
  const multiplier_d = (1 + calculateTactic(d.cohorts, d.tactic, a.tactic)) * daily_multiplier
  attack(base_damages, a.cohorts.frontline, a.dice + a.roll_pips[phase], multiplier_a, phase, settings)
  attack(base_damages, d.cohorts.frontline, d.dice + d.roll_pips[phase], multiplier_d, phase, settings)

  applyLosses(a.cohorts.frontline)
  applyLosses(d.cohorts.frontline)
  const minimum_morale = settings[Setting.MinimumMorale]
  const minimum_strength = settings[Setting.MinimumStrength]
  moveDefeated(a.cohorts.frontline, a.cohorts.defeated, minimum_morale, minimum_strength, mark_defeated)
  moveDefeated(d.cohorts.frontline, d.cohorts.defeated, minimum_morale, minimum_strength, mark_defeated)
}

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
      if (i > 0 && !unit.definition[UnitAttribute.BackrowEffectiveness])
        continue
      const state = unit.state
      state.damage_multiplier = 0
      state.morale_dealt = 0
      state.strength_dealt = 0
      state.morale_loss = settings[Setting.DailyMoraleLoss] * (1 - unit.definition[UnitAttribute.DailyLossResist])
      state.strength_loss = 0
      state.target = null
      if (target[0][j])
        state.target = target[0][j]
      else {
        const maneuver = Math.floor(unit.definition[UnitAttribute.Maneuver] * (settings[Setting.StrengthBasedFlank] ? getStrengthBasedFlank(unit[UnitAttribute.Strength]) : 1.0))
        if (settings[Setting.FixTargeting] ? j < source_length / 2 : j <= source_length / 2) {
          for (let index = j - maneuver; index <= j + maneuver; ++index) {
            if (index >= 0 && index < target_length && target[0][index]) {
              state.target = target[0][index]
              break
            }
          }
        }
        else {
          for (let index = j + maneuver; index >= j - maneuver; --index) {
            if (index >= 0 && index < target_length && target[0][index]) {
              state.target = target[0][index]
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
 * Not optimized!
 */
export const calculateTactic = (army: CombatCohorts, tactic: Tactic, counter_tactic?: Tactic): number => {
  const effectiveness = counter_tactic ? calculateValue(tactic, counter_tactic.type) : 1.0
  let unit_modifier = 1.0
  if (effectiveness > 0 && tactic && army) {
    let units = 0
    let weight = 0.0
    for (const unit of army.frontline.reduce((prev, current) => prev.concat(current), army.reserve.concat(army.defeated))) {
      if (!unit)
        continue
      units += unit[UnitAttribute.Strength]
      weight += calculateValue(tactic, unit.definition.type) * unit[UnitAttribute.Strength]
    }
    if (units)
      unit_modifier = weight / units
  }

  return effectiveness * Math.min(1.0, unit_modifier)
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
      if (i > 0) {
        // Morale losses from the frontline are copied to the backline.
        const front_unit = frontline[0][j]
        if (front_unit) {
          unit.state.morale_loss += front_unit.state.morale_loss
          unit[UnitAttribute.Morale] -= front_unit.state.morale_loss
        }
      }
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
      const unit = frontline[i][j]
      if (!unit)
        continue
      const target = unit.state.target
      if (!target)
        continue
      target.state.capture_chance = unit.definition[UnitAttribute.CaptureChance]
      calculateLosses(base_damages, unit, target, roll, dynamic_multiplier, i > 0, phase, settings)
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
  (settings[Setting.AttributeExperience] ? 1.0 + calculateExperienceReduction(settings, unit) : 0)
  * getValue(unit, UnitAttribute.DamageTaken, settings[Setting.AttributeDamage])
  / noZero(getValue(unit, UnitAttribute.Discipline, settings[Setting.DisciplineDamageReduction]))
  / noZero(getMultiplier(unit, UnitAttribute.MilitaryTactics, settings[Setting.AttributeMilitaryTactics]))
)

const calculateCohortDamageMultiplier = (source: CombatCohort, target: CombatCohort, is_support: boolean, settings: Settings) => {
  const definition_s = source.definition
  const definition_t = target.definition

  return source[UnitAttribute.Strength]
    * (settings[Setting.AttributeOffenseDefense] ? 1.0 + definition_s[UnitAttribute.Offense] - definition_t[UnitAttribute.Defense] : 1.0)
    * (is_support ? definition_s[UnitAttribute.BackrowEffectiveness] : 1.0)
}

const calculateDynamicBaseDamage = (roll: number, source: CombatCohort, target: CombatCohort, type: UnitAttribute.Morale | UnitAttribute.Strength, phase?: CombatPhase) => Math.max(0, roll + calculateUnitPips(source.definition, target.definition, type, phase))

/**
 * Calculates both strength and morale losses caused by a given source to a given target.
 */
const calculateLosses = (base_damages: number[], source: CombatCohort, target: CombatCohort, roll: number, dynamic_multiplier: number, is_support: boolean, phase: CombatPhase, settings: Settings) => {
  const strength_roll = calculateDynamicBaseDamage(roll, source, target, UnitAttribute.Strength, phase)
  const morale_roll = calculateDynamicBaseDamage(roll, source, target, UnitAttribute.Morale)
  dynamic_multiplier *= calculateCohortDamageMultiplier(source, target, is_support, settings)
  const strength_lost = base_damages[strength_roll] * dynamic_multiplier * source.calculated.damage[UnitAttribute.Strength][target.definition.type][phase] * target.calculated.strength_taken_multiplier[phase]
  const morale_lost = base_damages[morale_roll] * dynamic_multiplier * source.calculated.damage[UnitAttribute.Morale][target.definition.type][phase] * source[UnitAttribute.Morale] * target.calculated.morale_taken_multiplier

  source.state.damage_multiplier = dynamic_multiplier * source.calculated.damage['Damage'][target.definition.type][phase] * target.calculated.damage_taken_multiplier / PRECISION
  source.state.morale_dealt = Math.floor(morale_lost) / PRECISION
  source.state.strength_dealt = Math.floor(strength_lost) / PRECISION
  source.state.total_morale_dealt += source.state.morale_dealt
  source.state.total_strength_dealt += source.state.strength_dealt
  target.state.morale_loss += source.state.morale_dealt
  target.state.strength_loss += source.state.strength_dealt
}
