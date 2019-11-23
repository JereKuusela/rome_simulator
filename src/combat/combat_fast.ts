
import { sumBy } from 'lodash'

import { UnitCalc, UnitType, Unit } from '../store/units'
import { TerrainDefinition, TerrainType } from '../store/terrains'
import { TacticDefinition } from '../store/tactics'
import { CombatParameter, CombatSettings } from '../store/settings'

import { mapRange, values, toObj } from '../utils'
import { calculateValue, calculateBase, calculateValueWithoutLoss } from '../base_definition'
import { calculateExperienceReduction } from './combat'
import { reinforce } from './reinforcement_fast'
import { RowTypes } from '../store/battle'

/**
 * Information required for fast combat calculation.
 * CombatUnits contain most of the information precalculated.
 */
export interface CombatParticipant {
  army: CombatUnits
  tactic: TacticDefinition
  flank: number
  roll: number
  row_types: RowTypes
}
export type Frontline = (CombatUnit | null)[]
export type Reserve = CombatUnit[]

export type CombatUnits = {
  readonly frontline: (CombatUnit | null)[]
  readonly reserve: CombatUnit[]
  readonly defeated: CombatUnit[]
  tactic_bonus: number
}

/**
 * Returns a precalculated info about a given unit.
 */
const precalculateUnit = (settings: CombatSettings, casualties_multiplier: number, base_damages: number[], terrains: TerrainDefinition[], unit_types: UnitType[], unit: Unit) => {
  const damage_reduction = precalculateDamageReduction(unit, settings)
  const total_damage = mapRange(base_damages.length, roll => precalculateDamage(base_damages[roll], terrains, unit, settings))
  const info: CombatUnitPreCalculated = {
    total_damage: toObj(unit_types, type => type, type => total_damage.map(damage => damage * (1.0 + calculateValue(unit, type)))),
    morale_done_multiplier: (1.0 + calculateValue(unit, UnitCalc.MoraleDamageDone)) * settings[CombatParameter.MoraleLostMultiplier] / settings[CombatParameter.MoraleDamageBase],
    strength_done_multiplier: (1.0 + calculateValue(unit, UnitCalc.StrengthDamageDone)) * settings[CombatParameter.StrengthLostMultiplier] * (1.0 + casualties_multiplier),
    morale_taken_multiplier: damage_reduction * (1.0 + calculateValue(unit, UnitCalc.MoraleDamageTaken)),
    strength_taken_multiplier: damage_reduction * (1.0 + calculateValue(unit, UnitCalc.StrengthDamageTaken))
  }
  return info
}

const getUnitDefinition = (combatSettings: CombatSettings, terrains: TerrainDefinition[], unit_types: UnitType[], unit: Unit): CombatUnitDefinition => {
  const info = {
    id: unit.id,
    type: unit.type,
    is_loyal: !!unit.is_loyal,
    image: unit.image,
    is_flank: unit.is_flank,
    max_morale: calculateValueWithoutLoss(unit, UnitCalc.Morale),
    max_strength: calculateValueWithoutLoss(unit, UnitCalc.Strength),
    experience_reduction: calculateExperienceReduction(combatSettings, unit),
    // Unmodified value is used to determine deployment order.
    deployment_cost: calculateBase(unit, UnitCalc.Cost)
  } as CombatUnitDefinition
  values(UnitCalc).forEach(calc => { info[calc] = calculateValue(unit, calc) })
  terrains.forEach(({ type }) => { info[type] = calculateValue(unit, type) })
  unit_types.forEach(calc => { info[calc] = calculateValue(unit, calc) })
  return info
}

/**
 * Transforms a unit to a combat unit.
 */
export const getCombatUnit = (combatSettings: CombatSettings, casualties_multiplier: number, base_damages: number[], terrains: TerrainDefinition[], unit_types: UnitType[], unit: Unit | null): CombatUnit | null => {
  if (!unit)
    return null
  const combat_unit: CombatUnit = {
    [UnitCalc.Morale]: calculateValue(unit, UnitCalc.Morale),
    [UnitCalc.Strength]: calculateValue(unit, UnitCalc.Strength),
    calculated: precalculateUnit(combatSettings, casualties_multiplier, base_damages, terrains, unit_types, unit),
    state: { target: null, morale_loss: 0, strength_loss: 0, morale_dealt: 0, strength_dealt: 0, damage_dealt: 0, is_defeated: false, total_morale_dealt: 0, total_strength_dealt: 0 },
    definition: getUnitDefinition(combatSettings, terrains, unit_types, unit)
  }
  return combat_unit
}

