import { Map } from 'immutable'



export class BaseDefinition<T, S> {
  constructor(public readonly type: T, protected readonly base_values: Map<S, Map<string, number>> = Map(), protected readonly modifier_values: Map<S, Map<string, number>> = Map(),
    protected readonly loss_values: Map<S, Map<string, number>> = Map()) {

  }

  toPercent = (number: number) => +(number * 100).toFixed(2) + '%'

  toRelativePercent = (number: number) => {
    const relative = +(number * 100).toFixed(2) - 100
    if (relative > 0)
      return '+' + relative + '%'
    if (relative < 0)
      return relative + '%'
    return ''
  }

  calculateValue = (type: S): number => {
    let base = 0
    const value_base = this.base_values.get(type)
    if (value_base)
      value_base.forEach(value => base += value)
    let modifier = 1.0
    const value_modifier = this.modifier_values.get(type)
    if (value_modifier)
      value_modifier.forEach(value => modifier += value)
    let loss = 0
    const value_loss = this.loss_values.get(type)
    if (value_loss)
      value_loss.forEach(value => loss += value)
    return base * modifier - loss
  }

  valueToString = (type: S): string => String(this.calculateValue(type))

  explain = (type: S) => {
    let base = 0
    const value_base = this.base_values.get(type)
    if (value_base)
      value_base.forEach(value => base += value)
    let explanation = 'Base value ' + base
    if (value_base) {
      explanation += ' ('
      value_base.forEach((value, key) => explanation += key + ': ' + value + ',')
      explanation = explanation.substring(0, explanation.length - 1) + ')'
    }
    let modifier = 1.0
    const value_modifier = this.modifier_values.get(type)
    if (value_modifier)
      value_modifier.forEach(value => modifier += value)
    explanation += ' multiplied by ' + this.toPercent(modifier)
    if (value_modifier && value_modifier.size > 0) {
      explanation += ' ('
      value_modifier.forEach((value, key) => explanation += key + ': ' + this.toPercent(value) + ',')
      explanation = explanation.substring(0, explanation.length - 1) + ')'
    }
    let loss = 0
    const value_loss = this.loss_values.get(type)
    if (value_loss)
      value_loss.forEach(value => loss += value)
    if (value_loss && value_loss.size > 0) {
      explanation += ' reduced by losses ' + loss
      explanation += ' ('
      value_loss.forEach((value, key) => explanation += key + ': ' + value + ',')
      explanation = explanation.substring(0, explanation.length - 1) + ')'
    }
    return explanation
  }

  protected add_values = (container: Map<S, Map<string, number>>, key: string, values: [S, number][]): Map<S, Map<string, number>> => {
    let new_values = container
    for (const [type, value] of values) {
      new_values = new_values.has(type) ? new_values : new_values.set(type, Map<string, number>())
      const type_values = new_values.get(type)
      if (!type_values)
        return new_values
      if (value === 0 && type_values.has(key))
        new_values = new_values.set(type, type_values.delete(key))
      else
        new_values = new_values.set(type, type_values.set(key, value))
    }
    return new_values
  }

  get_base_value = (type: S, key: string): number => this.get_value(this.base_values, type, key)

  get_modifier_value = (type: S, key: string): number => this.get_value(this.modifier_values, type, key)

  get_loss_value = (type: S, key: string): number => this.get_value(this.loss_values, type, key)

  private get_value = (container: Map<S, Map<string, number>>, type: S, key: string): number => {
    const values = container.get(type)
    if (!values)
      return 0
    const value = values.get(key)
    if (!value)
      return 0
    return value
  }
}
