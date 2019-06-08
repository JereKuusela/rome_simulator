import { Map, OrderedMap } from 'immutable'
import EmptyIcon from './images/empty.png'

export enum ValuesType {
  Base,
  Modifier,
  Loss
}

type AnyDefinition = AnyBaseDefinition | BaseValuesDefinition<any, any>
type AnyBaseDefinition = BaseDefinition<any, any>

export interface BaseDefinition<T, S> {
  readonly type: T
  image?: string
  readonly base_values?: Map<S, OrderedMap<string, number>>
  readonly modifier_values?: Map<S, OrderedMap<string, number>>
  readonly loss_values?: Map<S, OrderedMap<string, number>>
}

export interface BaseValuesDefinition<T, S> {
  readonly type: T
  image?: string
  readonly base_values?: Map<S, OrderedMap<string, number>>
}

export const getImage = <Definition extends AnyDefinition>
(definition?: Definition) => (definition && definition.image) || EmptyIcon

export const mergeBaseValues = <Definition extends AnyDefinition>
  (definition: Definition, to_merge: Definition) => {
  let new_base_values = Map<any, OrderedMap<any, number>>()
  if (definition.base_values)
    new_base_values = new_base_values.mergeDeep(definition.base_values)
  if (to_merge.base_values)
    new_base_values = new_base_values.mergeDeep(to_merge.base_values)
  return { ...definition, base_values: new_base_values }
}

export const mergeValues = <Definition extends AnyBaseDefinition>
  (definition: Definition, to_merge: Definition) => {
  let new_base_values = Map<any, OrderedMap<string, number>>()
  if (definition.base_values)
    new_base_values = new_base_values.mergeDeep(definition.base_values)
  if (to_merge.base_values)
    new_base_values = new_base_values.mergeDeep(to_merge.base_values)
  let new_modifier_values = Map<any, OrderedMap<string, number>>()
  if (definition.modifier_values)
    new_modifier_values = new_modifier_values.mergeDeep(definition.modifier_values)
  if (to_merge.modifier_values)
    new_modifier_values = new_modifier_values.mergeDeep(to_merge.modifier_values)
  let new_loss_values = Map<any, OrderedMap<string, number>>()
  if (definition.loss_values)
    new_loss_values = new_loss_values.mergeDeep(definition.loss_values)
  if (to_merge.loss_values)
    new_loss_values = new_loss_values.mergeDeep(to_merge.loss_values)
  return { ...definition, base_values: new_base_values, modifier_values: new_modifier_values, loss_values: new_loss_values }
}

export const addBaseValue = <Definition extends AnyDefinition, Attribute>
  (definition: Definition, key: string, attribute: Attribute, value: number) => {
  const new_values = addValues(definition.base_values, key, [[attribute, value]])
  return { ...definition, base_values: new_values }
}

export const addBaseValues = <Definition extends AnyDefinition, Attribute>
  (definition: Definition, key: string, values: [Attribute, number][]): Definition => {
  const new_values = addValues(definition.base_values, key, values)
  return { ...definition, base_values: new_values }
}

export const addModifierValue = <Definition extends AnyBaseDefinition, Attribute>
  (definition: Definition, key: string, attribute: Attribute, value: number) => {
  const new_values = addValues(definition.modifier_values, key, [[attribute, value]])
  return { ...definition, modifier_values: new_values }
}

export const addModifierValues = <Definition extends AnyBaseDefinition, Attribute>
  (definition: Definition, key: string, values: [Attribute, number][]): Definition => {
  const new_values = addValues(definition.modifier_values, key, values)
  return { ...definition, modifier_values: new_values }
}

export const addLossValue = <Definition extends AnyBaseDefinition, Attribute>
  (definition: Definition, key: string, attribute: Attribute, value: number) => {
  const new_values = addValues(definition.loss_values, key, [[attribute, value]])
  return { ...definition, loss_values: new_values }
}

export const addLossValues = <Definition extends AnyBaseDefinition, Attribute>
  (definition: Definition, key: string, values: [Attribute, number][]): Definition => {
  const new_values = addValues(definition.loss_values, key, values)
  return { ...definition, loss_values: new_values }
}

