import { fromJS, Seq, List, OrderedMap, OrderedSet, Map } from 'immutable'

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

/**
 * Simple round function.
 * @param number 
 */
export const round = (number: number, precision: number): number => Math.round(precision * number) / precision
