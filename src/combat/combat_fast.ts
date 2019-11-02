
import { sumBy } from 'lodash'

import { UnitCalc, UnitType, Unit } from '../store/units'
import { TerrainDefinition } from '../store/terrains'
import { TacticDefinition, TacticType } from '../store/tactics'
import { CombatParameter, CombatSettings } from '../store/settings'

import { values, mapRange } from '../utils'
import { calculateValue } from '../base_definition'
import { calculateExperienceReduction } from './combat'

/**
 * Losses must be stored because they are applied after all units have attacked.
 */
interface Loss {
  morale: number
  strength: number
}

export interface Participant {
  d: DynamicUnits
  readonly s: StaticUnits
  readonly tactic: TacticDefinition
  roll: number
}
export type DynamicFrontline = (DynamicUnit | null)[]
export type DynamicReserve = DynamicUnit[]

export type StaticUnits = {
  [key: number]: StaticUnit
}

export type DynamicUnits = {
  readonly frontline: (DynamicUnit | null)[]
  readonly reserve: DynamicUnit[]
  readonly defeated: DynamicUnit[]
}

const unitTypes = values(UnitType)

const properties = [UnitCalc.DamageTaken, UnitCalc.DamageDone, UnitCalc.MoraleDamageTaken, UnitCalc.MoraleDamageDone, UnitCalc.StrengthDamageTaken, UnitCalc.StrengthDamageDone]

/**
 * Returns the static part of a unit, precalculating as much as possible.
 */
export const getStaticUnit = (combatSettings: CombatSettings, casualties_multiplier: number, base_damages: number[], terrains: TerrainDefinition[], unit: Unit | null): StaticUnit | null => {
  if (!unit)
    return null
  const staticUnit = {
    type: unit.type,
    is_loyal: !!unit.is_loyal,
    experience: 1.0 + calculateExperienceReduction(combatSettings, unit),
    [UnitCalc.Maneuver]: calculateValue(unit, UnitCalc.Maneuver),
    [UnitCalc.Offense]: calculateValue(unit, UnitCalc.Offense),
    [UnitCalc.Defense]: calculateValue(unit, UnitCalc.Defense)
  } as StaticUnit
  properties.forEach(calc => { staticUnit[calc] = 1.0 + calculateValue(unit, calc) })
  staticUnit[UnitCalc.StrengthDamageDone] *= combatSettings[CombatParameter.StrengthLostMultiplier] * (1.0 + casualties_multiplier)
  staticUnit[UnitCalc.MoraleDamageDone] *= combatSettings[CombatParameter.MoraleLostMultiplier] / combatSettings[CombatParameter.MoraleDamageBase]
  unitTypes.forEach(calc => { staticUnit[calc] = 1.0 + calculateValue(unit, calc) })
  staticUnit.total = mapRange(base_damages.length, roll => precalculateDamage(base_damages[roll], terrains, unit))
  return staticUnit
}

/**
 * Returns the dynamic part of a unit. Only return what must be stored between rounds.
 */
export const getDynamicUnit = (unit: Unit | null): DynamicUnit | null => {
  if (!unit)
    return null
  const dynamicUnit = {
    [UnitCalc.Morale]: calculateValue(unit, UnitCalc.Morale),
    [UnitCalc.Strength]: calculateValue(unit, UnitCalc.Strength),
    id: unit.id
  }
  return dynamicUnit
}

type UnitCalcs = { [key in (UnitType | UnitCalc)]: number }

/**
 * Static part of a unit. Properties which don't change during the battle.
 */
export interface StaticUnit extends UnitCalcs {
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
  target: number | null // This one is here for performance (temporary property).
  morale_loss: number // This one is here for performance (temporary property).
  strength_loss: number // This one is here for performance (temporary property).
}

/**
 * Dynamic part of a unit. Properties which change from round to round.
 */
export interface DynamicUnit {
  [UnitCalc.Morale]: number
  [UnitCalc.Strength]: number
  id: number
}

/**
 * Makes given armies attach each other.
 */
export const doBattleFast = (a: Participant, d: Participant, settings: CombatSettings) => {
  pickTargets(a.d.frontline, a.s, d.d.frontline, settings)
  pickTargets(d.d.frontline, d.s, a.d.frontline, settings)

  attack(a.d.frontline, a.s, d.s, a.roll, 1 + calculateTactic(a.d, a.s, a.tactic, d.tactic.type), settings)
  attack(d.d.frontline, d.s, a.s, d.roll, 1 + calculateTactic(d.d, d.s, d.tactic, a.tactic.type), settings)

  applyLosses(a.d.frontline, a.s)
  applyLosses(d.d.frontline, d.s)
  const minimum_morale = settings[CombatParameter.MinimumMorale]
  const minimum_strength = settings[CombatParameter.MinimumStrength]
  moveDefeated(a.d.frontline, a.d.defeated, minimum_morale, minimum_strength)
  moveDefeated(d.d.frontline, d.d.defeated, minimum_morale, minimum_strength)
}

/**
 * Selects targets for a given source_row from a given target_row.
 */
