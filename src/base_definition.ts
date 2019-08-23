import { Map, OrderedMap } from 'immutable'
import EmptyIcon from './images/empty.png'
import UnknownIcon from './images/unknown.png'
import { toPercent, toManpower} from './formatters'
import { round } from './utils'

export enum ValuesType {
  Base = 'Base',
  Modifier = 'Modifier',
  Loss = 'Loss'
}

export enum DefinitionType {
  Land = 'Land',
  Naval = 'Naval',
  Global = 'Global'
}

type BVD = BD | BaseValuesDefinition<any, any>
type BD = BaseDefinition<any, any>

export interface BaseDefinition<T, S> {
  readonly type: T
  readonly image?: string
  readonly base_values?: Map<S, OrderedMap<string, number>>
  readonly modifier_values?: Map<S, OrderedMap<string, number>>
  readonly loss_values?: Map<S, OrderedMap<string, number>>
}

export interface BaseValuesDefinition<T, S> {
  readonly type: T
  readonly mode: DefinitionType
  readonly image?: string
  readonly base_values?: Map<S, OrderedMap<string, number>>
}

/**
 * Returns the image of a definition while handling missing cases.
 * Question mark is returned for existing definitions without an image.
 * Empty is returned for non-existing definitions.
 * @param definition
 */
export const getImage = (definition?: { image?: string}): string => (definition && definition.image) || (definition ? UnknownIcon : EmptyIcon)

/**
 * Merges base, modifier and loss values of given definitions. Returns the first definition (if defined), otherwise the second definition.
 * @param definition Returned definition with base values from to_merge.
 * @param to_merge Only returned if other parameter is not defined.
 */
export const mergeValues = <D1 extends BD | undefined, D2 extends BD | undefined> (definition: D1, to_merge: D2): D1 & D2 => {
  let base_values = Map<any, OrderedMap<string, number>>()
  if (definition && definition.base_values)
    base_values = base_values.mergeDeep(definition.base_values)
  if (to_merge && to_merge.base_values)
    base_values = base_values.mergeDeep(to_merge.base_values)
  let modifier_values = Map<any, OrderedMap<string, number>>()
  if (definition && definition.modifier_values)
    modifier_values = modifier_values.mergeDeep(definition.modifier_values)
  if (to_merge && to_merge.modifier_values)
    modifier_values = modifier_values.mergeDeep(to_merge.modifier_values)
  let loss_values = Map<any, OrderedMap<string, number>>()
  if (definition && definition.loss_values)
    loss_values = loss_values.mergeDeep(definition.loss_values)
  if (to_merge && to_merge.loss_values)
    loss_values = loss_values.mergeDeep(to_merge.loss_values)
  return { ...to_merge, ...definition, base_values, modifier_values, loss_values }
}

/**
 * Adds base, modifier or loss values.
 */
export const addValues = <D extends BVD, Attribute> (definition: D, type: ValuesType, key: string, values: [Attribute, number][]): D => {
  if (type === ValuesType.Base)
    return { ...definition, base_values: subAddValues(definition.base_values, key, values) }
  const any = definition as any
  if (type === ValuesType.Modifier)
    return { ...definition, modifier_values: subAddValues(any.modifier_values, key, values) }
  if (type === ValuesType.Loss)
    return { ...definition, loss_values: subAddValues(any.loss_values, key, values) }
  return definition
}

type Values<A> = Map<A, OrderedMap<string, number>>

/**
 * Shared implementation for adding base, modifier or loss values.
 * @param container Base, modifier or loss values.
 * @param key Identifier for the values. Previous values get replaced.
 * @param values A list of [attribute, value] pairs.
 */
