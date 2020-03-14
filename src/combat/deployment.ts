import { CombatCohort, CombatCohorts, Reserve, CombatParticipant } from './combat'
import { UnitPreferences, UnitAttribute, UnitPreferenceType, UnitRole, Setting, Settings } from 'types'
import { sortBy, remove, clamp } from 'lodash'

/**
 * Calculates the next index when the order is from center to edges.
 */
export const nextIndex = (index: number, center: number) => index < center ? index + 2 * (center - index) : index - 2 * (index - center) - 1

export type SortedReserve = {
  front: CombatCohort[]
  flank: CombatCohort[]
  support: CombatCohort[]
}

export const reserveSize = (reserve: SortedReserve) => reserve.front.length + reserve.flank.length + reserve.support.length

const armySize = (units: CombatCohorts) => {
  return units.frontline[0].filter(unit => unit).length + reserveSize(units.reserve)
}

const deployCohorts = (cohorts: CombatCohorts) => {
  const { left_flank, right_flank, reserve} = cohorts
  const frontline = cohorts.frontline[0]
  const backline = cohorts.frontline.length > 1 ? cohorts.frontline[1] : null
  const center = Math.floor(frontline.length / 2.0)

  let index = center
  // Fill back row.
  if (backline) {
    const max_support = Math.floor(Math.min(frontline.length, reserveSize(reserve) / 2))
    for (let i = 0; i < max_support; i++ , index = nextIndex(index, center)) {
      if (backline[index])
        continue
      const support = reserve.support.pop()
      if (support) {
        backline[index] = support
        continue
      }
      break
    }
  }
  const deploy_support = reserve.front.length === 0 && reserve.flank.length === 0
  index = center
  // Fill main front until flanks are reached.
  for (; index >= left_flank && index + right_flank < frontline.length; index = nextIndex(index, center)) {
    if (frontline[index])
      continue
    const main = reserve.front.pop()
    if (main) {
      frontline[index] = main
      continue
    }
    const flank = reserve.flank.pop()
    if (flank) {
      frontline[index] = flank
      continue
    }
    const support = deploy_support && reserve.support.pop()
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
    const flank = reserve.flank.pop()
    if (flank) {
      frontline[index] = flank
      continue
    }
    const main = reserve.front.pop()
    if (main) {
      frontline[index] = main
      continue
    }
    const support = deploy_support && reserve.support.pop()
    if (support) {
      frontline[index] = support
      continue
    }
    break
  }
}


export const sortReserve = (reserve: Reserve, unit_preferences: UnitPreferences): SortedReserve => {
  const frontReserve = reserve.filter(value => isFrontUnit(unit_preferences, value))
  const flankReserve = reserve.filter(value => isFlankUnit(unit_preferences, value))
  const supportReserve = reserve.filter(value => isSupportUnit(unit_preferences, value))
  // Calculate priorities (mostly based on unit type, ties are resolved with index numbers).
  const front = sortBy(frontReserve, value => {
    return value.definition.deployment_cost * 100000 + value[UnitAttribute.Strength] * 1000 + (value.definition.type === unit_preferences[UnitPreferenceType.Primary] ? 200000000 : 0) + (value.definition.type === unit_preferences[UnitPreferenceType.Secondary] ? 100000000 : 0)
  })
  const flank = sortBy(flankReserve, value => {
    return value.definition[UnitAttribute.Maneuver] * 100000 + value[UnitAttribute.Strength] * 1000 + (value.definition.type === unit_preferences[UnitPreferenceType.Flank] ? 100000000 : 0)
  })
  const support = sortBy(supportReserve, value => {
    return value[UnitAttribute.Strength] * 1000
  })
  return { front, flank, support }
}

const isFrontUnit = (preferences: UnitPreferences, unit: CombatCohort) => {
  if (unit.definition.type === preferences[UnitPreferenceType.Primary] || unit.definition.type === preferences[UnitPreferenceType.Secondary])
    return true
  if (unit.definition.type === preferences[UnitPreferenceType.Flank])
    return false
  return unit.definition.deployment === UnitRole.Front
}

const isFlankUnit = (preferences: UnitPreferences, unit: CombatCohort) => {
  if (unit.definition.type === preferences[UnitPreferenceType.Primary] || unit.definition.type === preferences[UnitPreferenceType.Secondary])
    return false
  if (unit.definition.type === preferences[UnitPreferenceType.Flank])
    return true
  return unit.definition.deployment === UnitRole.Flank
}

