import { UnitPreferences, UnitAttribute, UnitPreferenceType, UnitRole, Setting, Settings, Reserve, Cohorts, Cohort, Side, Defeated, Environment } from 'types'
import { sortBy, remove, clamp } from 'lodash'
import { nextIndex, reserveSize, armySize } from './combat_utils'
import { getLeadingGeneral } from 'managers/battle'

const armyFlankCount = (reserve: Reserve) => {
  return reserve.front.filter(cohort => cohort.properties.role === UnitRole.Flank).length
    + reserve.flank.filter(cohort => cohort.properties.role === UnitRole.Flank).length
    + reserve.support.filter(cohort => cohort.properties.role === UnitRole.Flank).length
}

const deployFront = (cohorts: Cohort[], row: (Cohort | null)[], center: number, flank: number, settings: Settings, preferences?: UnitPreferences) => {
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

const deployFlanks = (cohorts: Cohort[], row: (Cohort | null)[], center: number, flank: number, settings: Settings, preferences?: UnitPreferences) => {
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

const deployBoth = (cohorts: Cohort[], row: (Cohort | null)[], center: number, limit: number, settings: Settings, preferences?: UnitPreferences) => {
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

const applyReinforcementPenalty = (cohort: Cohort, preferences: UnitPreferences, settings: Settings) => {
  if (cohort.properties.type !== preferences[UnitPreferenceType.Secondary])
    cohort[UnitAttribute.Morale] -= cohort.properties.maxMorale * settings[Setting.MoraleHitForNonSecondaryReinforcement]
}

const deployCohorts = (target: Cohorts, reserve: Reserve, leftFlank: number, rightFlank: number, settings: Settings, preferences?: UnitPreferences) => {
  const frontline = target.frontline[0]
  const backline = target.frontline.length > 1 ? target.frontline[1] : null
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


export const sortReserve = (reserve: Cohort[], unitPreferences: UnitPreferences): Reserve => {
  const frontReserve = reserve.filter(value => isFrontUnit(unitPreferences, value))
  const flankReserve = reserve.filter(value => isFlankUnit(unitPreferences, value))
  const supportReserve = reserve.filter(value => isSupportUnit(unitPreferences, value))
  // Calculate priorities (mostly based on unit type, ties are resolved with index numbers).
  const front = sortBy(frontReserve, value => {
    return value.properties.deploymentCost * 100000 + value[UnitAttribute.Strength] * 1000 + (value.properties.type === unitPreferences[UnitPreferenceType.Primary] ? 200000000 : 0) + (value.properties.type === unitPreferences[UnitPreferenceType.Secondary] ? 100000000 : 0)
  })
  const flank = sortBy(flankReserve, value => {
    return value.properties[UnitAttribute.Maneuver] * 100000 + value[UnitAttribute.Strength] * 1000 + (value.properties.type === unitPreferences[UnitPreferenceType.Flank] ? 100000000 : 0)
  })
  const support = sortBy(supportReserve, value => {
    return value[UnitAttribute.Strength] * 1000
  })
  return { front, flank, support }
}

const isFrontUnit = (preferences: UnitPreferences, cohort: Cohort) => {
  if (cohort.properties.type === preferences[UnitPreferenceType.Primary] || cohort.properties.type === preferences[UnitPreferenceType.Secondary])
    return true
  if (cohort.properties.type === preferences[UnitPreferenceType.Flank])
    return false
  return cohort.properties.role === UnitRole.Front
}

const isFlankUnit = (preferences: UnitPreferences, cohort: Cohort) => {
  if (cohort.properties.type === preferences[UnitPreferenceType.Primary] || cohort.properties.type === preferences[UnitPreferenceType.Secondary])
    return false
  if (cohort.properties.type === preferences[UnitPreferenceType.Flank])
    return true
  return cohort.properties.role === UnitRole.Flank
}

const isSupportUnit = (preferences: UnitPreferences, cohort: Cohort) => {
  if (cohort.properties.type === preferences[UnitPreferenceType.Primary] || cohort.properties.type === preferences[UnitPreferenceType.Secondary])
    return false
  if (cohort.properties.type === preferences[UnitPreferenceType.Flank])
    return false
  return cohort.properties.role === UnitRole.Support
}

const isAlive = (unit: Cohort, minimumMorale: number, minimumStrength: number) => (
  unit[UnitAttribute.Morale] > minimumMorale && unit[UnitAttribute.Strength] > minimumStrength
)

const removeDefeated = (reserve: Reserve, defeated: Defeated, minimumMorale: number, minimumStrength: number) => {

  const removeFromReserve = (part: Cohort[]) => {
    for (let i = 0; i < part.length; i++) {
      const cohort = part[i]
      if (isAlive(cohort, minimumMorale, minimumStrength))
        continue
      defeated.push(cohort)
      remove(part, value => value === cohort)
      i--
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
const calculateFlankSizes = (combatWidth: number, preferredFlankSize: number, enemyArmySize?: number): [number, number] => {
  const free_space = enemyArmySize ? combatWidth - enemyArmySize : 0
  const leftSideFreeSpace = Math.ceil(free_space / 2.0)
  const rightSideFreeSpace = Math.floor(free_space / 2.0)
  // Max space checks needed for low combat widths.
  const leftSideMaxSpace = Math.ceil(combatWidth / 2.0)
  const rightSideMaxSpace = Math.floor(combatWidth / 2.0)
  const leftFlankSize = clamp(preferredFlankSize, leftSideFreeSpace, leftSideMaxSpace)
  const rightFlankSize = clamp(preferredFlankSize, rightSideFreeSpace, rightSideMaxSpace)
  return [leftFlankSize, rightFlankSize]
}

const calculatePreferredFlankSize = (settings: Settings, customValue: number, reserve: Reserve) => {
  return settings[Setting.CustomDeployment] ? customValue : Math.min(armyFlankCount(reserve) / 2, Math.floor(settings[Setting.CombatWidth] / 4))
}

export const removeAllDefeated = (attacker: Side, defender: Side, settings: Settings) => {
  attacker.armies.forEach(participant => removeDefeated(participant.reserve, attacker.cohorts.defeated, settings[Setting.MinimumMorale], settings[Setting.MinimumStrength]))
  defender.armies.forEach(participant => removeDefeated(participant.reserve, defender.cohorts.defeated, settings[Setting.MinimumMorale], settings[Setting.MinimumStrength]))
}

export const deploy = (field: Environment, attacker: Side, defender: Side) => {
  const { round, settings } = field
  const sizeA = armySize(attacker, round)
  const sizeD = armySize(defender, round)

  attacker.alive = sizeA > 0
  defender.alive = sizeD > 0
  if (attacker.alive && defender.alive) {
    deploySub(field.round, attacker, settings, sizeD)
    deploySub(field.round, defender, settings, sizeA)
  }
}

export const undeploy = (side: Side) => {
  side.armies.push(...side.deployedArmies)
  side.deployedArmies = []
  side.cohorts.frontline = side.cohorts.frontline.map(row => row.map(() => null))
  resortReserve(side, [])
}

const deploySub = (round: number, side: Side, settings: Settings, enemyArmySize: number) => {
  const pool: Cohort[] = []
  let deployed = false
  while (side.armies.length && side.armies[side.armies.length - 1].arrival <= round) {
    deployed = true
    const army = side.armies.pop()!
    side.deployedArmies.push({
      ...army, reserve: {
        front: [...army.reserve.front],
        flank: [...army.reserve.flank],
        support: [...army.reserve.support]
      }
    })
    const [leftFlank, rightFlank] = calculateFlankSizes(settings[Setting.CombatWidth], calculatePreferredFlankSize(settings, army.flankSize, army.reserve), settings[Setting.DynamicFlanking] ? enemyArmySize : undefined)
    army.general.leftFlank = leftFlank
    army.general.rightFlank = rightFlank
    deployCohorts(side.cohorts, army.reserve, leftFlank, rightFlank, settings)
    side.generals.push(army.general)
    pool.push(...army.reserve.flank)
    pool.push(...army.reserve.front)
    pool.push(...army.reserve.support)
  }
  if (deployed) {
    side.generals.sort((a, b) => b.priority - a.priority)
    pool.push(...side.cohorts.reserve.flank)
    pool.push(...side.cohorts.reserve.front)
    pool.push(...side.cohorts.reserve.support)
    resortReserve(side, pool)
  }
}

const resortReserve = (side: Side, reserve: Cohort[]) => {
  const general = getLeadingGeneral(side)
  // Without general there also won't be any cohorts (so sorting is not needed).
  if (general)
    side.cohorts.reserve = sortReserve(reserve, general.unitPreferences)
  else
    side.cohorts.reserve = {
      flank: [],
      front: [],
      support: []
    }
}

const moveUnits = (cohorts: Cohorts) => {
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
export const reinforce = (field: Environment, side: Side) => {
  const { settings } = field
  const general = getLeadingGeneral(side)
  if (general && reserveSize(side.cohorts.reserve))
    deployCohorts(side.cohorts, side.cohorts.reserve, general.leftFlank, general.rightFlank, settings, general.unitPreferences)
  moveUnits(side.cohorts)
}