type UnitCalcs = { [key in (UnitType | UnitCalc | TerrainType)]: number }

/**
 * Static part of a unit. Properties which don't change during the battle.
 */
export interface CombatUnitPreCalculated {
  total_damage: { [key in UnitType]: number[] }  // Total damage for each unit and dice roll.
  morale_done_multiplier: number
  strength_done_multiplier: number
  morale_taken_multiplier: number
  strength_taken_multiplier: number
}

export interface CombatUnitDefinition extends UnitCalcs {
  id: number
  image: string
  type: UnitType
  is_loyal: boolean
  experience: number
  is_flank: boolean
  max_strength: number
  max_morale: number
  experience_reduction: number
  deployment_cost: number
}

/**
 * Round specific state for a unit.
 */
export interface RoundInfo {
  target: CombatUnit | null
  morale_loss: number
  strength_loss: number
  morale_dealt: number
  strength_dealt: number
  damage_dealt: number
  is_defeated: boolean
  total_morale_dealt: number
  total_strength_dealt: number
}

/**
 * Interface designed for fast combat calculations. This data is cached in simulations (keep lightweight).
 */
export interface CombatUnit {
  [UnitCalc.Morale]: number
  [UnitCalc.Strength]: number
  calculated: CombatUnitPreCalculated
  state: RoundInfo
  definition: CombatUnitDefinition
}

/**
 * Makes given armies attach each other.
 */
export const doBattleFast = (a: CombatParticipant, d: CombatParticipant, mark_defeated: boolean, settings: CombatSettings) => {
  if (mark_defeated) {
    removeDefeated(a.army.frontline)
    removeDefeated(d.army.frontline)
  }
  reinforce(a.army.frontline, a.army.reserve)
  if (settings[CombatParameter.ReinforceFirst])
    reinforce(d.army.frontline, d.army.reserve)
  pickTargets(a.army.frontline, d.army.frontline, settings)
  if (!settings[CombatParameter.ReinforceFirst])
    reinforce(d.army.frontline, d.army.reserve)
  pickTargets(d.army.frontline, a.army.frontline, settings)

  // Tactic bonus changes dynamically when units lose strength so it can't be precalculated.
  // If this is a problem a fast mode can be implemeted where to bonus is only calculated once.
  a.army.tactic_bonus = calculateTactic(a.army, a.tactic, d.tactic)
  d.army.tactic_bonus = calculateTactic(d.army, d.tactic, a.tactic)
  attack(a.army.frontline, a.roll, 1 + a.army.tactic_bonus)
  attack(d.army.frontline, d.roll, 1 + d.army.tactic_bonus)

  applyLosses(a.army.frontline)
  applyLosses(d.army.frontline)
  const minimum_morale = settings[CombatParameter.MinimumMorale]
  const minimum_strength = settings[CombatParameter.MinimumStrength]
  moveDefeated(a.army.frontline, a.army.defeated, minimum_morale, minimum_strength, mark_defeated)
  moveDefeated(d.army.frontline, d.army.defeated, minimum_morale, minimum_strength, mark_defeated)
}

/**
 * Selects targets for units.
 */
