import { UnitPreferences, UnitAttribute, UnitPreferenceType, UnitRole, Setting, Settings, Reserve, Cohorts, Cohort, Side, Environment, Army } from 'types'
import { sortBy, remove, clamp, sum, flatten } from 'lodash'
import { nextIndex, reserveSize, defeatCohort, isAlive } from './combat_utils'
import { getLeadingArmy } from 'managers/battle'

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

const applyLateDeploymentPenalty = (reserve: Reserve, round: number, settings: Settings) => {
  if (round < settings[Setting.StackwipeRounds])
    return
  reserve.front.forEach(cohort => cohort[UnitAttribute.Morale] -= cohort.properties.maxMorale * settings[Setting.MoraleHitForLateDeployment])
  reserve.flank.forEach(cohort => cohort[UnitAttribute.Morale] -= cohort.properties.maxMorale * settings[Setting.MoraleHitForLateDeployment])
  reserve.support.forEach(cohort => cohort[UnitAttribute.Morale] -= cohort.properties.maxMorale * settings[Setting.MoraleHitForLateDeployment])
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

const removeDefeatedFromNewArmies = (environment: Environment, side: Side, armies: Army[]) => {
  const removeFromReserve = (part: Cohort[]) => {
    for (let i = 0; i < part.length; i++) {
      const cohort = part[i]
      if (isAlive(cohort, environment.settings))
        continue
      defeatCohort(environment, cohort)
      side.cohorts.defeated.push(cohort)
      remove(part, value => value === cohort)
      i--
    }
  }
  armies.forEach(army => {
    removeFromReserve(army.reserve.front)
    removeFromReserve(army.reserve.flank)
    removeFromReserve(army.reserve.support)
  })
}

export const deploy = (environment: Environment, sideA: Side, sideB: Side) => {
  const { day, settings, round } = environment
  if (round === 0 && (!canDeploy(day, sideA) || !canDeploy(day, sideB)))
    return
  const armiesA = getDeployingArmies(day, sideA)
  const armiesB = getDeployingArmies(day, sideB)
  removeDefeatedFromNewArmies(environment, sideA, armiesA)
  removeDefeatedFromNewArmies(environment, sideB, armiesB)
  const sizeA = settings[Setting.DynamicFlanking] ? countCohorts(sideA) + countReserve(armiesA) : undefined
  const sizeB = settings[Setting.DynamicFlanking] ? countCohorts(sideB) + countReserve(armiesB) : undefined
  if (armiesA.length) {
    deploySub(sideA, armiesA, settings, environment.round, sizeB)
  }
  if (armiesB.length) {
    deploySub(sideB, armiesB, settings, environment.round, sizeA)
  }
}

const countCohorts = (side: Side) => reserveSize(side.cohorts.reserve) + side.cohorts.frontline[0].filter(unit => unit).length
const countReserve = (armies: Army[]) => sum(armies.map(army => reserveSize(army.reserve)))

export const undeploy = (side: Side) => {
  if (!side.isDefeated) {
    const reserve: Cohort[] = []
    reserve.push(...flatten(side.cohorts.frontline.map(row => row.filter(cohort => cohort) as Cohort[])))
    reserve.push(...side.cohorts.reserve.flank)
    reserve.push(...side.cohorts.reserve.front)
    reserve.push(...side.cohorts.reserve.support)
    reserve.push(...side.cohorts.defeated)
    side.deployed.forEach(army => {
      army.reserve = sortReserve(reserve.filter(cohort => cohort.properties.participantIndex === army.participantIndex), army.unitPreferences)
      side.armies.push(army)
    })
  }

  side.deployed = []
  side.cohorts.frontline = side.cohorts.frontline.map(row => row.map(() => null))
  side.cohorts.defeated = []
  resortReserve(side, [])
}


export const moveDefeatedToRetreated = (cohorts: Cohorts) => {
  cohorts.retreated.push(...cohorts.defeated)
  cohorts.defeated = []
}

const canDeploy = (day: number, side: Side) => {
  return side.armies.length && side.armies[side.armies.length - 1].arrival <= day
}

const getDeployingArmies = (day: number, side: Side) => {
  const armies = []
  while (side.armies.length && side.armies[side.armies.length - 1].arrival <= day) {
    armies.push(side.armies.pop()!)
  }
  return armies
}

const deploySub = (side: Side, deploying: Army[], settings: Settings, round: number, enemyArmySize?: number) => {
  const pool: Cohort[] = []
  deploying.forEach(army => {
    const [leftFlank, rightFlank] = calculateFlankSizes(settings[Setting.CombatWidth], calculatePreferredFlankSize(settings, army.flankSize, army.reserve), enemyArmySize)
    army.leftFlank = leftFlank
    army.rightFlank = rightFlank
    applyLateDeploymentPenalty(army.reserve, round, settings)
    deployCohorts(side.cohorts, army.reserve, leftFlank, rightFlank, settings)
    side.deployed.push(army)
    pool.push(...army.reserve.front)
    pool.push(...army.reserve.flank)
    pool.push(...army.reserve.support)
  })
  side.deployed.sort((a, b) => b.priority - a.priority)
  pool.push(...side.cohorts.reserve.front)
  pool.push(...side.cohorts.reserve.flank)
  pool.push(...side.cohorts.reserve.support)
  resortReserve(side, pool)
}

const resortReserve = (side: Side, reserve: Cohort[]) => {
  const general = getLeadingArmy(side)
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
  const general = getLeadingArmy(side)
  if (general && reserveSize(side.cohorts.reserve))
    deployCohorts(side.cohorts, side.cohorts.reserve, general.leftFlank, general.rightFlank, settings, general.unitPreferences)
  moveUnits(side.cohorts)
}