const isSupportUnit = (preferences: UnitPreferences, unit: CombatCohort) => {
  if (unit.definition.type === preferences[UnitPreferenceType.Primary] || unit.definition.type === preferences[UnitPreferenceType.Secondary])
    return false
  if (unit.definition.type === preferences[UnitPreferenceType.Flank])
    return false
  return unit.definition.deployment === UnitRole.Support
}

const isAlive = (unit: CombatCohort, minimum_morale: number, minimum_strength: number) => (
  unit[UnitAttribute.Morale] > minimum_morale && unit[UnitAttribute.Strength] > minimum_strength
)

const removeDefeated = (units: CombatCohorts, minimum_morale: number, minimum_strength: number) => {
  const frontline = units.frontline
  const reserve = units.reserve
  const defeated = units.defeated

  const removeFromReserve = (part: CombatCohort[]) => {
    for (let i = 0; i < part.length; i++) {
      const unit = part[i]
      if (!unit)
        continue
      if (isAlive(unit, minimum_morale, minimum_strength))
        continue
      defeated.push(unit)
      remove(part, value => value === unit)
    }
  }
  
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
  removeFromReserve(reserve.front)
  removeFromReserve(reserve.flank)
  removeFromReserve(reserve.support)
}

/**
 * Calculates the left and right flank size.
 * @param combat_width Size of the battlefield.
 * @param preferred_flank_size Maximum amount of flanking units per side.
 * @param reserve Sorted reserve to get amount of flanking units.
 * @param enemy_units Enemy units to calculate space on the battlefield.
 */
const calculateFlankSizes = (combat_width: number, preferred_flank_size: number, enemy_units: CombatCohorts): [number, number] => {
  const free_space = combat_width - armySize(enemy_units)
  const left_side_free_space = Math.ceil(free_space / 2.0)
  const right_side_free_space = Math.floor(free_space / 2.0)
  // Max space checks needed for low combat widths.
  const left_side_max_space = Math.ceil(combat_width / 2.0)
  const right_side_max_space = Math.floor(combat_width / 2.0)
  const left_flank_size = clamp(preferred_flank_size, left_side_free_space, left_side_max_space)
  const right_flank_size = clamp(preferred_flank_size, right_side_free_space, right_side_max_space)
  return [left_flank_size, right_flank_size]
}

export const deploy = (attacker: CombatParticipant, defender: CombatParticipant, settings: Settings) => {
  removeDefeated(attacker.cohorts, settings[Setting.MinimumMorale], settings[Setting.MinimumStrength])
  removeDefeated(defender.cohorts, settings[Setting.MinimumMorale], settings[Setting.MinimumStrength])

  const [left_flank_a, right_flank_a] = calculateFlankSizes(settings[Setting.CombatWidth], attacker.flank, defender.cohorts)
  const [left_flank_d, right_flank_d] = calculateFlankSizes(settings[Setting.CombatWidth], defender.flank, attacker.cohorts)
  attacker.cohorts.left_flank = left_flank_a
  attacker.cohorts.right_flank = right_flank_a
  defender.cohorts.left_flank = left_flank_d
  defender.cohorts.right_flank = right_flank_d
  deployCohorts(attacker.cohorts)
  deployCohorts(defender.cohorts)
}

const moveUnits = (cohorts: CombatCohorts) => {
  const frontline = cohorts.frontline
  for (let row = 0; row < frontline.length; row++) {
      const front = frontline[row]
      // Move units from left to center.
      for (let unit_index = Math.ceil(front.length / 2.0) - 1; unit_index > 0; --unit_index) {
          const unit = front[unit_index]
          if (unit)
              continue
          const unit_on_left = front[unit_index - 1]
          if (unit_on_left) {
              front[unit_index] = unit_on_left
              front[unit_index - 1] = null
              continue
          }
      }
      // Move units from right to center.
      for (let unit_index = Math.ceil(front.length / 2.0); unit_index < front.length - 1; ++unit_index) {
          const unit = front[unit_index]
          if (unit)
              continue
          const unit_on_right = front[unit_index + 1]
          if (unit_on_right) {
              front[unit_index] = unit_on_right
              front[unit_index + 1] = null
              continue
          }
      }
  }
}

/**
* Reinforces a given army based on reinforcement rules.
* First priority is to move units from reserve. Then units move towards center.
*/
export const reinforce = (participant: CombatParticipant) => {
  if (reserveSize(participant.cohorts.reserve))
      deployCohorts(participant.cohorts)
  moveUnits(participant.cohorts)
}
