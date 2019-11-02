
import { sumBy } from 'lodash'

import { UnitCalc, UnitType, Unit } from '../store/units'
import { TerrainDefinition } from '../store/terrains'
import { TacticDefinition } from '../store/tactics'
import { CombatParameter, CombatSettings } from '../store/settings'

import { mapRange } from '../utils'
import { calculateValue } from '../base_definition'
import { calculateExperienceReduction } from './combat'

/**
 * Information required for fast combat calculation.
 * CombatUnits contain most of the information precalculated.
 */
export interface CombatParticipant {
  army: CombatUnits
  readonly tactic: TacticDefinition
  roll: number
}
export type Frontline = (CombatUnit | null)[]
export type Reserve = CombatUnit[]

export type CombatUnits = {
  readonly frontline: (CombatUnit | null)[]
  readonly reserve: CombatUnit[]
  readonly defeated: CombatUnit[]
}

const properties = [UnitCalc.DamageTaken, UnitCalc.DamageDone, UnitCalc.MoraleDamageTaken, UnitCalc.MoraleDamageDone, UnitCalc.StrengthDamageTaken, UnitCalc.StrengthDamageDone]

/**
 * Returns a precalculated info about a given unit.
 */
const getUnitInfo = (combatSettings: CombatSettings, casualties_multiplier: number, base_damages: number[], terrains: TerrainDefinition[], unit_types: UnitType[], unit: Unit): UnitInfo => {
  const info = {
    type: unit.type,
    is_loyal: !!unit.is_loyal,
    experience: 1.0 + calculateExperienceReduction(combatSettings, unit),
    [UnitCalc.Maneuver]: calculateValue(unit, UnitCalc.Maneuver),
    [UnitCalc.Offense]: calculateValue(unit, UnitCalc.Offense),
    [UnitCalc.Defense]: calculateValue(unit, UnitCalc.Defense)
  } as UnitInfo
  properties.forEach(calc => { info[calc] = 1.0 + calculateValue(unit, calc) })
  info[UnitCalc.StrengthDamageDone] *= combatSettings[CombatParameter.StrengthLostMultiplier] * (1.0 + casualties_multiplier)
  info[UnitCalc.MoraleDamageDone] *= combatSettings[CombatParameter.MoraleLostMultiplier] / combatSettings[CombatParameter.MoraleDamageBase]
  unit_types.forEach(calc => { info[calc] = 1.0 + calculateValue(unit, calc) })
  info.total = mapRange(base_damages.length, roll => precalculateDamage(base_damages[roll], terrains, unit))
  return info
}

/**
 * Transforms a unit to a combat unit.
 */
export const getCombatUnit = (combatSettings: CombatSettings, casualties_multiplier: number, base_damages: number[], terrains: TerrainDefinition[], unit_types: UnitType[], unit: Unit | null): CombatUnit | null => {
  if (!unit)
    return null
  const combat_unit = {
    [UnitCalc.Morale]: calculateValue(unit, UnitCalc.Morale),
    [UnitCalc.Strength]: calculateValue(unit, UnitCalc.Strength),
    info: getUnitInfo(combatSettings, casualties_multiplier, base_damages, terrains, unit_types, unit),
    state: { target: null, morale_loss: 0, strength_loss: 0 }
  }
  return combat_unit
}

type UnitCalcs = { [key in (UnitType | UnitCalc)]: number }

/**
 * Static part of a unit. Properties which don't change during the battle.
 */
export interface UnitInfo extends UnitCalcs {
  type: UnitType
  is_loyal: boolean
  total: number[] // Total damage for each dice roll.
  experience: number
  [UnitCalc.DamageTaken]: number
  [UnitCalc.DamageDone]: number
  [UnitCalc.MoraleDamageTaken]: number
  [UnitCalc.MoraleDamageDone]: number
  [UnitCalc.StrengthDamageTaken]: number
  [UnitCalc.StrengthDamageDone]: number
  [UnitCalc.Offense]: number
  [UnitCalc.Defense]: number
  [UnitCalc.Maneuver]: number
}

/**
 * Round specific state for a unit.
 */
export interface RoundInfo {
  target: CombatUnit | null
  morale_loss: number
  strength_loss: number
}

/**
 * Interface designed for fast combat calculations. This data is cached in simulations (keep lightweight).
 */
export interface CombatUnit {
  [UnitCalc.Morale]: number
  [UnitCalc.Strength]: number
  info: UnitInfo
  state: RoundInfo
}

/**
 * Makes given armies attach each other.
 */
