import { fromJS, Seq, List, OrderedMap, OrderedSet, Map } from 'immutable'
import { Army } from './store/utils';
import { Unit, UnitDefinition, UnitType } from './store/units/actions'
import { mergeValues, DefinitionType } from './base_definition'
import { getDefaultUnits } from './store/units/data'
import { Units } from './store/battle';

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

export const toList = <T>(item: T) => List<T>().push(item)

export const mergeArmy = (participant: Army, army: List<Unit | undefined>): List<any> => {
  return army.map(value => value && mergeValues(mergeValues(participant.units.get(value.type), value), participant.global))
}

export const filterByMode = (mode: DefinitionType, definition: { mode: DefinitionType }) => definition.mode === DefinitionType.Global || definition.mode === mode

export const filterUnits = (mode: DefinitionType, units?: OrderedMap<UnitType, UnitDefinition>): OrderedMap<UnitType, UnitDefinition> => {
  units = units || getDefaultUnits()
  return units.filter(unit => filterByMode(mode, unit))
}

export const getKeys = <T>(map: OrderedMap<T, any>): OrderedSet<T> => map.keySeq().toOrderedSet()

export const sum = (map: Map<any, number>): number => map.reduce((previous, current) => previous + current, 0)

let unit_id = 0

export const getNextId = () => ++unit_id

/**
 * Finds the base unit with a given id from a given army.
 * @param units Units to search.
 * @param id Id to find.
 */
export const findUnitById = (units: Units | undefined, id: number): Unit | undefined => {
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
