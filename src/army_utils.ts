import { BaseCohorts, Cohorts, DefinitionType, Unit, UnitDefinitionValue, UnitDefinitionValues, BaseCohort, ArmyType, Side, Units } from 'types'
import { mergeValues } from 'definition_values'
import { map, filter } from 'utils'
import { CombatUnits } from 'combat'

/**
 * Merges base units with their definitions resulting in real units.
 * @param units Base units to merge. 
 * @param definitions Definitions to merge.
 */
export const mergeBaseUnitsWithDefinitions = (units: BaseCohorts, definitions: Units): Cohorts => ({
  frontline: units.frontline.map(value => value && mergeValues(definitions[value.type], value)),
  reserve: units.reserve.map(value => value && mergeValues(definitions[value.type], value)),
  defeated: units.defeated.map(value => value && mergeValues(definitions[value.type], value))
})

export const mergeDefinitions = (base: Unit, definitions: Units, general_base: UnitDefinitionValue, general: UnitDefinitionValues) => {
  return map(definitions, (definition, type) => mergeValues(mergeValues(definition, base), mergeValues(general_base, general[type])))
}

export const mergeDefinition = (base: Unit, unit: Unit, general_base: UnitDefinitionValue, general: UnitDefinitionValue) => {
  return mergeValues(mergeValues(unit, base), mergeValues(general_base, general))
}

/**
 * Returns whether a given definition belongs to a given battle mode.
 */
export const isIncludedInMode = (mode: DefinitionType, definition: { mode: DefinitionType }) => definition.mode === DefinitionType.Global || definition.mode === mode

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
  base_unit = units.frontline.find(unit => unit ? unit.id === id : false) as BaseCohort | undefined
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
    return units.reserve
  return units.defeated
}

export const getOpponent =  (side: Side) => side === Side.Attacker ? Side.Defender : Side.Attacker
