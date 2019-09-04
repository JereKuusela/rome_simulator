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
  return key !== undefined && has(object, key) ? object[key] : initial
}

export const keys = <K extends string> (object: { [key in K]: any}) => Object.keys(object) as K[]
const entries = <K extends string, V> (object: { [key in K]: V}) => Object.entries(object) as [K, V][]
const values = <V> (object: { [key: string]: V}) => Object.values(object) as V[]

export const map = <K extends string, V, R>(object: { [key in K]: V}, callback: (item: V, key: K) => R): { [key in K]: R} => Object.assign({}, ...keys(object).map(k => ({ [k]: callback(object[k], k) })))

export const filter = <K extends string, V>(object: { [key in K]: V}, callback?: (item: V, key: K) => any): { [key in K]: V} => Object.assign({}, ...keys(object).filter(k => callback ? callback(object[k], k) : object[k]).map(k => ({ [k]: object[k] })))
export const filterKeys = <K extends string, V>(object: { [key in K]: V}, callback?: (key: K) => any): { [key in K]: V} => Object.assign({}, ...keys(object).filter(k => callback ? callback(k) : object[k]).map(k => ({ [k]: object[k] })))


export function toArr<K extends string, V>(object: { [key in K]: V}): V[]
export function toArr<K extends string, V, R>(object: { [key in K]: V}, callback: (value: V, key: K) => R): R[]
export function toArr<K extends string, V, R>(object: { [key in K]: V}, callback?: (value: V, key: K) => R): (R | V)[]
{
  return entries(object).map(([key, value]) => callback ? callback(value, key) : value)
}

export function mapKeys<K extends string>(object: { [key in K]: any}): K[]
export function mapKeys<K extends string, R>(object: { [key in K]: any}, callback: (key: K) => R): R[]
export function mapKeys<K extends string, R>(object: { [key in K]: any}, callback?: (key: K) => R): (K | R)[]
{
  return keys(object).map(key => callback ? callback(key) : key)
}

export function reduce<V>(object: { [key: string]: V }, callback: (previous: V, current: V) => V): V
export function reduce<V, R>(object: { [key: string]: V }, callback: (previous: R, current: V) => R, initial: R): R
export function reduce<V, R>(object: { [key: string]: V }, callback: (previous: R, current: V) => R, initial?: R): R
{
  return values(object).reduce(callback, initial as R)
}

export function reduceKeys<K extends string>(object: { [key in K]: any }, callback: (previous: K, current: K) => K): K
export function reduceKeys<K extends string, R>(object: { [key in K]: any }, callback: (previous: R, current: K) => R, initial: R): R
export function reduceKeys<K extends string, R>(object: { [key in K]: any }, callback: (previous: R, current: K) => R, initial?: R): R
{
  return keys(object).reduce(callback, initial as R)
}

export const toObj = <K extends string, V>(arr: V[], key: (value: V) => K): { [key in K]: V} => Object.assign({}, ...arr.map(v => ({ [key(v)]: v })))

export const toSet = <V, R extends string>(object: { [key: string]: V}, key: (value: V) => R): { [key in R]: true } => Object.assign({}, ...values(object).map(v => ({ [key(v)]: true })))

export const merge = <K extends string, V>(object1: { [key in K]: V }, object2: { [key in K]: V }): { [key in K]: V} => ({ ...object1, ...object2 })

export const has = <K extends string>(object: { [key in K]: any}, key: K ): boolean => object.hasOwnProperty(key)

export type ObjSet<K extends string = string> = {
  [key in K]: true
}
