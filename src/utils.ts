/* eslint-disable @typescript-eslint/no-explicit-any */
import EmptyIcon from './images/empty.png'
import UnknownIcon from './images/unknown.png'

/**
 * Returns the image of a definition while handling missing cases.
 * Question mark is returned for existing definitions without an image.
 * Empty is returned for non-existing definitions.
 * @param definition
 */
export const getImage = (definition: { image?: string } | null): string =>
  (definition && definition.image) || (definition ? UnknownIcon : EmptyIcon)

/**
 * Wraps a given item into an array if it's not an array already.
 * @param item
 */
export function arrayify<T>(item: T[] | undefined): T[]
export function arrayify<T>(item: T): Exclude<T, undefined>[]
export function arrayify<T>(item: T) {
  return item ? (Array.isArray(item) ? item : [item]) : []
}

/**
 * Maps a range to a list.
 * @param length Length of the range.
 * @param func Callback function to create the list from an index.
 */
export const mapRange = <T>(length: number, func: (number: number) => T): T[] => {
  const array: T[] = Array(Math.max(0, length))
  for (let i = 0; i < length; i++) {
    array[i] = func(i)
  }
  return array
}

export const noZero = (value: number) => (value ? value : 1.0)

export const randomWithinRange = (min: number, max: number) => min + Math.random() * (max - min)

/**
 * Sums numbers in a list.
 * @param list
 * @param converter Optional converted to sum complex attributes.
 */
export const sumArr = <T>(arr: T[], converter?: (value: T) => number): number =>
  arr.reduce((previous, current) => previous + (converter ? converter(current) : Number(current)), 0)

/**
 * Sums numbers in a object.
 * @param sumObj
 * @param converter Optional converted to sum complex attributes.
 */
export const sumObj = (object: Record<string, number>, converter?: (value: any) => number): number =>
  Object.values(object).reduce((previous, current) => previous + (converter ? converter(current) : Number(current)), 0)

export const showProgress = (text: string, updates: number, dots: number) =>
  '\u00a0'.repeat(updates % dots) + text + '.'.repeat(updates % dots)

/**
 * Simple round function.
 * @param number
 */
export const round = (number: number, precision: number): number => Math.round(precision * number) / precision

export function arrGet<V>(arr: V[], index: number): V | undefined
export function arrGet<V1, V2>(arr: V1[], index: number, initial: V2 | undefined): V1 & V2
export function arrGet<V1, V2>(arr: V1[], index: number, initial?: V2) {
  if (index < 0) index = arr.length + index
  if (index < 0 || index >= arr.length) return initial
  return arr[index]
}

export const multiplyChance = (chance1?: number, chance2?: number) =>
  chance1 && chance2
    ? 1 - (1 - Math.max(0, chance1)) * (1 - Math.max(0, chance2))
    : chance1
    ? chance1
    : chance2
    ? chance2
    : 0

export const keys = <K extends string>(object: Record<K, any> | undefined) =>
  object ? (Object.keys(object) as K[]) : []
const entries = <K extends string, V>(object: Record<K, V>) => Object.entries(object) as [K, V][]
export const values = <V>(object: Record<string, V>) => Object.values(object) as V[]

export const map = <K extends string, V, R>(object: Record<K, V>, callback: (item: V, key: K) => R): Record<K, R> =>
  Object.assign({}, ...entries(object).map(([k, v]) => ({ [k]: callback(v, k) })))

export const forEach2 = <K extends string, V, R>(
  object: Record<K, Record<K, V>>,
  callback: (item: V, row: K, column: K) => R
): void => forEach(object, (sub, row) => forEach(sub, (item, column) => callback(item, row, column)))
export const forEach = <K extends string, V, R>(object: Record<K, V>, callback: (item: V, key: K) => R): void =>
  entries(object).forEach(([k, v]) => callback(v, k))
export const every = <K extends string, V>(object: Record<K, V>, callback: (item: V, key: K) => any): boolean => {
  let ret = true
  entries(object).forEach(([k, v]) => (ret = !!callback(v, k) && ret))
  return ret
}

