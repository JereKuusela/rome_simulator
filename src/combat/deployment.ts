import { UnitPreferences, UnitAttribute, UnitPreferenceType, UnitRole, Setting, Settings, SortedReserve, CombatReserve, CombatCohorts, CombatCohort, CombatParticipant } from 'types'
import { sortBy, remove, clamp } from 'lodash'
import { stackWipe, calculateTotalStrength, nextIndex, reserveSize, armySize } from './combat_utils'

const armyFlankCount = (units: CombatCohorts) => {
  return units.frontline[0].filter(unit => unit && unit.definition.role === UnitRole.Flank).length
    + units.reserve.front.filter(unit => unit.definition.role === UnitRole.Flank).length
    + units.reserve.flank.filter(unit => unit.definition.role === UnitRole.Flank).length
    + units.reserve.support.filter(unit => unit.definition.role === UnitRole.Flank).length
}

const deployFront = (cohorts: CombatCohort[], row: (CombatCohort | null)[], center: number, flank: number, settings: Settings, preferences?: UnitPreferences) => {
  for (let index = center; index !== flank; index = nextIndex(index, center)) {
    if (row[index])
      continue
    const cohort = cohorts.pop()
    if (cohort) {
      if (preferences)
        applyReinforcementPenalty(cohort, preferences, settings)
      row[index] = cohort
    }
    else
      break
  }
}

const deployFlanks = (cohorts: CombatCohort[], row: (CombatCohort | null)[], center: number, flank: number, settings: Settings, preferences?: UnitPreferences) => {
  for (let index = flank; index >= 0 && index < row.length; index = nextIndex(index, center)) {
    if (row[index])
      continue
    const cohort = cohorts.pop()
    if (cohort) {
      if (preferences)
        applyReinforcementPenalty(cohort, preferences, settings)
      row[index] = cohort
    }
    else
      break
  }
}

const deployBoth = (cohorts: CombatCohort[], row: (CombatCohort | null)[], center: number, limit: number, settings: Settings, preferences?: UnitPreferences) => {
  for (let index = center, count = 0; index >= 0 && index < row.length && count < limit; index = nextIndex(index, center), count++) {
    if (row[index])
      continue
    const cohort = cohorts.pop()
    if (cohort) {
      if (preferences)
        applyReinforcementPenalty(cohort, preferences, settings)
      row[index] = cohort
    }
    else
      break
  }
}

const applyReinforcementPenalty = (cohort: CombatCohort, preferences: UnitPreferences, settings: Settings) => {
  if (cohort.definition.type !== preferences[UnitPreferenceType.Secondary])
    cohort[UnitAttribute.Morale] -= cohort.definition.max_morale * settings[Setting.MoraleHitForNonSecondaryReinforcement]
}

const deployCohorts = (cohorts: CombatCohorts, settings: Settings, preferences?: UnitPreferences) => {
  const { left_flank, right_flank, reserve } = cohorts
  const frontline = cohorts.frontline[0]
  const backline = cohorts.frontline.length > 1 ? cohorts.frontline[1] : null
  const center = Math.floor(frontline.length / 2.0)
  let flank_starting_index = left_flank > right_flank ? left_flank - 1 : frontline.length - right_flank
  if (frontline.length % 2)
    flank_starting_index = left_flank >= right_flank ? left_flank - 1 : frontline.length - right_flank
  const deploy_support = !settings[Setting.SupportPhase] || (reserve.front.length === 0 && reserve.flank.length === 0 && !frontline.some(cohort => cohort))
  const max_support_backline = Math.floor(reserveSize(reserve) / 2)
  if (backline)
    deployBoth(reserve.support, backline, center, max_support_backline, settings, preferences)

  deployFront(reserve.front, frontline, center, flank_starting_index, settings, preferences)
  deployFront(reserve.flank, frontline, center, flank_starting_index, settings, preferences)
  if (deploy_support)
    deployFront(reserve.support, frontline, center, flank_starting_index, settings, preferences)
  // Use front units as flank if necessary.
  deployFlanks(reserve.flank.length ? reserve.flank : reserve.front, frontline, center, flank_starting_index, settings, preferences)
  if (backline)
    deployFront(reserve.front, backline, center, flank_starting_index, settings, preferences)
  deployFlanks(reserve.flank, frontline, center, flank_starting_index, settings, preferences)
  deployFlanks(reserve.front, frontline, center, flank_starting_index, settings, preferences)
  if (deploy_support)
    deployFlanks(reserve.support, frontline, center, flank_starting_index, settings, preferences)
  if (backline)
    deployFlanks(reserve.flank, backline, center, flank_starting_index, settings, preferences)
}


