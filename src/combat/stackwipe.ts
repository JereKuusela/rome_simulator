import { Side, Setting, Cohorts, Cohort, Environment, UnitAttribute } from 'types'
import { calculateTotalStrength } from 'combat'
import { uncaptureCohort, wipeCohort } from './combat_utils'
import { getLeadingArmy } from 'managers/battle'
import { getRootParent } from 'managers/units'

export const checkStackWipe = (environment: Environment, side: Side, enemy: Side) => {
  if (!environment.settings[Setting.Stackwipe])
    return false
  if (environment.round > 0 && !side.isDefeated)
    return false
  const settings = environment.settings
  const noDeploy = environment.round === 0 && side.isDefeated
  const soft = 0 < environment.round && environment.round < settings[Setting.StackwipeRounds]
  const total = calculateTotalStrength(side.cohorts, true)
  const totalEnemy = calculateTotalStrength(enemy.cohorts, true)
  const wipe = (noDeploy || !total || totalEnemy / total > (soft ? settings[Setting.SoftStackWipeLimit] : settings[Setting.HardStackWipeLimit]))
  if (wipe)
    stackWipe(environment, side, enemy)
  return wipe
}

const wasDefeatedDuringCurrentBattle = (environment: Environment, cohort: Cohort) => cohort.state.defeatedDay >= environment.day - environment.round

export const stackWipe = (environment: Environment, side: Side, enemy: Side) => {
  side.isDefeated = true
  const { frontline, reserve, defeated } = side.cohorts
  const enemyArmy = getLeadingArmy(enemy)
  returnCapturedCohorts(environment, enemy.cohorts)
  const captureChance = enemyArmy ? environment.settings[Setting.StackWipeCaptureChance] + enemyArmy.unitProperties[getRootParent(environment.mode)][UnitAttribute.CaptureChance] : 0

  for (let i = 0; i < defeated.length; i++) {
    if (wasDefeatedDuringCurrentBattle(environment, defeated[i])) {
      wipeCohort(environment, defeated[i], enemyArmy, captureChance)
    }
  }

  const removeFromReserve = (part: Cohort[]) => {
    for (let i = 0; i < part.length; i++) {
      const cohort = part[i]
      defeated.push(cohort)
      wipeCohort(environment, cohort, enemyArmy, captureChance)
    }
    part.length = 0
  }

  for (let i = 0; i < frontline.length; i++) {
    for (let j = 0; j < frontline[i].length; j++) {
      const cohort = frontline[i][j]
      if (!cohort)
        continue
      // Already defeated is a proxy for UI purposes, just clean it up.
      if (!cohort.state.isDefeated) {
        defeated.push(cohort)
        frontline[i][j] = null
      }
      wipeCohort(environment, cohort, enemyArmy, captureChance)
    }
  }
  removeFromReserve(reserve.front)
  removeFromReserve(reserve.flank)
  removeFromReserve(reserve.support)
}

/**
 * Sets capture chance to 0 which "returns" captured cohorts since they can never get captured.
 * If capturing can happen outside analyze then this needs to work bit differently.
 */
const returnCapturedCohorts = (environment: Environment, cohorts: Cohorts) => {
  const { frontline, reserve, defeated } = cohorts
  for (let i = 0; i < defeated.length; i++) {
    if (wasDefeatedDuringCurrentBattle(environment, defeated[i])) {
      uncaptureCohort(defeated[i])
    }
  }

  const removeFromReserve = (part: Cohort[]) => {
    for (let i = 0; i < part.length; i++) {
      const cohort = part[i]
      defeated.push(cohort)
      uncaptureCohort(cohort)
    }
    part.length = 0
  }

  for (let i = 0; i < frontline.length; i++) {
    for (let j = 0; j < frontline[i].length; j++) {
      const cohort = frontline[i][j]
      if (!cohort)
        continue
      uncaptureCohort(cohort)
    }
  }
  removeFromReserve(reserve.front)
  removeFromReserve(reserve.flank)
  removeFromReserve(reserve.support)
}
