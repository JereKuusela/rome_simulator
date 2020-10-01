import { toNumber, toPercent } from './formatters'
import { round, map, filter, forEach, filterKeys } from './utils'
import { merge, has, size } from 'lodash'

export enum ValuesType {
  Base = 'Base',
  Modifier = 'Modifier',
  Loss = 'Loss',
  Gain = 'Gain',
  LossModifier = 'LossModifier'
}

type BD = DefinitionValues<any>

type ValuesSub = { [key: string]: number }
type Values<S extends string> = { [key in S]: ValuesSub }

export interface DefinitionValues<S extends string> {
  baseValues?: Values<S>
  modifierValues?: Values<S>
  gainValues?: Values<S>
  lossValues?: Values<S>
  lossModifierValues?: Values<S>
}

const initValues = <S extends string>() => ({} as Values<S>)

/**
 * Merges base, modifier and loss values of given definitions. Returns the first definition (if defined), otherwise the second definition.
 * @param definition Returned definition with base values from to_merge.
 * @param toMerge Only returned if other parameter is not defined.
 */
export const mergeValues = <D1 extends BD | undefined, D2 extends BD | undefined>(definition: D1, toMerge: D2): D1 & D2 => {
  let baseValues = initValues()
  if (definition && definition.baseValues)
    merge(baseValues, definition.baseValues)
  if (toMerge && toMerge.baseValues)
    merge(baseValues, toMerge.baseValues)
  let modifierValues = initValues()
  if (definition && definition.modifierValues)
    merge(modifierValues, definition.modifierValues)
  if (toMerge && toMerge.modifierValues)
    merge(modifierValues, toMerge.modifierValues)
  let gainValues = initValues()
  if (definition && definition.gainValues)
    merge(gainValues, definition.gainValues)
  if (toMerge && toMerge.gainValues)
    merge(gainValues, toMerge.gainValues)
  let lossValues = initValues()
  if (definition && definition.lossValues)
    merge(lossValues, definition.lossValues)
  if (toMerge && toMerge.lossValues)
    merge(lossValues, toMerge.lossValues)
  let lossModifierValues = initValues()
  if (definition && definition.lossModifierValues)
    merge(lossModifierValues, definition.lossModifierValues)
  if (toMerge && toMerge.lossModifierValues)
    merge(lossModifierValues, toMerge.lossModifierValues)
  return { ...toMerge, ...definition, baseValues, modifierValues, lossValues, gainValues, lossModifierValues }
}


/**
 * Merges all values under a given key.
 */
export const shrinkValues = <D extends BD>(definition: D, key: string): D => {
  return {
    ...definition,
    baseValues: definition.baseValues && map(definition.baseValues, (_, attribute) => ({ [key]: calculateBase(definition, attribute) })),
    modifierValues: definition.modifierValues && map(definition.modifierValues, (_, attribute) => ({ [key]: calculateModifier(definition, attribute) })),
    lossModifierValues: definition.lossModifierValues && map(definition.lossModifierValues, (_, attribute) => ({ [key]: calculateLossModifier(definition, attribute) })),
    lossValues: definition.lossValues && map(definition.lossValues, (_, attribute) => ({ [key]: calculateLoss(definition, attribute) })),
    gainValues: definition.gainValues && map(definition.gainValues, (_, attribute) => ({ [key]: calculateLoss(definition, attribute) }))
  }
}

/**
 * Adds base, modifier or loss values.
 */
export const addValues = <D extends BD>(definition: D, type: ValuesType, key: string, values: [string, number][]): D => {
  if (type === ValuesType.Base)
    return { ...definition, baseValues: subAddValues(definition.baseValues, key, values) }
  if (type === ValuesType.Modifier)
    return { ...definition, modifierValues: subAddValues(definition.modifierValues, key, values) }
  if (type === ValuesType.Gain)
    return { ...definition, gainValues: subAddValues(definition.gainValues, key, values) }
  if (type === ValuesType.Loss)
    return { ...definition, lossValues: subAddValues(definition.lossValues, key, values) }
  if (type === ValuesType.LossModifier)
    return { ...definition, lossModifierValues: subAddValues(definition.lossModifierValues, key, values) }
  return definition
}

