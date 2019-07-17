import { fromJS, Seq, List } from 'immutable'
import { Participant } from './store/utils';
import { Unit } from './store/units/actions';
import { mergeValues } from './base_definition';

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
