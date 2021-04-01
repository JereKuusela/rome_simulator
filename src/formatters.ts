import { mapRange } from './utils'
import { Mode } from './types/definition'
import { Setting, CombatSharedSettings } from 'types'

/**
 * This file contains functions to format numbers to strings.
 */

export const hideZero = (number: number) => (number === 0 ? undefined : number)

export const addSign = (number?: number): string => {
  if (number === undefined) return ''
  if (number > 0) return '+' + String(number)
  return String(number)
}

export const addSignWithZero = (number?: number): string => {
  if (number === undefined) return ''
  if (number >= 0) return '+' + String(number)
  return String(number)
}

/**
 * Special converter for manpower. Strength multiplied by cohort size and floored down.
 */
export const toManpower = (settings: CombatSharedSettings, number?: number): string => {
  if (number === undefined) return ''
  // Higher precision round removes floating point errors.
  return String(Math.floor(0.1 * Math.round(10 * settings[Setting.CohortSize] * number)))
}

export const toMorale = (number?: number): string => {
  if (number === undefined) return ''
  // Higher precision round removes floating point errors.
  return String(Math.floor(0.01 * Math.round(10000 * number)) / 100)
}

export const strengthToValue = (settings: CombatSharedSettings, mode: Mode, number: number) => {
  if (mode === Mode.Naval) return toPercent(number)
  return toManpower(settings, number)
}

export const toMaintenance = (number?: number): string => {
  if (number === undefined) return ''
  return String(Math.floor(100 * number) / 100.0)
}

export const toNumber = (number?: number, fixed = 2): string => {
  if (number === undefined) return ''
  return String(+number.toFixed(fixed))
}

export const toMultiplier = (number?: number, fixed = 2): string => {
  if (number === undefined) return ''
  return 'x' + toNumber(number, fixed)
}

export const toPercent = (number?: number, fixed = 2): string => {
  if (number === undefined) return ''
  return toNumber(100 * number, fixed) + '%'
}
const multipliers = mapRange(10, value => Math.pow(10, value))
export const toFlooredPercent = (number?: number, decimals = 2): string => {
  if (number === undefined) return ''
  return Math.floor(multipliers[decimals + 2] * number) / multipliers[decimals] + '%'
}
export const toSignedPercent = (number?: number, fixed = 2): string => {
  if (number === undefined) return ''
  const value = +(number * 100.0).toFixed(fixed)
  if (value >= 0) return '+' + String(value) + '%'
  return String(value) + '%'
}
