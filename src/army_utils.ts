import { BaseCohorts, Cohorts, DefinitionType, UnitDefinitionValue, UnitDefinitionValues, BaseCohort, ArmyType, Side, Units, UnitType } from 'types'
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

export const mergeDefinitions = (definitions: Units, general_base: UnitDefinitionValue, general: UnitDefinitionValues) => {
  return map(definitions, (_, type) => mergeDefinition(definitions, general_base, general, type))
}

export const mergeDefinition = (definitions: Units, general_base: UnitDefinitionValue, general: UnitDefinitionValues, type: UnitType) => {
  let unit = definitions[type]
  let base = unit.base
  const merged = [type]
  while (base && !merged.includes(base)) {
    merged.push(base)
    unit = mergeValues(unit, definitions[base])
    base = definitions[base].base
  }
  return mergeValues(unit, mergeValues(general_base, general[type]))
}

/**
 * Returns whether a given definition belongs to a given battle mode.
 */
export const isIncludedInMode = (mode: DefinitionType, definition: { mode?: DefinitionType }) => !definition || definition.mode === DefinitionType.Global || definition.mode === mode

/**
 * Returns unit definitions for current battle mode.
 * @param mode
 * @param definitions 
 */
export const filterUnitDefinitions = (mode: DefinitionType, definitions: Units): Units => {
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
