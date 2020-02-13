import { BaseCohorts, Cohorts, Mode, UnitDefinitionValues, BaseCohort, ArmyType, Side, Units, UnitType } from 'types'
import { mergeValues } from 'definition_values'
import { map, filter } from 'utils'
import { CombatUnits } from 'combat'
import { flatMap } from 'lodash'

/**
 * Merges base units with their definitions resulting in real units.
 * @param units Base units to merge. 
 * @param definitions Definitions to merge.
 */
export const mergeBaseUnitsWithDefinitions = (units: Cohorts, definitions: Units): Cohorts => ({
  frontline: units.frontline.map(row => row.map(unit => unit && mergeValues(definitions[unit.type], unit))),
  reserve: units.reserve.map(value => value && mergeValues(definitions[value.type], value)),
  defeated: units.defeated.map(value => value && mergeValues(definitions[value.type], value))
})

export const mergeDefinitions = (units: Units, general: UnitDefinitionValues) => {
  return map(units, (_, type) => mergeDefinition(units, general, type))
}

export const mergeDefinition = (units: Units, general: UnitDefinitionValues, type: UnitType) => {
  let unit = mergeValues(units[type], general[type])
  let base = unit.base
  const merged = [type]
  while (base && !merged.includes(base)) {
    merged.push(base)
    unit = mergeValues(mergeValues(unit, units[base]), general[base])
    base = units[base].base
  }
  return unit
}

/**
 * Returns whether a given definition belongs to a given battle mode.
 */
export const isIncludedInMode = (mode: Mode, definition: { mode?: Mode }) => !definition || definition.mode === mode

/**
 * Returns unit definitions for current battle mode.
 * @param mode
 * @param definitions 
 */
export const filterUnitDefinitions = (mode: Mode, definitions: Units): Units => {
  return filter(definitions, unit => isIncludedInMode(mode, unit))
}

let unit_id = 0
/**
 * Returns a new id.
 * This is only meant for non-persisted ids because any existing ids are not considered.
 */
export const getNextId = () => ++unit_id

/**
 * Finds the base unit with a given id from a given army.
 * @param units Units to search.
 * @param id Id to find.
 */
export const findUnitById = (units: BaseCohorts | undefined, id: number): BaseCohort | undefined => {
  if (!units)
    return undefined
  let base_unit = units.reserve.find(unit => unit.id === id)
  if (base_unit)
    return base_unit
  base_unit = (flatMap(units.frontline) as BaseCohort[]).find(unit => unit ? unit.id === id : false) as BaseCohort | undefined
  if (base_unit)
    return base_unit
  base_unit = units.defeated.find(unit => unit.id === id)
  if (base_unit)
    return base_unit
  return undefined
}

export const getArmyPart = (units: CombatUnits, type: ArmyType) => {
  if (type === ArmyType.Frontline)
    return units.frontline
  if (type === ArmyType.Reserve)
    return [units.reserve]
  return [units.defeated]
}

export const getOpponent = (side: Side) => side === Side.Attacker ? Side.Defender : Side.Attacker
