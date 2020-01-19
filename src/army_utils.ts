import { BaseUnit, UnitDefinition, UnitDefinitionValues, UnitDefinitionValue } from './store/units/actions'
import { DefinitionType } from './base_definition'
import { BaseUnits, Units, ArmyType, Side } from './store/battle'
import { UnitDefinitions } from './store/units'
import { filter, map } from './utils';
import { CombatUnits } from './combat/combat';
import { mergeValues } from './definition_values';

/**
 * Merges base units with their definitions resulting in real units.
 * @param units Base units to merge. 
 * @param definitions Definitions to merge.
 */
export const mergeBaseUnitsWithDefinitions = (units: BaseUnits, definitions: UnitDefinitions): Units => ({
  frontline: units.frontline.map(value => value && mergeValues(definitions[value.type], value)),
  reserve: units.reserve.map(value => value && mergeValues(definitions[value.type], value)),
  defeated: units.defeated.map(value => value && mergeValues(definitions[value.type], value))
})

export const mergeDefinitions = (global: UnitDefinition, units: UnitDefinitions, general: UnitDefinitionValues) => {
  return map(units, (definition, type) => mergeValues(mergeValues(definition, global), general[type]))
}

export const mergeDefinition = (global: UnitDefinition, unit: UnitDefinition, general: UnitDefinitionValue) => {
  return mergeValues(mergeValues(unit, global), general)
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
export const filterUnitDefinitions = (mode: DefinitionType, definitions: UnitDefinitions): UnitDefinitions => {
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
export const findUnitById = (units: BaseUnits | undefined, id: number): BaseUnit | undefined => {
  if (!units)
    return undefined
  let base_unit = units.reserve.find(unit => unit.id === id)
  if (base_unit)
    return base_unit
  base_unit = units.frontline.find(unit => unit ? unit.id === id : false) as BaseUnit | undefined
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