export const excludeMissing = <T>(arr: T[]): Exclude<T, null | undefined>[] =>
  arr.filter(item => item) as Exclude<T, null | undefined>[]

export const filter = <K extends string, V>(object: Record<K, V>, callback?: (item: V, key: K) => any): Record<K, V> =>
  Object.assign(
    {},
    ...entries(object)
      .filter(([k, v]) => (callback ? callback(v, k) : object[k]))
      .map(([k, v]) => ({ [k]: v }))
  )
export const filterKeys = <K extends string, V>(object: Record<K, V>, callback?: (key: K) => any): Record<K, V> =>
  Object.assign(
    {},
    ...entries(object)
      .filter(([k, v]) => (callback ? callback(k) : v))
      .map(([k, v]) => ({ [k]: v }))
  )

export function toArr<K extends string, V>(object: Record<K, V>): V[]
export function toArr<K extends string, V, R>(object: Record<K, V>, callback: (value: V, key: K) => R): R[]
export function toArr<K extends string, V, R>(object: Record<K, V>, callback?: (value: V, key: K) => R): (R | V)[] {
  return entries(object).map(([k, v]) => (callback ? callback(v, k) : v))
}

export function mapKeys<K extends string>(object: Record<K, any>): K[]
export function mapKeys<K extends string, R>(object: Record<K, any>, callback: (key: K) => R): R[]
export function mapKeys<K extends string, R>(object: Record<K, any>, callback?: (key: K) => R): (K | R)[] {
  return keys(object).map(key => (callback ? callback(key) : key))
}

export function reduce<V>(object: Record<string, V>, callback: (previous: V, current: V) => V): V
export function reduce<V, R>(object: Record<string, V>, callback: (previous: R, current: V) => R, initial: R): R
export function reduce<V, R>(object: Record<string, V>, callback: (previous: R, current: V) => R, initial?: R): R {
  return values(object).reduce(callback, initial as R)
}

export function reduceKeys<K extends string>(object: Record<K, any>, callback: (previous: K, current: K) => K): K
export function reduceKeys<K extends string, R>(
  object: Record<K, any>,
  callback: (previous: R, current: K) => R,
  initial: R
): R
export function reduceKeys<K extends string, R>(
  object: { [key in K]: any },
  callback: (previous: R, current: K) => R,
  initial?: R
): R {
  return keys(object).reduce(callback, initial as R)
}

export function toObj<K extends string, V>(arr: V[], key: (value: V, index: number) => K): Record<K, V>
export function toObj<K extends string, V, R>(
  arr: V[],
  key: (value: V, index: number) => K,
  value: (value: V, index: number) => R
): Record<K, R>
export function toObj<K extends string, V, R>(
  arr: V[],
  key: (value: V, index: number) => K,
  value: (value: V, index: number) => R = value => (value as any) as R
): Record<K, R> {
  return Object.assign({}, ...arr.map((v, i) => ({ [key(v, i)]: value(v, i) })))
}

export type ObjSet<K extends string = string> = Record<K, true>

export const toSet = <V, R extends string>(object: Record<string, V>, key: (value: V) => R): ObjSet<R> =>
  Object.assign({}, ...values(object).map(v => ({ [key(v)]: true })))

export const merge = <K extends string, V>(object1: Record<K, V>, object2: Record<K, V>): Record<K, V> => ({
  ...object1,
  ...object2
})

export const removeUndefined = (object: { [key: string]: any }) =>
  Object.keys(object).forEach(key => object[key] === undefined && delete object[key])

export function resize<V>(arr: (V | undefined)[], size: number): (V | undefined)[]
export function resize<V>(arr: (V | undefined)[], size: number, defaultValue: V): V[]
export function resize<V>(arr: (V | undefined)[], size: number, defaultValue?: V): (V | undefined)[] {
  const ret = arr.slice(0, size)
  while (size > ret.length) ret.push(defaultValue)
  return ret
}
