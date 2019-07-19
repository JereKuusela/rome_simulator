/**
 * This file contains functions to format numbers to strings.
 */

export const hideZero = (number: number) => number === 0 ? undefined : number

export const addSign = (number?: number): string => {
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

export const toMaintenance = (number: number, show_zero: boolean = true): string => (number === 0 && !show_zero) ? '' : String(Math.floor(100 * number) / 100.0)

export const toNumber = (number?: number): string => {
  if (number === undefined)
    return ''
  return String(+(number).toFixed(2))
}

export const toPercent = (number?: number): string => {
  if (number === undefined)
    return ''
  return toNumber(100 * number) + '%'
}

export const toRelativePercent = (number?: number): string => {
  if (number === undefined)
    return ''
  const value = +(number * 100.0 - 100.0).toFixed(2)
  if (value >= 0)
    return '+' + String(value) + '%'
  return String(value) + '%'
}

export const toRelativeZeroPercent = (number?: number): string => {
  if (number === undefined)
    return ''
  const value = +(number * 100.0).toFixed(2)
  if (value >= 0)
    return '+' + String(value) + '%'
  return String(value) + '%'
}
