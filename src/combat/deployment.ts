import { CombatUnit, CombatUnits, Reserve, CombatParticipant } from './combat'
import { RowTypes, UnitCalc, RowType, UnitDeployment, CombatSettings, Setting } from 'types'
import { nextIndex } from './reinforcement'
import { sortBy, remove } from 'lodash'

export type SortedReserve = {
  front: CombatUnit[]
  flank: CombatUnit[]
  support: CombatUnit[]
}

const armySize = (units: CombatUnits) => {
  return units.frontline.filter(unit => unit).length + units.reserve.length
}

const deployArmy = (units: CombatUnits, left_flank: number, right_flank: number, row_types: RowTypes) => {
  const frontline = units.frontline
  const reserve = units.reserve
  const sorted = sortReserve(reserve, row_types)
  const center = Math.floor(frontline.length / 2.0)

  let index = center
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


export const sortReserve = (reserve: Reserve, row_types: RowTypes): SortedReserve => {
  const frontReserve = reserve.filter(value => isFrontUnit(row_types, value))
  const flankReserve = reserve.filter(value => isFlankUnit(row_types, value))
  const supportReserve = reserve.filter(value => isSupportUnit(row_types, value))
  // Calculate priorities (mostly based on unit type, ties are resolved with index numbers).
  const front = sortBy(frontReserve, value => {
      return -value.definition.deployment_cost * 100000 - value[UnitCalc.Strength] * 1000 - (value.definition.type === row_types[RowType.Primary] ? 200000000 : 0) - (value.definition.type === row_types[RowType.Secondary] ? -100000000 : 0)
  })
  const flank = sortBy(flankReserve, value => {
      return -value.definition[UnitCalc.Maneuver] * 100000 - value[UnitCalc.Strength] * 1000 - (value.definition.type === row_types[RowType.Flank] ? 100000000 : 0)
  })
  const support = sortBy(supportReserve, value => {
    return -value[UnitCalc.Strength] * 1000
})
  return { front, flank, support }
}

const isFrontUnit = (row_types: RowTypes, unit: CombatUnit) => {
  if (unit.definition.type === row_types[RowType.Flank])
      return false
  if (unit.definition.type === row_types[RowType.Primary] || unit.definition.type === row_types[RowType.Secondary])
      return true
  return unit.definition.deployment === UnitDeployment.Front
}

const isFlankUnit = (row_types: RowTypes, unit: CombatUnit) => {
  if (unit.definition.type === row_types[RowType.Flank])
      return true
  if (unit.definition.type === row_types[RowType.Primary] || unit.definition.type === row_types[RowType.Secondary])
      return false
  return unit.definition.deployment === UnitDeployment.Flank
}

const isSupportUnit = (row_types: RowTypes, unit: CombatUnit) => {
  if (unit.definition.type === row_types[RowType.Flank])
      return false
  if (unit.definition.type === row_types[RowType.Primary] || unit.definition.type === row_types[RowType.Secondary])
      return false
  return unit.definition.deployment === UnitDeployment.Support
}


/**
 * Removes units from frontline which are out of combat width.
 * Also resizes the frontline to prevent 'index out of bounds' errors.
 * Calling this function shouldn't be necessary 
 */
const removeOutOfBounds = (units: CombatUnits, combat_width: number) => {
  while (units.frontline.length > combat_width)  {
    const unit = units.frontline.pop()
    if (unit)
      units.defeated.push(unit)
  }
}

const isAlive = (unit: CombatUnit, minimum_morale: number, minimum_strength: number) => (
  unit[UnitCalc.Morale] > minimum_morale && unit[UnitCalc.Strength] > minimum_strength
)

const removeDefeated = (units: CombatUnits, minimum_morale: number, minimum_strength: number) => {
  const frontline = units.frontline
  const reserve = units.reserve
  const defeated = units.defeated

  for (let i = 0; i < frontline.length; i++) {
    const unit = frontline[i]
    if (!unit)
      continue
    if (isAlive(unit, minimum_morale, minimum_strength))
      continue
    defeated.push(unit)
    frontline[i] = null
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

const calculateFlankSizes = (flank_size: number, enemy_units: CombatUnits): [number, number] => {
  const front_size = enemy_units.frontline.length
  const enemy_size = armySize(enemy_units)
  let left_flank_size = Math.max(flank_size, Math.ceil((front_size - enemy_size) / 2.0))
  // Ensure that the flank doesn't spill over the center with small combat sizes.
  left_flank_size = Math.min(Math.ceil(front_size / 2.0), left_flank_size)
  let right_flank_size = Math.max(flank_size, Math.floor((front_size - enemy_size) / 2.0))
  right_flank_size = Math.min(Math.floor(front_size / 2.0), right_flank_size)
  return [left_flank_size, right_flank_size]
}

export const deploy = (attacker: CombatParticipant, defender: CombatParticipant, settings: CombatSettings) => {
  removeOutOfBounds(attacker.army, settings[Setting.CombatWidth])
  removeOutOfBounds(defender.army, settings[Setting.CombatWidth])
  removeDefeated(attacker.army, settings[Setting.MinimumMorale], settings[Setting.MinimumStrength])
  removeDefeated(defender.army, settings[Setting.MinimumMorale], settings[Setting.MinimumStrength])

  const [left_flank_a, right_flank_a] = calculateFlankSizes(attacker.flank, defender.army)
  const [left_flank_d, right_flank_d] = calculateFlankSizes(defender.flank, attacker.army)

  deployArmy(attacker.army, left_flank_a, right_flank_a, attacker.row_types)
  deployArmy(defender.army, left_flank_d, right_flank_d, defender.row_types)
}