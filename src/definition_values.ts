import { toPercent } from './formatters'
import { round, map, filter, forEach, filterKeys } from './utils'
import { merge, has, size } from 'lodash'

export enum ValuesType {
  Base = 'Base',
  Modifier = 'Modifier',
  Loss = 'Loss',
  LossModifier = 'LossModifier'
}

type BD = DefinitionValues<any>

type ValuesSub = { [key: string]: number }
type Values<S extends string> = { [key in S]: ValuesSub }

export interface DefinitionValues<S extends string> {
  base_values?: Values<S>
  modifier_values?: Values<S>
  loss_values?: Values<S>
  loss_modifier_values?: Values<S>
}

const initValues = <S extends string>() => ({} as Values<S>)

/**
 * Merges base, modifier and loss values of given definitions. Returns the first definition (if defined), otherwise the second definition.
 * @param definition Returned definition with base values from to_merge.
 * @param to_merge Only returned if other parameter is not defined.
 */
export const mergeValues = <D1 extends BD | undefined, D2 extends BD | undefined>(definition: D1, to_merge: D2): D1 & D2 => {
  let base_values = initValues()
  if (definition && definition.base_values)
    merge(base_values, definition.base_values)
  if (to_merge && to_merge.base_values)
    merge(base_values, to_merge.base_values)
  let modifier_values = initValues()
  if (definition && definition.modifier_values)
    merge(modifier_values, definition.modifier_values)
  if (to_merge && to_merge.modifier_values)
    merge(modifier_values, to_merge.modifier_values)
  let loss_values = initValues()
  if (definition && definition.loss_values)
    merge(loss_values, definition.loss_values)
  if (to_merge && to_merge.loss_values)
    merge(loss_values, to_merge.loss_values)
  let loss_modifier_values = initValues()
  if (definition && definition.loss_modifier_values)
    merge(loss_modifier_values, definition.loss_modifier_values)
  if (to_merge && to_merge.loss_modifier_values)
    merge(loss_modifier_values, to_merge.loss_modifier_values)
  return { ...to_merge, ...definition, base_values, modifier_values, loss_values, loss_modifier_values }
}

/**
 * Adds base, modifier or loss values.
 */
export const addValues = <D extends BD>(definition: D, type: ValuesType, key: string, values: [string, number][]): D => {
  if (type === ValuesType.Base)
    return { ...definition, base_values: subAddValues(definition.base_values, key, values) }
  if (type === ValuesType.Modifier)
    return { ...definition, modifier_values: subAddValues(definition.modifier_values, key, values) }
  if (type === ValuesType.Loss)
    return { ...definition, loss_values: subAddValues(definition.loss_values, key, values) }
  if (type === ValuesType.LossModifier)
    return { ...definition, loss_modifier_values: subAddValues(definition.loss_modifier_values, key, values) }
  return definition
}

export const addValue = <D extends BD>(definition: D, type: ValuesType, key: string, attribute: string, value: number): D => {
  if (type === ValuesType.Base)
    return { ...definition, base_values: subAddValues(definition.base_values, key, [[attribute, value]]) }
  if (type === ValuesType.Modifier)
    return { ...definition, modifier_values: subAddValues(definition.modifier_values, key, [[attribute, value]]) }
  if (type === ValuesType.Loss)
    return { ...definition, loss_values: subAddValues(definition.loss_values, key, [[attribute, value]]) }
  if (type === ValuesType.LossModifier)
    return { ...definition, loss_modifier_values: subAddValues(definition.loss_modifier_values, key, [[attribute, value]]) }
  return definition
}

export const addValuesWithMutate = <D extends BD>(definition: D, type: ValuesType, key: string, values: [string, number][]) => {
  if (type === ValuesType.Base)
    definition.base_values = subAddValues(definition.base_values, key, values)
  if (type === ValuesType.Modifier)
    definition.modifier_values = subAddValues(definition.modifier_values, key, values)
  if (type === ValuesType.Loss)
    definition.loss_values = subAddValues(definition.loss_values, key, values)
  if (type === ValuesType.LossModifier)
    definition.loss_modifier_values = subAddValues(definition.loss_modifier_values, key, values)
}

