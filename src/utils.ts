import { fromJS, Seq, List, OrderedMap, OrderedSet, Map } from 'immutable'
import { Army } from './store/utils';
import { BaseUnit, UnitDefinition, UnitType, Unit, UnitDefinitions } from './store/units/actions'
import { mergeValues, DefinitionType } from './base_definition'
import { getDefaultUnits } from './store/units/data'
import { BaseUnits, Units } from './store/battle'

/**
 * Maps a range to a list.
 * @param length Length of the range.
 * @param func Callback function to create the list from an index.
 */
export const mapRange = <T>(length: number, func: (number: number) => T): T[] => {
  const array: T[] = Array(length)
  for (let i = 0; i < length; i++) {
    array[i] = func(i)
  }
  return array
}

/**
 * Converts JS structure to immutable Lists and objects.
 * Default implementation converts objects to Maps.
 * @param data Data to convert.
 */
export const listFromJS = <T>(data: T) => {
  return fromJS(data, (_, sequence) => {
    if (sequence instanceof Seq.Indexed)
      return sequence.toList()
    return sequence.toObject()
  })
}

/**
 * Converts JS structure to immutable Lists and objects.
 * Default implementation converts objects to Maps.
 * @param data Data to convert.
 */
export const orderedMapFromJS = <T>(data: T) => {
  return fromJS(data, (_, sequence) => {
    if (sequence instanceof Seq.Indexed)
      return sequence.toList()
    return sequence.toOrderedMap()
  })
}

/**
 * Converts an item to a list with that item.
 * @param item 
 */
export const toList = <T>(item: T) => List<T>().push(item)

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

/**
 * Returns keys of a map.
 * @param map 
 */
export const getKeys = <T>(map: OrderedMap<T, any>): OrderedSet<T> => map.keySeq().toOrderedSet()

/**
 * Sums numbers in a map. Keys are ignored.
 * @param map
 * @param converter Optional converted to sum complex attributes.
 */
export const sumMap = (map: Map<any, any>, converter?: (value: any) => number): number => map.reduce((previous, current) => previous + (converter ? converter(current) : Number(current)), 0)


/**
 * Sums numbers in a list.
 * @param list
 * @param converter Optional converted to sum complex attributes.
 */
export const sumList = (map: List<any>, converter?: (value: any) => number): number => map.reduce((previous, current) => previous + (converter ? converter(current) : Number(current)), 0)


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

/**
 * Simple round function.
 * @param number 
 */
export const round = (number: number, precision: number): number => Math.round(precision * number) / precision