const pickTargets = (source_row: DynamicFrontline, units: StaticUnits, target_row: DynamicFrontline, settings: CombatSettings) => {
  // Units attack mainly units on front of them. If not then first target from left to right.
  for (let i = 0; i < source_row.length; i++) {
    const source_d = source_row[i]
    if (!source_d)
      continue
    const source_s = units[source_d.id]
    source_s.morale_loss = 0
    source_s.strength_loss = 0
    source_s.target = null
    if (target_row[i])
      source_s.target = target_row[i]!.id
    else {
      const maneuver = source_s[UnitCalc.Maneuver]
      if (settings[CombatParameter.FixTargeting] ? i < source_row.length / 2 : i <= source_row.length / 2) {
        for (let index = i - maneuver; index <= i + maneuver; ++index) {
          if (index >= 0 && index < source_row.length && target_row[index]) {
            source_s.target = target_row[index]!.id
            break
          }
        }
      }
      else {
        for (let index = i + maneuver; index >= i - maneuver; --index) {
          if (index >= 0 && index < source_row.length && target_row[index]) {
            source_s.target = target_row[index]!.id
            break
          }
        }
      }
    }
  }
}

/**
 * Calculates effectiveness of a tactic against another tactic with a given army.
 * @param frontline Units affecting the positive bonus.
 * @param tactic Tactic to calculate.
 * @param counter_tactic Opposing tactic, can counter or get countered.
 */
const calculateTactic = (army: DynamicUnits, army2: StaticUnits, tactic: TacticDefinition, counter_tactic: TacticType): number => {
  const effectiveness = (tactic && counter_tactic) ? calculateValue(tactic, counter_tactic) : tactic ? 1.0 : 0.0
  let unit_modifier = 1.0
  if (effectiveness > 0 && tactic && army) {
    let units = 0
    let weight = 0.0
    for (const unit of army.frontline.concat(army.reserve).concat(army.defeated)) {
      if (!unit)
        continue
      units += unit[UnitCalc.Strength]
      weight += calculateValue(tactic, army2[unit.id].type) * unit[UnitCalc.Strength]
    }
    if (units)
      unit_modifier = weight / units
  }

  return effectiveness * Math.min(1.0, unit_modifier)
}

/**
 * Adds losses to a frontline, causing damage to the units.
 * @param frontline Frontline.
 * @param losses Losses added to units. 
 */
const applyLosses = (status: DynamicFrontline, units: StaticUnits) => {
  for (let i = 0; i < status.length; i++) {
    const unit = status[i]
    if (!unit)
      continue
    unit[UnitCalc.Morale] -= units[unit.id].morale_loss
    unit[UnitCalc.Strength] -= units[unit.id].strength_loss
  }
}

/**
 * Moves defeated units from a frontline to defeated.
 */
const moveDefeated = (frontline: DynamicFrontline, defeated: DynamicReserve, minimum_morale: number, minimum_strength: number) => {
  for (let i = 0; i < frontline.length; i++) {
    const state = frontline[i]
    if (!state)
      continue
    if (state[UnitCalc.Strength] > minimum_strength && state[UnitCalc.Morale] > minimum_morale)
      continue
    defeated.push(state)
    frontline[i] = null
  }
}

/**
 * Calculates losses when a given source row attacks a given target row.
 */
const attack = (frontline: DynamicFrontline, units_source: StaticUnits, units_target: StaticUnits, roll: number, tactic_damage_multiplier: number, settings: CombatSettings) => {
  for (let i = 0; i < frontline.length; i++) {
    const source_d = frontline[i]
    if (!source_d)
      continue
    const source_s = units_source[source_d.id]
    if (!source_s)
      continue
    if (source_s.target === null)
      continue
    const target = units_target[source_s.target]
    const losses = calculateLosses(source_d, source_s, target, roll, tactic_damage_multiplier, settings)
    target.morale_loss += losses.morale
    target.strength_loss += losses.strength
  }
}

const precalculateDamage = (base_damage: number, terrains: TerrainDefinition[], source: Unit) => (
  100000.0 * base_damage
  * (1.0 + calculateValue(source, UnitCalc.Discipline))
  * (1.0 + calculateValue(source, UnitCalc.DamageDone))
  * (1.0 + sumBy(terrains, terrain => calculateValue(source, terrain.type)))
  * (source.is_loyal ? 1.1 : 1.0)
)

const calculateTotalDamage = (state: DynamicUnit, settings: CombatSettings, roll: number, source: StaticUnit, target: StaticUnit, tactic_damage_multiplier: number) => {
  let damage = source.total[roll] * source[target.type] * tactic_damage_multiplier * state[UnitCalc.Strength] * target.experience
    * (1.0 + source[UnitCalc.Offense] - target[UnitCalc.Defense])
  if (settings[CombatParameter.FixDamageTaken])
    damage *= target[UnitCalc.DamageTaken]
  else
    damage *= source[UnitCalc.DamageDone]
  return damage
}

/**
 * Calculates both strength and morale losses caused by a given attacker to a given defender.
 */
const calculateLosses = (dynamic_source: DynamicUnit, static_source: StaticUnit, static_target: StaticUnit, roll: number, tactic_damage_multiplier: number, settings: CombatSettings): Loss => {

  const total_damage = calculateTotalDamage(dynamic_source, settings, roll, static_source, static_target, tactic_damage_multiplier)
  const strength_lost = total_damage * static_source[UnitCalc.StrengthDamageDone] * static_target[UnitCalc.StrengthDamageTaken]
  const morale_lost = total_damage * dynamic_source[UnitCalc.Morale] * static_source[UnitCalc.MoraleDamageDone] * static_target[UnitCalc.MoraleDamageTaken]

  return { strength: Math.floor(strength_lost) / 100000.0, morale: Math.floor(morale_lost) / 100000.0 }
}