export const doBattleFast = (a: CombatParticipant, d: CombatParticipant, settings: CombatSettings) => {
  pickTargets(a.army.frontline, d.army.frontline, settings)
  pickTargets(d.army.frontline, a.army.frontline, settings)

  // Tactic bonus changes dynamically when units lose strength so it can't be precalculated.
  // If this is a problem a fast mode can be implemeted where to bonus is only calculated once.
  attack(a.army.frontline, a.roll, 1 + calculateTactic(a.army, a.tactic, d.tactic), settings)
  attack(d.army.frontline, d.roll, 1 + calculateTactic(d.army, d.tactic, a.tactic), settings)

  applyLosses(a.army.frontline)
  applyLosses(d.army.frontline)
  const minimum_morale = settings[CombatParameter.MinimumMorale]
  const minimum_strength = settings[CombatParameter.MinimumStrength]
  moveDefeated(a.army.frontline, a.army.defeated, minimum_morale, minimum_strength)
  moveDefeated(d.army.frontline, d.army.defeated, minimum_morale, minimum_strength)
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
    const info = unit.info
    state.morale_loss = 0
    state.strength_loss = 0
    state.target = null
    if (target[i])
      state.target = target[i]
    else {
      const maneuver = info[UnitCalc.Maneuver]
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
const calculateTactic = (army: CombatUnits, tactic: TacticDefinition, counter_tactic: TacticDefinition): number => {
  const effectiveness = calculateValue(tactic, counter_tactic.type)
  let unit_modifier = 1.0
  if (effectiveness > 0 && tactic && army) {
    let units = 0
    let weight = 0.0
    for (const unit of army.frontline.concat(army.reserve).concat(army.defeated)) {
      if (!unit)
        continue
      units += unit[UnitCalc.Strength]
      weight += calculateValue(tactic, unit.info.type) * unit[UnitCalc.Strength]
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
const moveDefeated = (frontline: Frontline, defeated: Reserve, minimum_morale: number, minimum_strength: number) => {
  for (let i = 0; i < frontline.length; i++) {
    const unit = frontline[i]
    if (!unit)
      continue
    if (unit[UnitCalc.Strength] > minimum_strength && unit[UnitCalc.Morale] > minimum_morale)
      continue
    defeated.push(unit)
    frontline[i] = null
  }
}

/**
 * Calculates losses when units attack their targets.
 */
const attack = (frontline: Frontline, roll: number, tactic_damage_multiplier: number, settings: CombatSettings) => {
  for (let i = 0; i < frontline.length; i++) {
    const unit = frontline[i]
    if (!unit)
      continue
    const target = unit.state.target
    if (!target)
      continue
    calculateLosses(unit, target, roll, tactic_damage_multiplier, settings)
  }
}

const PRECISION = 100000.0

const precalculateDamage = (base_damage: number, terrains: TerrainDefinition[], source: Unit) => (
  PRECISION * base_damage
  * (1.0 + calculateValue(source, UnitCalc.Discipline))
  * (1.0 + calculateValue(source, UnitCalc.DamageDone))
  * (1.0 + sumBy(terrains, terrain => calculateValue(source, terrain.type)))
  * (source.is_loyal ? 1.1 : 1.0)
)

const calculateTotalDamage = (source: CombatUnit, target: CombatUnit, dice_roll: number, tactic_damage_multiplier: number, settings: CombatSettings) => {
  const info_s = source.info
  const info_t = target.info
  let damage = info_s.total[dice_roll] * info_s[info_t.type] * tactic_damage_multiplier * source[UnitCalc.Strength] * info_t.experience
    * (1.0 + info_s[UnitCalc.Offense] - info_t[UnitCalc.Defense])
  if (settings[CombatParameter.FixDamageTaken])
    damage *= info_t[UnitCalc.DamageTaken]
  else
    damage *= info_s[UnitCalc.DamageDone]
  return damage
}

/**
 * Calculates both strength and morale losses caused by a given source to a given target.
 */
const calculateLosses = (source: CombatUnit, target: CombatUnit, dice_roll: number, tactic_damage_multiplier: number, settings: CombatSettings) => {
  const total_damage = calculateTotalDamage(source, target, dice_roll, tactic_damage_multiplier, settings)
  const strength_lost = total_damage * source.info[UnitCalc.StrengthDamageDone] * target.info[UnitCalc.StrengthDamageTaken]
  const morale_lost = total_damage * source[UnitCalc.Morale] * source.info[UnitCalc.MoraleDamageDone] * target.info[UnitCalc.MoraleDamageTaken]

  target.state.morale_loss += Math.floor(morale_lost) / PRECISION
  target.state.strength_loss += Math.floor(strength_lost) / PRECISION
}