const pickTargets = (source: Frontline, target: Frontline, settings: CombatSettings) => {
  for (let i = 0; i < source.length; i++) {
    const unit = source[i]
    if (!unit)
      continue
    const state = unit.state
    state.damage_dealt = 0
    state.morale_dealt = 0
    state.strength_dealt = 0
    state.morale_loss = 0
    state.strength_loss = 0
    state.target = null
    if (target[i])
      state.target = target[i]
    else {
      const maneuver = unit.definition[UnitCalc.Maneuver]
      if (settings[CombatParameter.FixTargeting] ? i < source.length / 2 : i <= source.length / 2) {
        for (let index = i - maneuver; index <= i + maneuver; ++index) {
          if (index >= 0 && index < source.length && target[index]) {
            state.target = target[index]
            break
          }
        }
      }
      else {
        for (let index = i + maneuver; index >= i - maneuver; --index) {
          if (index >= 0 && index < source.length && target[index]) {
            state.target = target[index]
            break
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
export const calculateTactic = (army: CombatUnits, tactic: TacticDefinition, counter_tactic: TacticDefinition): number => {
  const effectiveness = calculateValue(tactic, counter_tactic.type)
  let unit_modifier = 1.0
  if (effectiveness > 0 && tactic && army) {
    let units = 0
    let weight = 0.0
    for (const unit of army.frontline.concat(army.reserve).concat(army.defeated)) {
      if (!unit)
        continue
      units += unit[UnitCalc.Strength]
      weight += calculateValue(tactic, unit.definition.type) * unit[UnitCalc.Strength]
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
    const unit = frontline[i]
    if (!unit)
      continue
    unit[UnitCalc.Morale] -= unit.state.morale_loss
    unit[UnitCalc.Strength] -= unit.state.strength_loss
  }
}

/**
 * Moves defeated units from a frontline to defeated.
 */
const moveDefeated = (frontline: Frontline, defeated: Reserve, minimum_morale: number, minimum_strength: number, mark_defeated: boolean) => {
  for (let i = 0; i < frontline.length; i++) {
    const unit = frontline[i]
    if (!unit)
      continue
    if (unit[UnitCalc.Strength] > minimum_strength && unit[UnitCalc.Morale] > minimum_morale)
      continue
    if (mark_defeated)
      frontline[i] = { ...unit, state: { ...unit.state, is_defeated: true } }
    else
      frontline[i] = null
    unit.state.target = null
    defeated.push(unit)
  }
}

/**
 * Removes temporary defeated units from frontline.
 */
const removeDefeated = (frontline: Frontline) => {
  for (let i = 0; i < frontline.length; i++) {
    const unit = frontline[i]
    if (!unit)
      continue
    if (unit.state.is_defeated)
      frontline[i] = null
  }
}

/**
 * Calculates losses when units attack their targets.
 */
const attack = (frontline: Frontline, roll: number, tactic_damage_multiplier: number) => {
  for (let i = 0; i < frontline.length; i++) {
    const unit = frontline[i]
    if (!unit)
      continue
    const target = unit.state.target
    if (!target)
      continue
    calculateLosses(unit, target, roll, tactic_damage_multiplier)
  }
}

const PRECISION = 100000.0

const precalculateDamage = (base_damage: number, terrains: TerrainDefinition[], unit: Unit, settings: CombatSettings) => (
  PRECISION * base_damage
  * (1.0 + calculateValue(unit, UnitCalc.Discipline))
  * (1.0 + calculateValue(unit, UnitCalc.DamageDone))
  * (settings[CombatParameter.FixDamageTaken] ? 1.0 : 1.0 + calculateValue(unit, UnitCalc.DamageDone))
  * (1.0 + sumBy(terrains, terrain => calculateValue(unit, terrain.type)))
  * (unit.is_loyal ? 1.1 : 1.0)
)

const precalculateDamageReduction = (unit: Unit, settings: CombatSettings) => (
  (1.0 + calculateExperienceReduction(settings, unit))
  * (settings[CombatParameter.FixDamageTaken] ? 1.0 + calculateValue(unit, UnitCalc.DamageTaken) : 1.0)
)

const calculateDamageMultiplier = (source: CombatUnit, target: CombatUnit, tactic_damage_multiplier: number) => {
  const info_s = source.definition
  const info_t = target.definition
  let damage = tactic_damage_multiplier * source[UnitCalc.Strength]
    * (1.0 + info_s[UnitCalc.Offense] - info_t[UnitCalc.Defense])
  return damage
}

/**
 * Calculates both strength and morale losses caused by a given source to a given target.
 */
const calculateLosses = (source: CombatUnit, target: CombatUnit, dice_roll: number, tactic_damage_multiplier: number) => {
  const total_damage = source.calculated.total_damage[target.definition.type][dice_roll] * calculateDamageMultiplier(source, target, tactic_damage_multiplier)
  const strength_lost = total_damage * source.calculated.strength_done_multiplier * target.calculated.strength_taken_multiplier
  const morale_lost = total_damage * source[UnitCalc.Morale] * source.calculated.morale_done_multiplier * target.calculated.morale_taken_multiplier

  source.state.damage_dealt = Math.floor(total_damage) / PRECISION
  source.state.morale_dealt = Math.floor(morale_lost) / PRECISION
  source.state.strength_dealt = Math.floor(strength_lost) / PRECISION
  source.state.total_morale_dealt += source.state.morale_dealt
  source.state.total_strength_dealt += source.state.strength_dealt
  target.state.morale_loss += source.state.morale_dealt
  target.state.strength_loss += source.state.strength_dealt
}
