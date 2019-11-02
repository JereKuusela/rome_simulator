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
 * Sums numbers in a list.
 * @param list
 * @param converter Optional converted to sum complex attributes.
 */
export const sumArr = (arr: any[], converter?: (value: any) => number): number => arr.reduce((previous, current) => previous + (converter ? converter(current) : Number(current)), 0)

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

export function arrGet<V>(arr: V[], index: number): V | undefined
export function arrGet<V1, V2>(arr: V1[], index: number, initial: V2 | undefined): V1 & V2
export function arrGet<V1, V2>(arr: V1[], index: number, initial?: V2)
{
  if (index < 0)
    index = arr.length + index
  if (index < 0 || index >= arr.length)
    return initial
  return arr[index]
}



export const keys = <K extends string> (object: { [key in K]: any}) => Object.keys(object) as K[]
const entries = <K extends string, V> (object: { [key in K]: V}) => Object.entries(object) as [K, V][]
export const values = <V> (object: { [key: string]: V}) => Object.values(object) as V[]

export const map = <K extends string, V, R>(object: { [key in K]: V}, callback: (item: V, key: K) => R): { [key in K]: R} => Object.assign({}, ...entries(object).map(([k ,v]) => ({ [k]: callback(v, k) })))

export const forEach = <K extends string, V, R>(object: { [key in K]: V}, callback: (item: V, key: K) => R): void => entries(object).forEach(([k ,v]) => callback(v, k))
export const every = <K extends string, V, R>(object: { [key in K]: V}, callback: (item: V, key: K) => any): boolean => {
  let ret = true 
  entries(object).forEach(([k ,v]) => ret = !!callback(v, k) && ret)
  return ret
}

export const filter = <K extends string, V>(object: { [key in K]: V}, callback?: (item: V, key: K) => any): { [key in K]: V} => Object.assign({}, ...entries(object).filter(([k ,v]) => callback ? callback(v, k) : object[k]).map(([k ,v]) => ({ [k]: v })))
export const filterKeys = <K extends string, V>(object: { [key in K]: V}, callback?: (key: K) => any): { [key in K]: V} => Object.assign({}, ...entries(object).filter(([k ,v]) => callback ? callback(k) : v).map(([k ,v]) => ({ [k]: v })))


export function toArr<K extends string, V>(object: { [key in K]: V}): V[]
export function toArr<K extends string, V, R>(object: { [key in K]: V}, callback: (value: V, key: K) => R): R[]
export function toArr<K extends string, V, R>(object: { [key in K]: V}, callback?: (value: V, key: K) => R): (R | V)[]
{
  return entries(object).map(([k, v]) => callback ? callback(v, k) : v)
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

export function toObj<K extends string | number, V>(arr: V[], key: (value: V, index: number) => K): { [key in K]: V}
export function toObj<K extends string | number, V, R>(arr: V[], key: (value: V, index: number) => K, value: (value: V, index: number) => R): { [key in K]: R}
export function toObj<K extends string | number, V, R>(arr: V[], key: (value: V, index: number) => K, value: (value: V, index: number) => R = ((value) => value as any as R)): { [key in K]: R}
{
  return Object.assign({}, ...arr.map((v, i) => ({ [key(v, i)]: value(v, i) })))
}

export const toSet = <V, R extends string>(object: { [key: string]: V}, key: (value: V) => R): { [key in R]: true } => Object.assign({}, ...values(object).map(v => ({ [key(v)]: true })))

export const merge = <K extends string, V>(object1: { [key in K]: V }, object2: { [key in K]: V }): { [key in K]: V} => ({ ...object1, ...object2 })

export const has = <K extends string>(object: { [key in K]: any}, key: K ): boolean => object.hasOwnProperty(key)

export type ObjSet<K extends string = string> = {
  [key in K]: true
}

export function resize<V>(arr: (V | undefined)[], size: number): (V | undefined)[]
export function resize<V>(arr: (V | undefined)[], size: number, defaultValue: V): V[]
export function resize<V>(arr: (V | undefined)[], size: number, defaultValue?: V): (V | undefined)[] {
  const ret = arr.slice(0, size)
  while(size > ret.length)
    ret.push(defaultValue)
  return ret
}
