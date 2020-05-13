import { Side, Settings, Setting, Cohorts, UnitAttribute, Cohort } from 'types'
import { calculateTotalStrength } from 'combat'

export const checkInstantStackWipe = (attacker: Side, defender: Side, settings: Settings) => {
  const strengthA = calculateTotalStrength(attacker.cohorts, false)
  const strengthD = calculateTotalStrength(defender.cohorts, false)
  if (!defender.alive || (strengthD && strengthA / strengthD > settings[Setting.HardStackWipeLimit]))
    stackWipe(defender)
  else if (!attacker.alive || (strengthA && strengthD / strengthA > settings[Setting.HardStackWipeLimit]))
    stackWipe(attacker)
}

export const checkStackWipe = (side: Side, enemy: Cohorts, settings: Settings, soft: boolean) => {
  const total = calculateTotalStrength(side.cohorts, true)
  const totalEnemy = calculateTotalStrength(enemy, true)
  if (totalEnemy / total > (soft ? settings[Setting.SoftStackWipeLimit] : settings[Setting.HardStackWipeLimit]))
    stackWipe(side)
}

export const stackWipe = (side: Side) => {
  side.alive = false
  side.generals = []
  side.deployedArmies = []
  const { frontline, reserve, defeated } = side.cohorts

  for (let i = 0; i < defeated.length; i++) {
    defeated[i][UnitAttribute.Strength] = 0
    defeated[i][UnitAttribute.Morale] = 0

  }

  const removeFromReserve = (part: Cohort[]) => {
    for (let i = 0; i < part.length; i++) {
      const cohort = part[i]
      cohort[UnitAttribute.Strength] = 0
      cohort[UnitAttribute.Morale] = 0
      defeated.push(cohort)
    }
    part.length = 0
  }

  for (let i = 0; i < frontline.length; i++) {
    for (let j = 0; j < frontline[i].length; j++) {
      const cohort = frontline[i][j]
      if (!cohort)
        continue
      cohort[UnitAttribute.Strength] = 0
      cohort[UnitAttribute.Morale] = 0
      if (!cohort.state.isDefeated)
        defeated.push(cohort)
      frontline[i][j] = null
    }
  }
  removeFromReserve(reserve.front)
  removeFromReserve(reserve.flank)
  removeFromReserve(reserve.support)
}
