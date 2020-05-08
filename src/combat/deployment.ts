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
    cohort[UnitAttribute.Morale] -= cohort.definition.maxMorale * settings[Setting.MoraleHitForNonSecondaryReinforcement]
}

const deployCohorts = (cohorts: CombatCohorts, settings: Settings, preferences?: UnitPreferences) => {
  const { leftFlank, rightFlank, reserve } = cohorts
  const frontline = cohorts.frontline[0]
  const backline = cohorts.frontline.length > 1 ? cohorts.frontline[1] : null
  const center = Math.floor(frontline.length / 2.0)
  let flankStartingIndex = leftFlank > rightFlank ? leftFlank - 1 : frontline.length - rightFlank
  if (frontline.length % 2)
    flankStartingIndex = leftFlank >= rightFlank ? leftFlank - 1 : frontline.length - rightFlank
  const deploySupport = !settings[Setting.SupportPhase] || (reserve.front.length === 0 && reserve.flank.length === 0 && !frontline.some(cohort => cohort))
  const maxSupportBackline = Math.floor(reserveSize(reserve) / 2)
  if (backline)
    deployBoth(reserve.support, backline, center, maxSupportBackline, settings, preferences)

  deployFront(reserve.front, frontline, center, flankStartingIndex, settings, preferences)
  deployFront(reserve.flank, frontline, center, flankStartingIndex, settings, preferences)
  if (deploySupport)
    deployFront(reserve.support, frontline, center, flankStartingIndex, settings, preferences)
  // Use front units as flank if necessary.
  deployFlanks(reserve.flank.length ? reserve.flank : reserve.front, frontline, center, flankStartingIndex, settings, preferences)
  if (backline)
    deployFront(reserve.front, backline, center, flankStartingIndex, settings, preferences)
  deployFlanks(reserve.flank, frontline, center, flankStartingIndex, settings, preferences)
  deployFlanks(reserve.front, frontline, center, flankStartingIndex, settings, preferences)
  if (deploySupport)
    deployFlanks(reserve.support, frontline, center, flankStartingIndex, settings, preferences)
  if (backline)
    deployFlanks(reserve.flank, backline, center, flankStartingIndex, settings, preferences)
}