export const addValue = <D extends BD>(definition: D, type: ValuesType, key: string, attribute: string, value: number): D => {
  if (type === ValuesType.Base)
    return { ...definition, baseValues: subAddValues(definition.baseValues, key, [[attribute, value]]) }
  if (type === ValuesType.Modifier)
    return { ...definition, modifierValues: subAddValues(definition.modifierValues, key, [[attribute, value]]) }
  if (type === ValuesType.Gain)
    return { ...definition, gainValues: subAddValues(definition.gainValues, key, [[attribute, value]]) }
  if (type === ValuesType.Loss)
    return { ...definition, lossValues: subAddValues(definition.lossValues, key, [[attribute, value]]) }
  if (type === ValuesType.LossModifier)
    return { ...definition, lossModifierValues: subAddValues(definition.lossModifierValues, key, [[attribute, value]]) }
  return definition
}

export const addValuesWithMutate = <D extends BD>(definition: D, type: ValuesType, key: string, values: [string, number][]) => {
  if (type === ValuesType.Base)
    definition.baseValues = subAddValues(definition.baseValues, key, values)
  if (type === ValuesType.Modifier)
    definition.modifierValues = subAddValues(definition.modifierValues, key, values)
  if (type === ValuesType.Gain)
    definition.gainValues = subAddValues(definition.gainValues, key, values)
  if (type === ValuesType.Loss)
    definition.lossValues = subAddValues(definition.lossValues, key, values)
  if (type === ValuesType.LossModifier)
    definition.lossModifierValues = subAddValues(definition.lossModifierValues, key, values)
}

/**
 * Shared implementation for adding base, modifier or loss values.
 * @param container Base, modifier or loss values.
 * @param key Identifier for the values. Previous values get replaced.
 * @param values A list of [attribute, value] pairs.
 */
const subAddValues = <A extends string>(container: Values<A> | undefined, key: string, values: [A, number][]): Values<A> => {
  let newValues = container ? container : initValues<A>()
  for (const [attribute, value] of values) {
    if (!has(newValues, attribute) && value === 0)
      continue
    if (!has(newValues, attribute))
      newValues = { ...newValues, [attribute]: {} }
    if (value === 0 && has(newValues[attribute], key))
      newValues = { ...newValues, [attribute]: filter(newValues[attribute], (_, k) => k !== key) }
    else if (value !== 0)
      newValues = { ...newValues, [attribute]: { ...newValues[attribute], [key]: value } }
  }
  return newValues
}

/**
 * Clears base, modifier and loss values with a given key.
 */
export const clearAllValues = <D extends BD>(definition: D, key: string): D => {
  return {
    ...definition,
    baseValues: subClearValues(definition.baseValues, key),
    modifierValues: subClearValues(definition.modifierValues, key),
    gainValues: subClearValues(definition.gainValues, key),
    lossValues: subClearValues(definition.lossValues, key),
    lossModifierValues: subClearValues(definition.lossModifierValues, key)
  }
}

/**
 * Clears base, modifier and loss values with a given key.
 */
export const clearAllValuesWithMutate = <D extends BD>(definition: D, key: string) => {
  definition.baseValues = subClearValues(definition.baseValues, key)
  definition.modifierValues = subClearValues(definition.modifierValues, key)
  definition.gainValues = subClearValues(definition.gainValues, key)
  definition.lossValues = subClearValues(definition.lossValues, key)
  definition.lossModifierValues = subClearValues(definition.lossModifierValues, key)
}

/**
 * Clears base, modifier or loss values with a given key.
 */
export const clearValues = <D extends BD>(definition: D, type: ValuesType, key: string): D => {
  if (type === ValuesType.Base)
    return { ...definition, baseValues: subClearValues(definition.baseValues, key) }
  const any = definition as any
  if (type === ValuesType.Modifier)
    return { ...definition, modifierValues: subClearValues(any.modifierValues, key) }
  if (type === ValuesType.Gain)
    return { ...definition, gainValues: subClearValues(any.gainValues, key) }
  if (type === ValuesType.Loss)
    return { ...definition, lossValues: subClearValues(any.lossValues, key) }
  if (type === ValuesType.LossModifier)
    return { ...definition, lossModifierValues: subClearValues(any.lossModifierValues, key) }
  return definition
}

export const clearValuesWithMutate = <D extends BD>(definition: D, type: ValuesType, key: string) => {
  if (type === ValuesType.Base)
    definition.baseValues = subClearValues(definition.baseValues, key)
  const any = definition as any
  if (type === ValuesType.Modifier)
    definition.modifierValues = subClearValues(any.modifierValues, key)
  if (type === ValuesType.Gain)
    definition.gainValues = subClearValues(any.gainValues, key)
  if (type === ValuesType.Loss)
    definition.lossValues = subClearValues(any.lossValues, key)
  if (type === ValuesType.LossModifier)
    definition.lossModifierValues = subClearValues(any.lossModifierValues, key)
}


