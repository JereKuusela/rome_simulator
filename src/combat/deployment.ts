import { CombatUnit, CombatUnits, Reserve, CombatParticipant } from './combat'
import { UnitPreferences, UnitCalc, UnitPreferenceType, UnitDeployment, CombatSettings, Setting } from 'types'
import { nextIndex } from './reinforcement'
import { sortBy, remove, clamp } from 'lodash'

export type SortedReserve = {
  front: CombatUnit[]
  flank: CombatUnit[]
  support: CombatUnit[]
  length: number
}

const armySize = (units: CombatUnits) => {
  return units.frontline.filter(unit => unit).length + units.reserve.length
}

const deployArmy = (units: CombatUnits, left_flank: number, right_flank: number, sorted: SortedReserve) => {
  const frontline = units.frontline[0]
  const backline = units.frontline.length > 1 ? units.frontline[1] : null
  const reserve = units.reserve
  const center = Math.floor(frontline.length / 2.0)

  let index = center
  // Fill back row.
  if (backline) {
    const max_support = Math.floor(Math.min(frontline.length, reserve.length / 2))
    for (let i = 0; i < max_support; i++, index = nextIndex(index, center)) {
      if (backline[index])
        continue
      const support = sorted.support.shift()
      if (support) {
        backline[index] = support
        continue
      }
      break
    }
  }
  index = center
  // Fill main front until flanks are reached.
  for (; index >= left_flank && index + right_flank < frontline.length; index = nextIndex(index, center)) {
    if (frontline[index])
      continue
    const main = sorted.front.shift()
    if (main) {
      frontline[index] = main
      continue
    }
    const flank = sorted.flank.shift()
    if (flank) {
      frontline[index] = flank
      continue
    }
    const support = sorted.support.shift()
    if (support) {
      frontline[index] = support
      continue
    }
    break
  }
  // Fill flanks with remaining units.
  for (; index >= 0 && index < frontline.length; index = nextIndex(index, center)) {
    if (frontline[index])
      continue
    const flank = sorted.flank.shift()
    if (flank) {
      frontline[index] = flank
      continue
    }
    const main = sorted.front.shift()
    if (main) {
      frontline[index] = main
      continue
    }
    const support = sorted.support.shift()
    if (support) {
      frontline[index] = support
      continue
    }
    break
  }
  reserve.splice(0, reserve.length, ...(sorted.support.concat(sorted.flank).concat(sorted.front)))

}


export const sortReserve = (reserve: Reserve, unit_preferences: UnitPreferences): SortedReserve => {
  const frontReserve = reserve.filter(value => isFrontUnit(unit_preferences, value))
  const flankReserve = reserve.filter(value => isFlankUnit(unit_preferences, value))
  const supportReserve = reserve.filter(value => isSupportUnit(unit_preferences, value))
  // Calculate priorities (mostly based on unit type, ties are resolved with index numbers).
  const front = sortBy(frontReserve, value => {
    return -value.definition.deployment_cost * 100000 - value[UnitCalc.Strength] * 1000 - (value.definition.type === unit_preferences[UnitPreferenceType.Primary] ? 200000000 : 0) - (value.definition.type === unit_preferences[UnitPreferenceType.Secondary] ? -100000000 : 0)
  })
  const flank = sortBy(flankReserve, value => {
    return -value.definition[UnitCalc.Maneuver] * 100000 - value[UnitCalc.Strength] * 1000 - (value.definition.type === unit_preferences[UnitPreferenceType.Flank] ? 100000000 : 0)
  })
  const support = sortBy(supportReserve, value => {
    return -value[UnitCalc.Strength] * 1000
  })
  return { front, flank, support, length: front.length + flank.length + support.length }
}

const isFrontUnit = (preferences: UnitPreferences, unit: CombatUnit) => {
  if (unit.definition.type === preferences[UnitPreferenceType.Flank])
    return false
  if (unit.definition.type === preferences[UnitPreferenceType.Primary] || unit.definition.type === preferences[UnitPreferenceType.Secondary])
    return true
  return unit.definition.deployment === UnitDeployment.Front
}