const subAddValues = <A>(container: Values<A> | undefined, key: string, values: [A, number][]): Values<A> => {
  let new_values = container ? container : Map<A, OrderedMap<string, number>>()
  for (const [attribute, value] of values) {
    new_values = new_values.has(attribute) ? new_values : new_values.set(attribute, OrderedMap<string, number>())
    const attribute_values = new_values.get(attribute)!
    if (value === 0 && attribute_values.has(key))
      new_values = new_values.set(attribute, attribute_values.delete(key))
    else if (value !== 0)
      new_values = new_values.set(attribute, attribute_values.set(key, value))
  }
  return new_values
}

/**
 * Clears base, modifier and loss values with a given key.
 */
export const clearAllValues = <D extends BD> (definition: D, key: string): D => {
  return {
    ...definition,
    base_values: subClearValues(definition.base_values, key),
    modifier_values: subClearValues(definition.modifier_values, key),
    loss_values: subClearValues(definition.loss_values, key)
  }
}

/**
 * Clears base, modifier or loss values with a given key.
 */
export const clearValues = <D extends BVD> (definition: D, type: ValuesType, key: string): D => {
  if (type === ValuesType.Base)
    return { ...definition, base_values: subClearValues(definition.base_values, key) }
  const any = definition as any
  if (type === ValuesType.Modifier)
    return { ...definition, modifier_values: subClearValues(any.modifier_values, key) }
  if (type === ValuesType.Loss)
    return { ...definition, loss_values: subClearValues(any.loss_values, key) }
  return definition
}


/**
 * Shared implementation for clearing base, modifier or loss values.
 * @param container Base, modifier or loss values.
 * @param key Identifier for the values to remove.
 */
const subClearValues = <A>(container: Values<A> | undefined, key: string): Values<A> => {
  if (container)
    return container.map(attribute => attribute.filter((_, attribute_key) => attribute_key !==key))
  return Map<A, OrderedMap<string, number>>()
}

/**
 * Adds base, modifier or loss values while clearing previous ones.
 */
export const regenerateValues = <D extends BVD, A> (definition: D, type: ValuesType, key: string, values: [A, number][]): D => {
  return addValues(clearValues(definition, type, key), type, key, values)
}

// This precision is required for accurate morale calculations.
const PRECISION = 100000.0

/**
 * Calculates the value of an attribute. Includes base, modifier and loss values.
 * @param definition 
 * @param attribute 
 */
export const calculateValue = <D extends BVD, A> (definition: D | undefined, attribute: A): number => {
  if (!definition)
    return 0.0
  let value = calculateBase(definition, attribute) * calculateModifier(definition, attribute) - calculateLoss(definition, attribute)
  return round(value, PRECISION)
}

/**
 * Calculates the value of an attribute, without losses.
 * @param definition 
 * @param attribute 
 */