/**
 * Shared implementation for clearing base, modifier or loss values.
 * @param container Base, modifier or loss values.
 * @param key Identifier for the values to remove.
 */
const subClearValues = <A extends string>(container: Values<A> | undefined, key: string): Values<A> => {
  if (container)
    return map(container, attribute => filter(attribute, ((_, attributeKey) => attributeKey !== key)))
  return initValues<A>()
}

/**
 * Adds base, modifier or loss values while clearing previous ones.
 */
export const regenerateValues = <D extends BD, A extends string>(definition: D, type: ValuesType, key: string, values: [A, number][]) => {
  clearValuesWithMutate(definition, type, key)
  addValuesWithMutate(definition, type, key, values)
}

// This precision is required for accurate morale calculations.
const PRECISION = 100000.0

/**
 * Returns values of a given key.
 * @param definition 
 * @param key 
 */
export const filterValues = <D extends BD>(definition: D, key: string): D => {
  return {
    ...definition,
    baseValues: subFilterValues(definition.baseValues, key),
    modifierValues: subFilterValues(definition.modifierValues, key),
    gainValues: subFilterValues(definition.gainValues, key),
    lossValues: subFilterValues(definition.lossValues, key),
    lossModifierValues: subFilterValues(definition.lossModifierValues, key)
  }
}

const subFilterValues = (values: Values<any> | undefined, filterKey: string) => values && map(values, attribute => filterKeys(attribute, key => key === filterKey))

/**
 * Calculates the value of an attribute. Includes base, modifier and loss values.
 * @param definition 
 * @param attribute 
 */
export const calculateValue = <D extends BD, A extends string>(definition: D | undefined, attribute: A): number => {
  if (!definition)
    return 0.0
  let value = calculateBase(definition, attribute) * (1 + calculateModifier(definition, attribute)) * (1 - calculateLossModifier(definition, attribute)) - calculateLoss(definition, attribute)
  return round(value, PRECISION)
}

/**
 * Calculates the value of an attribute, without losses.
 * @param definition 
 * @param attribute 
 */
export const calculateValueWithoutLoss = <D extends BD, A extends string>(definition: D | undefined, attribute: A): number => {
  if (!definition)
    return 0.0
  let value = calculateBase(definition, attribute) * (1 + calculateModifier(definition, attribute)) + calculateGain(definition, attribute)
  return round(value, PRECISION)
}

/**
 * Calculates the base value of an attribute.
 * @param definition 
 * @param attribute 
 */
export const calculateBase = <D extends BD, A extends string>(definition: D, attribute: A): number => calculateValueSub(definition.baseValues, attribute)

/**
 * Calculates the modifier value of an attribute.
 * @param definition 
 * @param attribute 
 */
export const calculateModifier = <D extends BD, A extends string>(definition: D, attribute: A): number => calculateValueSub(definition.modifierValues, attribute)

/**
 * Calculates the gain value of an attribute.
 * @param definition 
 * @param attribute 
 */
export const calculateGain = <D extends BD, A extends string>(definition: D, attribute: A): number => calculateValueSub(definition.gainValues, attribute)

/**
 * Calculates the loss value of an attribute.
 * @param definition 
 * @param attribute 
 */
export const calculateLoss = <D extends BD, A extends string>(definition: D, attribute: A): number => calculateValueSub(definition.lossValues, attribute)

/**
 * Calculates the loss modifier value of an attribute.
 * @param definition 
 * @param attribute 
 */
export const calculateLossModifier = <D extends BD, A extends string>(definition: D, attribute: A): number => calculateValueSub(definition.lossModifierValues, attribute)

/**
 * Shared implementation for calculating the value of an attribute.
 * @param container 
 * @param attribute 
 * @param initial Initial value. For example modifiers have 1.0.
 */
const calculateValueSub = <A extends string>(container: Values<A> | undefined, attribute: A): number => {
  let result = 0
  if (!container)
    return result
  const values = container[attribute]
  if (values)
    forEach(values, value => result += value)
  return round(result, PRECISION)
}

/**
 * Shared implementation to get values. Zero is returned for missing values because values with zero are not stored.
 * @param container 
 * @param attribute 
 * @param key 
 */
