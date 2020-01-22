import { mapRange } from './utils'
import { DefinitionType } from './base_definition'

/**
 * This file contains functions to format numbers to strings.
 */

export const hideZero = (number: number) => number === 0 ? undefined : number

export const addSign = (number?: number): string => {
  if (number === undefined)
    return ''
  if (number > 0)
    return '+' + String(number)
  return String(number)
}

export const addSignWithZero = (number?: number): string => {
  if (number === undefined)
    return ''
  if (number >= 0)
    return '+' + String(number)
  return String(number)
}

 /**
  * Special converter for manpower. Strength multiplied by 1000 and floored down.
  */
export const toManpower = (number?: number): string => {
  if (number === undefined)
    return ''
  return String(Math.floor(1000 * number))
}

export const strengthToValue = (mode: DefinitionType, number: number) => {
  if (mode === DefinitionType.Naval)
    return toPercent(number)
  return toManpower(number)
}

export const toMaintenance = (number?: number): string => {
  if (number === undefined)
    return ''
  return String(Math.floor(100 * number) / 100.0)
}

export const toNumber = (number?: number, fixed: number = 2): string => {
  if (number === undefined)
    return ''
  return String(+(number).toFixed(fixed))
}

export const toPercent = (number?: number, fixed: number = 2): string => {
  if (number === undefined)
    return ''
  return toNumber(100 * number, fixed) + '%'
}
const multipliers = mapRange(10, value => Math.pow(10, value))
export const toFlooredPercent = (number?: number, decimals: number = 2): string => {
  if (number === undefined)
    return ''
  return Math.floor(multipliers[decimals + 2] * number) / multipliers[decimals] + '%'
} 
export const toSignedPercent = (number?: number): string => {
  if (number === undefined)
    return ''
  const value = +(number * 100.0).toFixed(2)
  if (value >= 0)
    return '+' + String(value) + '%'
  return String(value) + '%'
}