export const sortReserve = (reserve: CombatReserve, unitPreferences: UnitPreferences): SortedReserve => {
  const frontReserve = reserve.filter(value => isFrontUnit(unitPreferences, value))
  const flankReserve = reserve.filter(value => isFlankUnit(unitPreferences, value))
  const supportReserve = reserve.filter(value => isSupportUnit(unitPreferences, value))
  // Calculate priorities (mostly based on unit type, ties are resolved with index numbers).
  const front = sortBy(frontReserve, value => {
    return value.definition.deploymentCost * 100000 + value[UnitAttribute.Strength] * 1000 + (value.definition.type === unitPreferences[UnitPreferenceType.Primary] ? 200000000 : 0) + (value.definition.type === unitPreferences[UnitPreferenceType.Secondary] ? 100000000 : 0)
  })
  const flank = sortBy(flankReserve, value => {
    return value.definition[UnitAttribute.Maneuver] * 100000 + value[UnitAttribute.Strength] * 1000 + (value.definition.type === unitPreferences[UnitPreferenceType.Flank] ? 100000000 : 0)
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

const isAlive = (unit: CombatCohort, minimumMorale: number, minimumStrength: number) => (
  unit[UnitAttribute.Morale] > minimumMorale && unit[UnitAttribute.Strength] > minimumStrength
)

const removeDefeated = (cohorts: CombatCohorts, minimumMorale: number, minimumStrength: number) => {
  const { frontline, reserve, defeated } = cohorts

  const removeFromReserve = (part: CombatCohort[]) => {
    for (let i = 0; i < part.length; i++) {
      const cohort = part[i]
      if (isAlive(cohort, minimumMorale, minimumStrength))
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
      if (isAlive(cohort, minimumMorale, minimumStrength))
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
 * @param combatWidth Size of the battlefield.
 * @param preferredFlankSize Maximum amount of flanking units per side.
 * @param reserve Sorted reserve to get amount of flanking units.
 * @param enemyUnits Enemy units to calculate space on the battlefield.
 */
const calculateFlankSizes = (combatWidth: number, preferredFlankSize: number, enemyUnits?: CombatCohorts): [number, number] => {
  const freeSpace = enemyUnits ? combatWidth - armySize(enemyUnits) : 0
  const leftSideFreeSpace = Math.ceil(freeSpace / 2.0)
  const rightSideFreeSpace = Math.floor(freeSpace / 2.0)
  // Max space checks needed for low combat widths.
  const leftSideMaxSpace = Math.ceil(combatWidth / 2.0)
  const rightSideMaxSpace = Math.floor(combatWidth / 2.0)
  const leftFlankSize = clamp(preferredFlankSize, leftSideFreeSpace, leftSideMaxSpace)
  const rightFlankSize = clamp(preferredFlankSize, rightSideFreeSpace, rightSideMaxSpace)
  return [leftFlankSize, rightFlankSize]
}

const calculatePreferredFlankSize = (settings: Settings, customValue: number, army: CombatCohorts) => {
  return settings[Setting.CustomDeployment] ? customValue : Math.min(armyFlankCount(army) / 2, Math.floor(settings[Setting.CombatWidth] / 4))
}

export const deploy = (attacker: CombatParticipant, defender: CombatParticipant, settings: Settings) => {
  removeDefeated(attacker.cohorts, settings[Setting.MinimumMorale], settings[Setting.MinimumStrength])
  removeDefeated(defender.cohorts, settings[Setting.MinimumMorale], settings[Setting.MinimumStrength])

  const [leftFlankA, rightFlankA] = calculateFlankSizes(settings[Setting.CombatWidth], calculatePreferredFlankSize(settings, attacker.flank, attacker.cohorts), settings[Setting.DynamicFlanking] ? defender.cohorts : undefined)
  const [leftFlankD, rightFlankD] = calculateFlankSizes(settings[Setting.CombatWidth], calculatePreferredFlankSize(settings, defender.flank, defender.cohorts), settings[Setting.DynamicFlanking] ? attacker.cohorts : undefined)
  attacker.cohorts.leftFlank = leftFlankA
  attacker.cohorts.rightFlank = rightFlankA
  defender.cohorts.leftFlank = leftFlankD
  defender.cohorts.rightFlank = rightFlankD
  deployCohorts(attacker.cohorts, settings)
  deployCohorts(defender.cohorts, settings)
  attacker.alive = armySize(attacker.cohorts) > 0
  defender.alive = armySize(defender.cohorts) > 0
  if (settings[Setting.Stackwipe])
    checkInstantStackWipe(attacker, defender, settings)
}

const checkInstantStackWipe = (attacker: CombatParticipant, defender: CombatParticipant, settings: Settings) => {
  const totalA = calculateTotalStrength(attacker.cohorts)
  const totalD = calculateTotalStrength(defender.cohorts)
  if (!defender.alive || totalA / totalD > settings[Setting.HardStackWipeLimit])
    stackWipe(defender.cohorts)
  else if (!attacker.alive || totalD / totalA > settings[Setting.HardStackWipeLimit])
    stackWipe(attacker.cohorts)
}

const moveUnits = (cohorts: CombatCohorts, ) => {
  const { frontline } = cohorts
  // Move units from back to front.
  for (let rowIndex = frontline.length - 1; rowIndex > 0; rowIndex--) {
    const row = frontline[rowIndex]
    const nextRow = frontline[rowIndex - 1]
    for (let unitIndex = 0; unitIndex < row.length; unitIndex++) {
      if (nextRow[unitIndex])
        continue
      nextRow[unitIndex] = row[unitIndex]
      row[unitIndex] = null
    }
  }
  // Only front cohorts can move on their row.
  const front = frontline[0]
  // Move units from left to center.
  for (let unitIndex = Math.floor(front.length / 2.0); unitIndex > 0; --unitIndex) {
    const unit = front[unitIndex]
    if (unit)
      continue
    const unitOnLeft = front[unitIndex - 1]
    if (unitOnLeft) {
      front[unitIndex] = unitOnLeft
      front[unitIndex - 1] = null
    }
  }
  // Move units from right to center.
  for (let unitIndex = Math.ceil(front.length / 2.0); unitIndex < front.length - 1; ++unitIndex) {
    const unit = front[unitIndex]
    if (unit)
      continue
    const unitOnRight = front[unitIndex + 1]
    if (unitOnRight) {
      front[unitIndex] = unitOnRight
      front[unitIndex + 1] = null
    }
  }
}

/**
* Reinforces a given army based on reinforcement rules.
* First priority is to move units from reserve. Then units move towards center.
*/
export const reinforce = (participant: CombatParticipant, settings: Settings) => {
  if (reserveSize(participant.cohorts.reserve))
    deployCohorts(participant.cohorts, settings, participant.unitPreferences)
  moveUnits(participant.cohorts)
}
