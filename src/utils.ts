import { fromJS, Seq, List, OrderedMap, OrderedSet } from 'immutable'
import { Participant } from './store/utils';
import { Unit, UnitDefinition, UnitType } from './store/units/actions'
import { mergeValues, DefinitionType } from './base_definition'
import { getDefaultUnits } from './store/units/data';

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

export const toList = <T>(item: T) => List<T>().push(item)

export const mergeArmy = (participant: Participant, army: List<Unit | undefined>): List<any> => {
  return army.map(value => value && mergeValues(mergeValues(participant.units.get(value.type), value), participant.global))
}

export const filterByMode = (mode: DefinitionType, definition: { mode: DefinitionType }) => definition.mode === DefinitionType.Global || definition.mode === mode

export const filterUnits = (mode: DefinitionType, units?: OrderedMap<UnitType, UnitDefinition>): OrderedMap<UnitType, UnitDefinition> => {
  units = units || getDefaultUnits()
  return units.filter(unit => filterByMode(mode, unit))
}

export const getKeys = <T>(map: OrderedMap<T, any>): OrderedSet<T> => map.keySeq().toOrderedSet()