export const calculateValueWithoutLoss = <D extends BVD, A> (definition: D | undefined, attribute: A): number => {
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
export const calculateBase = <D extends BVD, A> (definition: D, attribute: A): number => calculateValueSub(definition.base_values, attribute, 0)

/**
 * Calculates the modifier value of an attribute.
 * @param definition 
 * @param attribute 
 */
export const calculateModifier = <D extends BD, A> (definition: D, attribute: A): number => calculateValueSub(definition.modifier_values, attribute, 1.0)

/**
 * Calculates the loss value of an attribute.
 * @param definition 
 * @param attribute 
 */
export const calculateLoss = <D extends BD, A> (definition: D, attribute: A): number => calculateValueSub(definition.loss_values, attribute, 0)

/**
 * Shared implementation for calculating the value of an attribute.
 * @param container 
 * @param attribute 
 * @param initial Initial value. For example modifiers have 1.0.
 */
const calculateValueSub = <A>(container: Values<A> | undefined, attribute: A, initial: number): number => {
  let result = initial
  if (!container)
    return result
  const values = container.get(attribute)
  if (values)
    values.forEach(value => result += value)
  return round(result, PRECISION)
}

/**
 * Returns a base value of a given attribute with a given identifier.
 * @param definition 
 * @param attribute 
 * @param key 
 */
export const getBaseValue = <D extends BVD, A> (definition: D, attribute: A, key: string): number => getValue(definition.base_values, attribute, key)

/**
 * Returns a modifier of a given attribute with a given identifier.
 * @param definition 
 * @param attribute 
 * @param key 
 */
export const getModifierValue = <D extends BD, A> (definition: D, attribute: A, key: string): number => getValue(definition.modifier_values, attribute, key)

/**
 * Returns a loss of a given attribute with a given identifier.
 * @param definition 
 * @param attribute 
 * @param key 
 */
export const getLossValue = <D extends BD, A> (definition: D, attribute: A, key: string): number => getValue(definition.loss_values, attribute, key)

/**
 * Shared implementation to get values. Zero is returned for missing values because values with zero are not stored.
 * @param container 
 * @param attribute 
 * @param key 
 */
const getValue = <A>(container: Values<A> | undefined, attribute: A, key: string): number => {
  if (!container)
    return 0.0
  const values = container.get(attribute)
  if (!values)
    return 0.0
  const value = values.get(key)
  if (!value)
    return 0.0
  return value
}

/**
 * Returns a short explanations of a given attribute. Only checks base values.
 * @param definition 
 * @param attribute 
 */
export const explainShort = <D extends BVD, A> (definition: D, attribute: A): string => {
  if (!definition.base_values)
    return ''
  let base = 0
  const value_base = definition.base_values.get(attribute)
  if (value_base)
    value_base.forEach(value => base += value)
  let explanation = ''
  if (value_base) {
    value_base.forEach((value, key) => explanation += key.replace(/_/g, ' ') + ': ' + value + ', ')
    explanation = explanation.substring(0, explanation.length - 2)
  }
  return explanation
}

/**
 * Returns an explanation of a given attribute.
 * @param definition 
 * @param attribute 
 */
export const explain = <D extends BD, A> (definition: D, attribute: A): string => {
  const value_modifier = definition.modifier_values ? definition.modifier_values.get(attribute) : undefined
  const value_loss = definition.loss_values ? definition.loss_values.get(attribute) : undefined
  if ((!value_modifier || value_modifier.size === 0) && (!value_loss || value_loss.size === 0))
    return explainShort(definition, attribute)
  let explanation = ''
  let base = 0
  const value_base = definition.base_values ? definition.base_values.get(attribute) : undefined
  if (value_base) {
    value_base.forEach(value => base += value)
    if (value_base.size === 0)
      explanation += 'Base value 0'
    else if (value_base.size === 1)
      explanation += ''
    else
      explanation += 'Base value ' + +(base).toFixed(2) + '('
    value_base.forEach((value, key) => explanation += key.replace(/_/g, ' ') + ': ' + value + ', ')
    explanation = explanation.substring(0, explanation.length - 2)
    if (value_base.size > 1)
      explanation += ')'
  }
  let modifier = 1.0
  if (value_modifier)
    value_modifier.forEach(value => modifier += value)
  if (value_modifier && value_modifier.size > 0) {
    explanation += ' multiplied by ' + toPercent(modifier)
    explanation += ' ('
    value_modifier.forEach((value, key) => explanation += key.replace(/_/g, ' ') + ': ' + toPercent(value) + ', ')
    explanation = explanation.substring(0, explanation.length - 2) + ')'
  }
  let loss = 0
  if (value_loss)
    value_loss.forEach(value => loss += value)
  if (value_loss && value_loss.size > 0) {
    explanation += ' reduced by losses ' + +(loss).toFixed(2)
    explanation += ' ('
    value_loss.forEach((value, key) => explanation += key.replace(/_/g, ' ') + ': ' + value + ', ')
    explanation = explanation.substring(0, explanation.length - 2) + ')'
  }
  return explanation
}

export const strengthToValue = (mode: DefinitionType, number: number) => {
  if (mode === DefinitionType.Naval)
    return toPercent(number)
  return toManpower(number)
}
