import { Side, Setting, Cohorts, Cohort, Environment } from 'types'
import { calculateTotalStrength } from 'combat'
import { wipeCohort } from './combat_utils'

export const checkInstantStackWipe = (environment: Environment, attacker: Side, defender: Side) => {
  const settings = environment.settings
  const strengthA = calculateTotalStrength(attacker.cohorts, false)
  const strengthD = calculateTotalStrength(defender.cohorts, false)
  if (!defender.alive || (strengthD && strengthA / strengthD > settings[Setting.HardStackWipeLimit]))
    stackWipe(environment, defender)
  else if (!attacker.alive || (strengthA && strengthD / strengthA > settings[Setting.HardStackWipeLimit]))
    stackWipe(environment, attacker)
}

export const checkStackWipe = (environment: Environment, side: Side, enemy: Cohorts) => {
  const settings = environment.settings
  const soft = environment.round < settings[Setting.StackwipeRounds]
  const total = calculateTotalStrength(side.cohorts, true)
  const totalEnemy = calculateTotalStrength(enemy, true)
  if (totalEnemy / total > (soft ? settings[Setting.SoftStackWipeLimit] : settings[Setting.HardStackWipeLimit]))
    stackWipe(environment, side)
}

const wasDefeatedDuringCurrentBattle = (environment: Environment, cohort: Cohort) => cohort.state.defeatedRound >= environment.day - environment.round

export const stackWipe = (environment: Environment, side: Side) => {
  side.alive = false
  side.generals = []
  side.deployedArmies = []
  const { frontline, reserve, defeated } = side.cohorts

  for (let i = 0; i < defeated.length; i++) {
    if (wasDefeatedDuringCurrentBattle(environment, defeated[i])) {
      wipeCohort(environment, defeated[i])
    }
  }

  const removeFromReserve = (part: Cohort[]) => {
    for (let i = 0; i < part.length; i++) {
      const cohort = part[i]
      defeated.push(cohort)
      wipeCohort(environment, cohort)
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
      wipeCohort(environment, cohort)
    }
  }
  removeFromReserve(reserve.front)
  removeFromReserve(reserve.flank)
  removeFromReserve(reserve.support)
}
