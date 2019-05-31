import { Map, OrderedMap } from 'immutable'

export enum ValuesType {
  Base,
  Modifier,
  Loss
}

type AnyDefinition = AnyBaseDefinition | BaseValuesDefinition<any, any>
type AnyBaseDefinition = BaseDefinition<any, any>

export interface BaseDefinition<T, S> {
  readonly type: T
  readonly image?: string
  readonly base_values?: Map<S, OrderedMap<string, number>>
  readonly modifier_values?: Map<S, OrderedMap<string, number>>
  readonly loss_values?: Map<S, OrderedMap<string, number>>
}

export interface BaseValuesDefinition<T, S> {
  readonly type: T
  readonly image?: string
  readonly base_values?: Map<S, OrderedMap<string, number>>
}

export const add_base_value = <Definition extends AnyDefinition, Attribute>
  (definition: Definition, key: string, attribute: Attribute, value: number) => {
  const new_values = add_values(definition.base_values, key, [[attribute, value]])
  return { ...definition, base_values: new_values }
}

export const add_base_values = <Definition extends AnyDefinition, Attribute>
  (definition: Definition, key: string, values: [Attribute, number][]): Definition => {
  const new_values = add_values(definition.base_values, key, values)
  return { ...definition, base_values: new_values }
}

export const add_modifier_value = <Definition extends AnyBaseDefinition, Attribute>
  (definition: Definition, key: string, attribute: Attribute, value: number) => {
  const new_values = add_values(definition.modifier_values, key, [[attribute, value]])
  return { ...definition, modifier_values: new_values }
}

export const add_modifier_values = <Definition extends AnyBaseDefinition, Attribute>
  (definition: Definition, key: string, values: [Attribute, number][]): Definition => {
  const new_values = add_values(definition.modifier_values, key, values)
  return { ...definition, modifier_values: new_values }
}

export const add_loss_value = <Definition extends AnyBaseDefinition, Attribute>
  (definition: Definition, key: string, attribute: Attribute, value: number) => {
  const new_values = add_values(definition.loss_values, key, [[attribute, value]])
  return { ...definition, loss_values: new_values }
}

export const add_loss_values = <Definition extends AnyBaseDefinition, Attribute>
  (definition: Definition, key: string, values: [Attribute, number][]): Definition => {
  const new_values = add_values(definition.loss_values, key, values)
  return { ...definition, loss_values: new_values }
}

const add_values = <Attribute>(container: Map<Attribute, OrderedMap<string, number>> | undefined, key: string, values: [Attribute, number][]) => {
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
  (definition: Definition, type: Attribute): number => {
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
  if (!container)
    return 0.0
  let result = initial
  const values = container.get(type)
  if (values)
    values.forEach(value => result += value)
  return Math.round(result * 1000.0) / 1000.0
}

export const get_base_value = <Definition extends AnyDefinition, Attribute>
  (definition: Definition, type: Attribute, key: string): number => get_value(definition.base_values, type, key)

export const get_modifier_value = <Definition extends AnyBaseDefinition, Attribute>
  (definition: Definition, type: Attribute, key: string): number => get_value(definition.modifier_values, type, key)

export const get_loss_value = <Definition extends AnyBaseDefinition, Attribute>
  (definition: Definition, type: Attribute, key: string): number => get_value(definition.loss_values, type, key)

const get_value = <Attribute>(container: Map<Attribute, OrderedMap<string, number>> | undefined, type: Attribute, key: string): number => {
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

export const explain_short = <Definition extends AnyDefinition, Attribute>
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
    return explain_short(definition, type)
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
(definition: Definition, type: Attribute, show_zero: boolean) =>  toRelativePercent(calculateValue(definition, type), show_zero)

export const valueToRelativeZeroPercent = <Definition extends AnyDefinition, Attribute>
  (definition: Definition, type: Attribute, show_zero: boolean) => toRelativeZeroPercent(calculateValue(definition, type), show_zero)

export const add_value = <Definition extends AnyDefinition, Attribute>
  (definition: Definition, type: ValuesType, key: string, attribute: Attribute, value: number) => {
  if (type === ValuesType.Base)
    return add_base_value(definition, key, attribute, value)
  if (type === ValuesType.Loss)
    return add_loss_value(definition, key, attribute, value)
  if (type === ValuesType.Modifier)
    return add_modifier_value(definition, key, attribute, value)
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