/**
 * Shared implementation for adding base, modifier or loss values.
 * @param container Base, modifier or loss values.
 * @param key Identifier for the values. Previous values get replaced.
 * @param values A list of [attribute, value] pairs.
 */
const subAddValues = <A extends string>(container: Values<A> | undefined, key: string, values: [A, number][]): Values<A> => {
  let new_values = container ? container : initValues<A>()
  for (const [attribute, value] of values) {
    if (!has(new_values, attribute) && value === 0)
      continue
    if (!has(new_values, attribute))
      new_values = { ...new_values, [attribute]: {} }
    if (value === 0 && has(new_values[attribute], key))
      new_values = { ...new_values, [attribute]: filter(new_values[attribute], (_, k) => k !== key) }
    else if (value !== 0)
      new_values = { ...new_values, [attribute]: { ...new_values[attribute], [key]: value } }
  }
  return new_values
}

/**
 * Clears base, modifier and loss values with a given key.
 */
export const clearAllValues = <D extends BD>(definition: D, key: string): D => {
  return {
    ...definition,
    base_values: subClearValues(definition.base_values, key),
    modifier_values: subClearValues(definition.modifier_values, key),
    loss_values: subClearValues(definition.loss_values, key),
    loss_modifier_values: subClearValues(definition.loss_modifier_values, key)
  }
}

/**
 * Clears base, modifier and loss values with a given key.
 */
export const clearAllValuesWithMutate = <D extends BD>(definition: D, key: string) => {
  definition.base_values = subClearValues(definition.base_values, key)
  definition.modifier_values = subClearValues(definition.modifier_values, key)
  definition.loss_values = subClearValues(definition.loss_values, key)
  definition.loss_modifier_values = subClearValues(definition.loss_modifier_values, key)
}

/**
 * Clears base, modifier or loss values with a given key.
 */
export const clearValues = <D extends BD>(definition: D, type: ValuesType, key: string): D => {
  if (type === ValuesType.Base)
    return { ...definition, base_values: subClearValues(definition.base_values, key) }
  const any = definition as any
  if (type === ValuesType.Modifier)
    return { ...definition, modifier_values: subClearValues(any.modifier_values, key) }
  if (type === ValuesType.Loss)
    return { ...definition, loss_values: subClearValues(any.loss_values, key) }
  if (type === ValuesType.LossModifier)
    return { ...definition, loss_modifier_values: subClearValues(any.loss_values, key) }
  return definition
}

export const clearValuesWithMutate = <D extends BD>(definition: D, type: ValuesType, key: string) => {
  if (type === ValuesType.Base)
    definition.base_values = subClearValues(definition.base_values, key)
  const any = definition as any
  if (type === ValuesType.Modifier)
    definition.modifier_values = subClearValues(any.modifier_values, key)
  if (type === ValuesType.Loss)
    definition.loss_values = subClearValues(any.loss_values, key)
  if (type === ValuesType.LossModifier)
    definition.loss_modifier_values = subClearValues(any.loss_values, key)
}


/**
 * Shared implementation for clearing base, modifier or loss values.
 * @param container Base, modifier or loss values.
 * @param key Identifier for the values to remove.
 */
const subClearValues = <A extends string>(container: Values<A> | undefined, key: string): Values<A> => {
  if (container)
    return map(container, attribute => filter(attribute, ((_, attribute_key) => attribute_key !== key)))
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
    base_values: subFilterValues(definition.base_values, key),
    modifier_values: subFilterValues(definition.modifier_values, key),
    loss_values: subFilterValues(definition.loss_values, key),
    loss_modifier_values: subFilterValues(definition.loss_modifier_values, key)
  }
}

const subFilterValues = (values: Values<any> | undefined, filter_key: string) => values && map(values, attribute => filterKeys(attribute, key => key === filter_key))

/**
 * Calculates the value of an attribute. Includes base, modifier and loss values.
 * @param definition 
 * @param attribute 
 */
export const calculateValue = <D extends BD, A extends string>(definition: D | undefined, attribute: A): number => {
  if (!definition)
    return 0.0
  let value = calculateBase(definition, attribute) * calculateModifier(definition, attribute) * (1 - calculateLossModifier(definition, attribute)) - calculateLoss(definition, attribute)
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
  let value = calculateBase(definition, attribute) * calculateModifier(definition, attribute)
  return round(value, PRECISION)
}