const addValues = <Attribute>(container: Map<Attribute, OrderedMap<string, number>> | undefined, key: string, values: [Attribute, number][]) => {
  let new_values = container ? container : Map<Attribute, OrderedMap<string, number>>()
  for (const [type, value] of values) {
    new_values = new_values.has(type) ? new_values : new_values.set(type, OrderedMap<string, number>())
    const type_values = new_values.get(type)
    if (!type_values)
      return new_values
    if (value === 0 && type_values.has(key))
      new_values = new_values.set(type, type_values.delete(key))
    else if (value !== 0)
      new_values = new_values.set(type, type_values.set(key, value))
  }
  return new_values
}

export const calculateValue = <Definition extends AnyDefinition, Attribute>
  (definition: Definition | undefined, type: Attribute): number => {
  if (!definition)
    return 0.0
  let value = calculateBase(definition, type)
  if (isBaseDefinition(definition))
    value = value * calculateModifier(definition, type) - calculateLoss(definition, type)
  return round(value)
}

export const calculateValueWithoutLoss = <Definition extends AnyDefinition, Attribute>
  (definition: Definition, type: Attribute): number => {
  let value = calculateBase(definition, type)
  if (isBaseDefinition(definition))
    value = value * calculateModifier(definition, type)
  return round(value)
}

const round = (number: number) => +(Math.round(1000.0 * number) / 1000.0).toFixed(3)


export const calculateBase = <Definition extends AnyDefinition, Attribute>
  (definition: Definition, type: Attribute): number => calculateValueSub(definition.base_values, type, 0)
export const calculateModifier = <Definition extends AnyBaseDefinition, Attribute>
  (definition: Definition, type: Attribute): number => calculateValueSub(definition.modifier_values, type, 1.0)
export const calculateLoss = <Definition extends AnyBaseDefinition, Attribute>
  (definition: Definition, type: Attribute): number => calculateValueSub(definition.loss_values, type, 0)

const calculateValueSub = <Attribute>(container: Map<Attribute, OrderedMap<string, number>> | undefined, type: Attribute, initial: number): number => {
  let result = initial
  if (!container)
    return result
  const values = container.get(type)
  if (values)
    values.forEach(value => result += value)
  return Math.round(result * 1000.0) / 1000.0
}

export const getBaseValue = <Definition extends AnyDefinition, Attribute>
  (definition: Definition, type: Attribute, key: string): number => getValue(definition.base_values, type, key)

export const getModifierValue = <Definition extends AnyBaseDefinition, Attribute>
  (definition: Definition, type: Attribute, key: string): number => getValue(definition.modifier_values, type, key)

export const getLossValue = <Definition extends AnyBaseDefinition, Attribute>
  (definition: Definition, type: Attribute, key: string): number => getValue(definition.loss_values, type, key)

const getValue = <Attribute>(container: Map<Attribute, OrderedMap<string, number>> | undefined, type: Attribute, key: string): number => {
  if (!container)
    return 0.0
  const values = container.get(type)
  if (!values)
    return 0.0
  const value = values.get(key)
  if (!value)
    return 0.0
  return value
}

export const explainShort = <Definition extends AnyDefinition, Attribute>
  (definition: Definition, type: Attribute) => {
  if (!definition.base_values)
    return ''
  let base = 0
  const value_base = definition.base_values.get(type)
  if (value_base)
    value_base.forEach(value => base += value)
  let explanation = ''
  if (value_base) {
    value_base.forEach((value, key) => explanation += key + ': ' + value + ', ')
    explanation = explanation.substring(0, explanation.length - 2)
  }
  return explanation
}