export const sortReserve = (reserve: CombatReserve, unit_preferences: UnitPreferences): SortedReserve => {
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

const isFrontUnit = (preferences: UnitPreferences, cohort: CombatCohort) => {
  if (cohort.definition.type === preferences[UnitPreferenceType.Primary] || cohort.definition.type === preferences[UnitPreferenceType.Secondary])
    return true
  if (cohort.definition.type === preferences[UnitPreferenceType.Flank])
    return false
  return cohort.definition.role === UnitRole.Front
}

const isFlankUnit = (preferences: UnitPreferences, cohort: CombatCohort) => {
  if (cohort.definition.type === preferences[UnitPreferenceType.Primary] || cohort.definition.type === preferences[UnitPreferenceType.Secondary])
    return false
  if (cohort.definition.type === preferences[UnitPreferenceType.Flank])
    return true
  return cohort.definition.role === UnitRole.Flank
}

const isSupportUnit = (preferences: UnitPreferences, cohort: CombatCohort) => {
  if (cohort.definition.type === preferences[UnitPreferenceType.Primary] || cohort.definition.type === preferences[UnitPreferenceType.Secondary])
    return false
  if (cohort.definition.type === preferences[UnitPreferenceType.Flank])
    return false
  return cohort.definition.role === UnitRole.Support
}

const isAlive = (unit: CombatCohort, minimum_morale: number, minimum_strength: number) => (
  unit[UnitAttribute.Morale] > minimum_morale && unit[UnitAttribute.Strength] > minimum_strength
)

const removeDefeated = (cohorts: CombatCohorts, minimum_morale: number, minimum_strength: number) => {
  const { frontline, reserve, defeated } = cohorts

  const removeFromReserve = (part: CombatCohort[]) => {
    for (let i = 0; i < part.length; i++) {
      const cohort = part[i]
      if (isAlive(cohort, minimum_morale, minimum_strength))
        continue
      defeated.push(cohort)
      remove(part, value => value === cohort)
      i--
    }
  }

  for (let i = 0; i < frontline.length; i++) {
    for (let j = 0; j < frontline[i].length; j++) {
      const cohort = frontline[i][j]
      if (!cohort)
        continue
      if (isAlive(cohort, minimum_morale, minimum_strength))
        continue
      defeated.push(cohort)
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
const calculateFlankSizes = (combat_width: number, preferred_flank_size: number, enemy_units?: CombatCohorts): [number, number] => {
  const free_space = enemy_units ? combat_width - armySize(enemy_units) : 0
  const left_side_free_space = Math.ceil(free_space / 2.0)
  const right_side_free_space = Math.floor(free_space / 2.0)
  // Max space checks needed for low combat widths.
  const left_side_max_space = Math.ceil(combat_width / 2.0)
  const right_side_max_space = Math.floor(combat_width / 2.0)
  const left_flank_size = clamp(preferred_flank_size, left_side_free_space, left_side_max_space)
  const right_flank_size = clamp(preferred_flank_size, right_side_free_space, right_side_max_space)
  return [left_flank_size, right_flank_size]
}

const calculatePreferredFlankSize = (settings: Settings, custom_value: number, army: CombatCohorts) => {
  return settings[Setting.CustomDeployment] ? custom_value : Math.min(armyFlankCount(army) / 2, Math.floor(settings[Setting.CombatWidth] / 4))
}

export const deploy = (attacker: CombatParticipant, defender: CombatParticipant, settings: Settings) => {
  removeDefeated(attacker.cohorts, settings[Setting.MinimumMorale], settings[Setting.MinimumStrength])
  removeDefeated(defender.cohorts, settings[Setting.MinimumMorale], settings[Setting.MinimumStrength])

  const [left_flank_a, right_flank_a] = calculateFlankSizes(settings[Setting.CombatWidth], calculatePreferredFlankSize(settings, attacker.flank, attacker.cohorts), settings[Setting.DynamicFlanking] ? defender.cohorts : undefined)
  const [left_flank_d, right_flank_d] = calculateFlankSizes(settings[Setting.CombatWidth], calculatePreferredFlankSize(settings, defender.flank, defender.cohorts), settings[Setting.DynamicFlanking] ? attacker.cohorts : undefined)
  attacker.cohorts.left_flank = left_flank_a
  attacker.cohorts.right_flank = right_flank_a
  defender.cohorts.left_flank = left_flank_d
  defender.cohorts.right_flank = right_flank_d
  deployCohorts(attacker.cohorts, settings)
  deployCohorts(defender.cohorts, settings)
  attacker.alive = armySize(attacker.cohorts) > 0
  defender.alive = armySize(defender.cohorts) > 0
  if (settings[Setting.Stackwipe])
    checkInstantStackWipe(attacker, defender, settings)
}

const checkInstantStackWipe = (attacker: CombatParticipant, defender: CombatParticipant, settings: Settings) => {
  const total_a = calculateTotalStrength(attacker.cohorts)
  const total_d = calculateTotalStrength(defender.cohorts)
  if (!defender.alive || total_a / total_d > settings[Setting.HardStackWipeLimit])
    stackWipe(defender.cohorts)
  else if (!attacker.alive || total_d / total_a > settings[Setting.HardStackWipeLimit])
    stackWipe(attacker.cohorts)
}

const moveUnits = (cohorts: CombatCohorts, ) => {
  const { frontline } = cohorts
  // Move units from back to front.
  for (let row_index = frontline.length - 1; row_index > 0; row_index--) {
    const row = frontline[row_index]
    const next_row = frontline[row_index - 1]
    for (let unit_index = 0; unit_index < row.length; unit_index++) {
      if (next_row[unit_index])
        continue
      next_row[unit_index] = row[unit_index]
      row[unit_index] = null
    }
  }
  // Only front cohorts can move on their row.
  const front = frontline[0]
  // Move units from left to center.
  for (let unit_index = Math.floor(front.length / 2.0); unit_index > 0; --unit_index) {
    const unit = front[unit_index]
    if (unit)
      continue
    const unit_on_left = front[unit_index - 1]
    if (unit_on_left) {
      front[unit_index] = unit_on_left
      front[unit_index - 1] = null
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
    }
  }
}

/**
* Reinforces a given army based on reinforcement rules.
* First priority is to move units from reserve. Then units move towards center.
*/
export const reinforce = (participant: CombatParticipant, settings: Settings) => {
  if (reserveSize(participant.cohorts.reserve))
    deployCohorts(participant.cohorts, settings, participant.unit_preferences)
  moveUnits(participant.cohorts)
}