/**
 * Calculates the base value of an attribute.
 * @param definition 
 * @param attribute 
 */
export const calculateBase = <D extends BD, A extends string>(definition: D, attribute: A): number => calculateValueSub(definition.base_values, attribute, 0)

/**
 * Calculates the modifier value of an attribute.
 * @param definition 
 * @param attribute 
 */
export const calculateModifier = <D extends BD, A extends string>(definition: D, attribute: A): number => calculateValueSub(definition.modifier_values, attribute, 1.0)

/**
 * Calculates the loss value of an attribute.
 * @param definition 
 * @param attribute 
 */
export const calculateLoss = <D extends BD, A extends string>(definition: D, attribute: A): number => calculateValueSub(definition.loss_values, attribute, 0)

/**
 * Calculates the loss modifier value of an attribute.
 * @param definition 
 * @param attribute 
 */
export const calculateLossModifier = <D extends BD, A extends string>(definition: D, attribute: A): number => calculateValueSub(definition.loss_modifier_values, attribute, 0)

/**
 * Shared implementation for calculating the value of an attribute.
 * @param container 
 * @param attribute 
 * @param initial Initial value. For example modifiers have 1.0.
 */
const calculateValueSub = <A extends string>(container: Values<A> | undefined, attribute: A, initial: number): number => {
  let result = initial
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
    return definition.modifier_values ?? {}
  if (type === ValuesType.Loss)
    return definition.loss_values ?? {}
  if (type === ValuesType.LossModifier)
    return definition.loss_modifier_values ?? {}
  return definition.base_values ?? {}
}

/**
 * Returns a short explanations of a given attribute. Only checks base values.
 * @param definition 
 * @param attribute 
 */
export const explainShort = <D extends BD, A extends string>(definition: D, attribute: A): string => {
  if (!definition.base_values)
    return ''
  const value_base = definition.base_values[attribute]
  let explanation = ''
  if (value_base) {
    forEach(value_base, (value, key) => explanation += key.replace(/_/g, ' ') + ': ' + value + ', ')
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
  const value_modifier = definition.modifier_values ? definition.modifier_values[attribute] : undefined
  const value_loss = definition.loss_values ? definition.loss_values[attribute] : undefined
  if ((!value_modifier || size(value_modifier) === 0) && (!value_loss || size(value_loss) === 0))
    return explainShort(definition, attribute)
  let explanation = ''
  let base = 0
  const value_base = definition.base_values ? definition.base_values[attribute] : undefined
  if (value_base) {
    forEach(value_base, value => base += value)
    if (size(value_base) === 0)
      explanation += 'Base value 0'
    else if (size(value_base) === 1)
      explanation += ''
    else
      explanation += 'Base value ' + +(base).toFixed(2) + ' ('
    forEach(value_base, (value, key) => explanation += key.replace(/_/g, ' ') + ': ' + value + ', ')
    if (size(value_base) > 0)
      explanation = explanation.substring(0, explanation.length - 2)
    if (size(value_base) > 1)
      explanation += ')'
  }
  let modifier = 1.0
  if (value_modifier)
    forEach(value_modifier, value => modifier += value)
  if (value_modifier && size(value_modifier) > 0) {
    explanation += ' multiplied by ' + toPercent(modifier)
    explanation += ' ('
    forEach(value_modifier, (value, key) => explanation += key.replace(/_/g, ' ') + ': ' + toPercent(value) + ', ')
    explanation = explanation.substring(0, explanation.length - 2) + ')'
  }
  const value = calculateValue(definition, attribute)
  const base_value = calculateValueWithoutLoss(definition, attribute)
  const loss = base_value - value
  if (value_loss && size(value_loss) > 0) {
    explanation += ' reduced by losses ' + +(loss).toFixed(2)
    explanation += ' ('
    forEach(value_loss, (value, key) => explanation += key.replace(/_/g, ' ') + ': ' + value + ', ')
    explanation = explanation.substring(0, explanation.length - 2) + ')'
  }
  return explanation
}
