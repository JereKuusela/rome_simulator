import { List, OrderedMap, Map } from 'immutable'
import { Army } from './store/utils';
import { BaseUnit, UnitDefinition, UnitType, Unit, UnitDefinitions } from './store/units/actions'
import { mergeValues, DefinitionType } from './base_definition'
import { getDefaultUnits } from './store/units/data'
import { BaseUnits, Units } from './store/battle'

/**
 * Merges units to their definitions resulting in current units.
 * @param participant 
 * @param army 
 */
export const mergeArmy = (participant: Army, army: List<BaseUnit | undefined>): List<Unit | undefined> => {
  return army.map(value => value && mergeValues(mergeValues(participant.units.get(value.type), value), participant.global))
}

export const getFrontline = (participant: Army): List<Unit | undefined> => {
  return participant.frontline.map(value => value && mergeUnits(participant.units, participant.global, value))
}

export const getReserve = (participant: Army): List<Unit> => {
  return participant.reserve.map(value => mergeUnits(participant.units, participant.global, value))
}

export const getDefeated = (participant: Army): List<Unit> => {
  return participant.defeated.map(value => mergeUnits(participant.units, participant.global, value))
}

export const mergeUnits = (units: Map<UnitType, UnitDefinition>, global: UnitDefinition, unit: BaseUnit): Unit => (
  mergeValues(mergeValues(units.get(unit.type), unit), global) as Unit
)


/**
 * Merges base units with their definitions resulting in real units.
 * @param units Base units to merge. 
 * @param definitions Definitions to merge.
 */
export const mergeBaseUnitsWithDefinitions = (units: BaseUnits, definitions: UnitDefinitions): Units => ({
  frontline: units.frontline.map(value => value && mergeValues(definitions.get(value.type), value)),
  reserve: units.reserve.map(value => value && mergeValues(definitions.get(value.type), value)),
  defeated: units.defeated.map(value => value && mergeValues(definitions.get(value.type), value))
})

/**
 * Returns whether a given definition belongs to a given battle mode.
 */
export const isIncludedInMode = (mode: DefinitionType, definition: { mode: DefinitionType }) => definition.mode === DefinitionType.Global || definition.mode === mode

/**
 * Returns unit defnitions for current battle mode.
 * @param mode
 * @param definitions 
 */
export const filterUnitDefinitions = (mode: DefinitionType, definitions?: OrderedMap<UnitType, UnitDefinition>): OrderedMap<UnitType, UnitDefinition> => {
  definitions = definitions || getDefaultUnits()
  return definitions.filter(unit => isIncludedInMode(mode, unit))
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
  base_unit = units.frontline.find(unit => unit ? unit.id === id : false)
  if (base_unit)
    return base_unit
  base_unit = units.defeated.find(unit => unit.id === id)
  if (base_unit)
    return base_unit
  return undefined
}