const isFlankUnit = (preferences: UnitPreferences, unit: CombatUnit) => {
  if (unit.definition.type === preferences[UnitPreferenceType.Flank])
    return true
  if (unit.definition.type === preferences[UnitPreferenceType.Primary] || unit.definition.type === preferences[UnitPreferenceType.Secondary])
    return false
  return unit.definition.deployment === UnitDeployment.Flank
}

const isSupportUnit = (preferences: UnitPreferences, unit: CombatUnit) => {
  if (unit.definition.type === preferences[UnitPreferenceType.Flank])
    return false
  if (unit.definition.type === preferences[UnitPreferenceType.Primary] || unit.definition.type === preferences[UnitPreferenceType.Secondary])
    return false
  return unit.definition.deployment === UnitDeployment.Support
}

const isAlive = (unit: CombatUnit, minimum_morale: number, minimum_strength: number) => (
  unit[UnitCalc.Morale] > minimum_morale && unit[UnitCalc.Strength] > minimum_strength
)

const removeDefeated = (units: CombatUnits, minimum_morale: number, minimum_strength: number) => {
  const frontline = units.frontline
  const reserve = units.reserve
  const defeated = units.defeated

  for (let i = 0; i < frontline.length; i++) {
    for (let j = 0; j < frontline[i].length; j++) {
      const unit = frontline[i][j]
      if (!unit)
        continue
      if (isAlive(unit, minimum_morale, minimum_strength))
        continue
      defeated.push(unit)
      frontline[i][j] = null
    }
  }
  for (let i = 0; i < reserve.length; i++) {
    const unit = reserve[i]
    if (!unit)
      continue
    if (isAlive(unit, minimum_morale, minimum_strength))
      continue
    defeated.push(unit)
    remove(reserve, value => value === unit)
  }
}

/**
 * Calculates the left and right flank size.
 * @param combat_width Size of the battlefield.
 * @param preferred_flank_size Maximum amount of flanking units per side.
 * @param reserve Sorted reserve to get amount of flanking units.
 * @param enemy_units Enemy units to calculate space on the battlefield.
 */
const calculateFlankSizes = (combat_width: number, preferred_flank_size: number, reserve: SortedReserve, enemy_units: CombatUnits): [number, number] => {
  const space_needed_for_flanking_units = Math.ceil(reserve.flank.length / 2.0)
  const target_flank_size = Math.min(space_needed_for_flanking_units, preferred_flank_size)

  const free_space = combat_width - armySize(enemy_units)
  const left_side_free_space = Math.ceil(free_space / 2.0)
  const right_side_free_space = Math.floor(free_space / 2.0)
  // Max space checks needed for low combat widths.
  const left_side_max_space = Math.ceil(combat_width / 2.0)
  const right_side_max_space = Math.floor(combat_width / 2.0)
  const left_flank_size = clamp(target_flank_size, left_side_free_space, left_side_max_space)
  const right_flank_size = clamp(target_flank_size, right_side_free_space, right_side_max_space)
  return [left_flank_size, right_flank_size]
}

export const deploy = (attacker: CombatParticipant, defender: CombatParticipant, settings: CombatSettings) => {
  removeDefeated(attacker.army, settings[Setting.MinimumMorale], settings[Setting.MinimumStrength])
  removeDefeated(defender.army, settings[Setting.MinimumMorale], settings[Setting.MinimumStrength])

  const sorted_a = sortReserve(attacker.army.reserve, attacker.unit_preferences)
  const sorted_d = sortReserve(defender.army.reserve, defender.unit_preferences)

  const [left_flank_a, right_flank_a] = calculateFlankSizes(settings[Setting.CombatWidth], attacker.flank, sorted_a, defender.army)
  const [left_flank_d, right_flank_d] = calculateFlankSizes(settings[Setting.CombatWidth], defender.flank, sorted_d, attacker.army)

  deployArmy(attacker.army, left_flank_a, right_flank_a, sorted_a)
  deployArmy(defender.army, left_flank_d, right_flank_d, sorted_d)
}