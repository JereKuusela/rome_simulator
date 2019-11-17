import { nextIndex } from "./reinforcement_fast"
import { CombatUnits, CombatUnit } from "./combat_fast"
import { UnitCalc } from "../store/units"
import { remove } from "lodash"
import { CombatSettings, CombatParameter } from "../store/settings"


const armySize = (units: CombatUnits) => {
  return units.frontline.filter(unit => unit).length + units.reserve.main.length + units.reserve.flank.length
}

const deployArmy = (units: CombatUnits, left_flank: number, right_flank: number) => {
  const frontline = units.frontline
  const reserve = units.reserve
  const center = Math.floor(frontline.length / 2.0)

  let index = center
  // Fill main front until flanks are reached.
  for (; index >= left_flank && index + right_flank < frontline.length; index = nextIndex(index, center)) {
      if (frontline[index])
          continue
      const main = reserve.main.shift()
      if (main) {
          frontline[index] = main
          continue
      }
      const flank = reserve.flank.shift()
      if (flank) {
          frontline[index] = flank
          continue
      }
      break
  }
  // Fill flanks with remaining units.
  for (; index >= 0 && index < frontline.length; index = nextIndex(index, center)) {
      if (frontline[index])
          continue
      const flank = reserve.flank.shift()
      if (flank) {
          frontline[index] = flank
          continue
      }
      const main = reserve.main.shift()
      if (main) {
          frontline[index] = main
          continue
      }
      break
  }
}


/**
 * Removes units from frontline which are out of combat width.
 * Also resizes the frontline to prevent "index out of bounds" errors.
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
  for (let i = 0; i < reserve.main.length; i++) {
    const unit = reserve.main[i]
    if (!unit)
      continue
    if (isAlive(unit, minimum_morale, minimum_strength))
      continue
    defeated.push(unit)
    remove(reserve.main, value => value === unit)
  }
  for (let i = 0; i < reserve.flank.length; i++) {
    const unit = reserve.flank[i]
    if (!unit)
      continue
    if (isAlive(unit, minimum_morale, minimum_strength))
      continue
    defeated.push(unit)
    remove(reserve.flank, value => value === unit)
  }
}

const preferredFlankSize = (units: CombatUnits, flank_size: number) => {
  const front_size = units.frontline.length
  const army_size = armySize(units)
  // Determine whether the preferred flank size has any effect.
  // Note: Only tested with combat width of 30. +2 might be a bug in the game.
  return army_size > front_size + 2 ? flank_size : 0
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

export const deploy = (units_a: CombatUnits, units_d: CombatUnits, preferred_flank_a: number, preferred_flank_d: number, settings: CombatSettings) => {
  removeOutOfBounds(units_a, settings[CombatParameter.CombatWidth])
  removeOutOfBounds(units_d, settings[CombatParameter.CombatWidth])
  removeDefeated(units_a, settings[CombatParameter.MinimumMorale], settings[CombatParameter.MinimumStrength])
  removeDefeated(units_d, settings[CombatParameter.MinimumMorale], settings[CombatParameter.MinimumStrength])

  preferred_flank_a = preferredFlankSize(units_a, preferred_flank_a)
  preferred_flank_d = preferredFlankSize(units_a, preferred_flank_d)

  const [left_flank_a, right_flank_a] = calculateFlankSizes(preferred_flank_a, units_d)
  const [left_flank_d, right_flank_d] = calculateFlankSizes(preferred_flank_d, units_a)

  deployArmy(units_a, left_flank_a, right_flank_a)
  deployArmy(units_d, left_flank_d, right_flank_d)
}