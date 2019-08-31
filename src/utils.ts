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
 * Sums numbers in a object.
 * @param sumObj
 * @param converter Optional converted to sum complex attributes.
 */
export const sumObj = (object: { [key: string]: number}, converter?: (value: any) => number): number => Object.values(object).reduce((previous, current) => previous + (converter ? converter(current) : Number(current)), 0)

/**
 * Simple round function.
 * @param number 
 */
export const round = (number: number, precision: number): number => Math.round(precision * number) / precision

export function objGet<K extends string, V>(object: { [key in K]: V}, key: K | undefined): V | undefined
export function objGet<K extends string, V>(object: { [key in K]: V}, key: K | undefined, initial: V | undefined): V
export function objGet<K extends string, V>(object: { [key in K]: V}, key: K | undefined, initial?: V)
{
  return key !== undefined && objHas(object, key) ? object[key] : initial
}

export const asd = <T, R>(object: { [key: string]: T}, callback: (item: T, key: string) => R): { [key:string]: R} => Object.assign({}, ...Object.keys(object).map(k => ({ [k]: callback(object[k], k) })));

export const objToList = <K extends string, V, R>(object: { [key in K]: V}, callback: (key: K, value: V) => R): R[] => (Object.entries(object) as [K, V][]).map(([key, value]) => callback(key, value))

export const objHas = <K extends string>(object: { [key in K]: any}, key: K ): boolean => object.hasOwnProperty(key)

export interface ObjSet {
  [key: string]: boolean
}