export const explain = <Definition extends AnyBaseDefinition, Attribute>
  (definition: Definition, type: Attribute) => {
  const value_modifier = definition.modifier_values ? definition.modifier_values.get(type) : undefined
  const value_loss = definition.loss_values ? definition.loss_values.get(type) : undefined
  if ((!value_modifier || value_modifier.size === 0) && (!value_loss || value_loss.size === 0))
    return explainShort(definition, type)
  let explanation = ''
  let base = 0
  const value_base = definition.base_values ? definition.base_values.get(type) : undefined
  if (value_base) {
    value_base.forEach(value => base += value)
    if (value_base.size === 0)
      explanation += 'Base value 0'
    else if (value_base.size === 1)
      explanation += ''
    else
      explanation += 'Base value ' + +(base).toFixed(2) + '('
    value_base.forEach((value, key) => explanation += key + ': ' + value + ', ')
    explanation = explanation.substring(0, explanation.length - 2)
    if (value_base.size > 1)
      explanation += ')'
  }
  let modifier = 1.0
  if (value_modifier)
    value_modifier.forEach(value => modifier += value)
  if (value_modifier && value_modifier.size > 0) {
    explanation += ' multiplied by ' + toPercent(modifier, true)
    explanation += ' ('
    value_modifier.forEach((value, key) => explanation += key + ': ' + toPercent(value, true) + ', ')
    explanation = explanation.substring(0, explanation.length - 2) + ')'
  }
  let loss = 0
  if (value_loss)
    value_loss.forEach(value => loss += value)
  if (value_loss && value_loss.size > 0) {
    explanation += ' reduced by losses ' + +(loss).toFixed(2)
    explanation += ' ('
    value_loss.forEach((value, key) => explanation += key + ': ' + value + ', ')
    explanation = explanation.substring(0, explanation.length - 2) + ')'
  }
  return explanation
}

export const valueToRelativeNumber = <Definition extends AnyDefinition, Attribute>
  (definition: Definition, type: Attribute, show_zero: boolean) => {
  const value = calculateValue(definition, type)
  if (value > 0)
    return '+' + String(value)
  if (value === 0 && !show_zero)
    return ''
  return +(value).toFixed(2)
}

export const valueToNumber = <Definition extends AnyDefinition, Attribute>
  (definition: Definition, type: Attribute, show_zero: boolean) => {
  const value = calculateValue(definition, type)
  if (value === 0 && !show_zero)
    return ''
  return +(value).toFixed(2)
}

export const valueToPercent = <Definition extends AnyDefinition, Attribute>
  (definition: Definition, type: Attribute, show_zero: boolean) => toPercent(calculateValue(definition, type), show_zero)

export const valueToRelativePercent = <Definition extends AnyDefinition, Attribute>
  (definition: Definition, type: Attribute, show_zero: boolean) => toRelativePercent(calculateValue(definition, type), show_zero)

export const valueToRelativeZeroPercent = <Definition extends AnyDefinition, Attribute>
  (definition: Definition, type: Attribute, show_zero: boolean) => toRelativeZeroPercent(calculateValue(definition, type), show_zero)

export const addValue = <Definition extends AnyDefinition, Attribute>
  (definition: Definition, type: ValuesType, key: string, attribute: Attribute, value: number) => {
  if (type === ValuesType.Base)
    return addBaseValue(definition, key, attribute, value)
  if (type === ValuesType.Loss)
    return addLossValue(definition, key, attribute, value)
  if (type === ValuesType.Modifier)
    return addModifierValue(definition, key, attribute, value)
  return definition
}

export const toPercent = (number: number, show_zero: boolean) => {
  const value = +(number * 100.0).toFixed(2)
  if (value === 0 && !show_zero)
    return ''
  return String(value) + '%'
}

export const toRelativePercent = (number: number, show_zero: boolean) => {
  const value = +(number * 100.0 - 100.0).toFixed(2)
  if (value > 0)
    return '+' + String(value) + '%'
  if (value === 0 && !show_zero)
    return ''
  if (value === 0 && show_zero)
    return '+0%'
  return String(value) + '%'
}

export const toRelativeZeroPercent = (number: number, show_zero: boolean) => {
  const value = +(number * 100.0).toFixed(2)
  if (value > 0)
    return '+' + String(value) + '%'
  if (value === 0 && !show_zero)
    return ''
  if (value === 0 && show_zero)
    return '+0%'
  return String(value) + '%'
}

const isBaseDefinition = (definition: BaseDefinition<any, any> | BaseValuesDefinition<any, any>): definition is BaseDefinition<any, any> => {
  return (definition as BaseDefinition<any, any>).modifier_values !== undefined
}