export const getValue = <D extends BD, A extends string>(type: ValuesType, definition: D, attribute: A, key: string): number => {
  const container = getContainer(type, definition)
  const values = container[attribute]
  if (!values)
    return 0.0
  const value = values[key]
  if (!value)
    return 0.0
  return value
}

const getContainer = <D extends BD, A extends string>(type: ValuesType, definition: D): Values<A> => {
  if (type === ValuesType.Modifier)
    return definition.modifierValues ?? {}
  if (type === ValuesType.Gain)
    return definition.gainValues ?? {}
  if (type === ValuesType.Loss)
    return definition.lossValues ?? {}
  if (type === ValuesType.LossModifier)
    return definition.lossModifierValues ?? {}
  return definition.baseValues ?? {}
}

/**
 * Returns a short explanations of a given attribute. Only checks base values.
 * @param definition 
 * @param attribute 
 */
export const explainShort = <D extends BD, A extends string>(definition: D, attribute: A): string => {
  if (!definition.baseValues)
    return ''
  const valueBase = definition.baseValues[attribute]
  let explanation = ''
  if (valueBase) {
    forEach(valueBase, (value, key) => explanation += key.replace(/_/g, ' ') + ': ' + value + ', ')
    explanation = explanation.substring(0, explanation.length - 2)
  }
  return explanation
}

/**
 * Returns an explanation of a given attribute.
 * @param definition 
 * @param attribute 
 */
export const explain = <D extends BD, A extends string>(definition: D, attribute: A): string => {
  const valueModifier = definition.modifierValues ? definition.modifierValues[attribute] : undefined
  const valueGain = definition.gainValues ? definition.gainValues[attribute] : undefined
  const valueLoss = definition.lossValues ? definition.lossValues[attribute] : undefined
  const valueLossModifier = definition.lossModifierValues ? definition.lossModifierValues[attribute] : undefined
  if ((!valueModifier || size(valueModifier) === 0) && (!valueGain || size(valueGain) === 0) && (!valueLoss || size(valueLoss) === 0) && (!valueLossModifier || size(valueLossModifier) === 0))
    return explainShort(definition, attribute)
  let explanation = ''
  let base = 0
  const valueBase = definition.baseValues ? definition.baseValues[attribute] : undefined
  if (valueBase) {
    forEach(valueBase, value => base += value)
    if (size(valueBase) === 0)
      explanation += 'Base value 0'
    else if (size(valueBase) === 1)
      explanation += ''
    else
      explanation += 'Base value ' + +(base).toFixed(2) + ' ('
    forEach(valueBase, (value, key) => explanation += key.replace(/_/g, ' ') + ': ' + value + ', ')
    if (size(valueBase) > 0)
      explanation = explanation.substring(0, explanation.length - 2)
    if (size(valueBase) > 1)
      explanation += ')'
  }
  let modifier = 1.0
  if (valueModifier)
    forEach(valueModifier, value => modifier += value)
  if (valueModifier && size(valueModifier) > 0) {
    explanation += ' multiplied by ' + toPercent(modifier)
    explanation += ' ('
    forEach(valueModifier, (value, key) => explanation += key.replace(/_/g, ' ') + ': ' + toPercent(value) + ', ')
    explanation = explanation.substring(0, explanation.length - 2) + ')'
  }
  const value = calculateValue(definition, attribute)
  const baseValue = calculateValueWithoutLoss(definition, attribute)
  const loss = baseValue - value
  const gain = calculateGain(definition, attribute)
  if (size(valueGain) > 0) {
    explanation += ' increased by ' + +(gain).toFixed(2)
    explanation += ' ('
    if (valueGain)
      forEach(valueGain, (value, key) => explanation += key.replace(/_/g, ' ') + ': ' + toNumber(value) + ', ')
    explanation = explanation.substring(0, explanation.length - 2) + ')'

  }
  if ((size(valueLoss) + size(valueLossModifier)) > 0) {
    explanation += ' reduced by losses ' + +(loss).toFixed(2)
    explanation += ' ('
    if (valueLoss)
      forEach(valueLoss, (value, key) => explanation += key.replace(/_/g, ' ') + ': ' + toNumber(value) + ', ')
    if (valueLossModifier)
      forEach(valueLossModifier, (value, key) => explanation += key.replace(/_/g, ' ') + ': ' + toPercent(value) + ', ')
    explanation = explanation.substring(0, explanation.length - 2) + ')'
  }
  return explanation
}
