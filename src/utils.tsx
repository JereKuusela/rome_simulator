import { Map } from 'immutable'

export class BaseDefinition<T, S> {
  constructor(public readonly type: T, public readonly image: string | null, protected readonly base_values: Map<S, Map<string, number>> = Map(), protected readonly modifier_values: Map<S, Map<string, number>> = Map(),
    protected readonly loss_values: Map<S, Map<string, number>> = Map()) {

  }

  toPercent = (number: number, show_zero: boolean) => {
    const value = +(number * 100).toFixed(2)
    if (value === 0 && !show_zero)
      return ''
    return String(value) + '%'
  }

  toRelativePercent = (number: number, show_zero: boolean) => {
    const value = +(number * 100).toFixed(2) - 100
    if (value > 0)
      return '+' + String(value) + '%'
    if (value === 0 && !show_zero)
      return ''
    return String(value) + '%'
  }

  toRelativeZeroPercent = (number: number, show_zero: boolean) => {
    const value = +(number * 100).toFixed(2)
    if (value > 0)
      return '+' + String(value) + '%'
    if (value === 0 && !show_zero)
      return ''
    return String(value) + '%'
  }

  calculateValue = (type: S): number => {
    let value = this.calculateValueWithoutLoss(type)
    let loss = 0
    const value_loss = this.loss_values.get(type)
    if (value_loss)
      value_loss.forEach(value => loss += value)
    return value - loss
  }

  calculateValueWithoutLoss = (type: S): number => {
    let base = 0
    const value_base = this.base_values.get(type)
    if (value_base)
      value_base.forEach(value => base += value)
    let modifier = 1.0
    const value_modifier = this.modifier_values.get(type)
    if (value_modifier)
      value_modifier.forEach(value => modifier += value)
    return base * modifier
  }

  valueToString = (type: S): string => String(this.calculateValue(type))

  valueToPercent = (type: S, show_zero: boolean) => this.toPercent(this.calculateValue(type), show_zero)

  valueToRelativePercent = (type: S, show_zero: boolean) => this.toRelativePercent(this.calculateValue(type), show_zero)

  valueToRelativeZeroPercent = (type: S, show_zero: boolean) => this.toRelativeZeroPercent(this.calculateValue(type), show_zero)

  valueToNumber = (type: S, show_zero: boolean) => {
    const value = this.calculateValue(type)
    if (value === 0 && !show_zero)
      return ''
    return String(value)
  }

  valueToRelativeNumber = (type: S, show_zero: boolean) => {
    const value = this.calculateValue(type)
    if (value > 0)
      return '+' + String(value)
    if (value === 0 && !show_zero)
      return ''
    return String(value)
  }

  explain = (type: S) => {
    let base = 0
    const value_base = this.base_values.get(type)
    if (value_base)
      value_base.forEach(value => base += value)
    let explanation = 'Base value ' + base
    if (value_base) {
      explanation += ' ('
      value_base.forEach((value, key) => explanation += key + ': ' + value + ', ')
      explanation = explanation.substring(0, explanation.length - 2) + ')'
    }
    let modifier = 1.0
    const value_modifier = this.modifier_values.get(type)
    if (value_modifier)
      value_modifier.forEach(value => modifier += value)
    if (value_modifier && value_modifier.size > 0) {
      explanation += ' multiplied by ' + this.toPercent(modifier, true)
      explanation += ' ('
      value_modifier.forEach((value, key) => explanation += key + ': ' + this.toPercent(value, true) + ', ')
      explanation = explanation.substring(0, explanation.length - 2) + ')'
    }
    let loss = 0
    const value_loss = this.loss_values.get(type)
    if (value_loss)
      value_loss.forEach(value => loss += value)
    if (value_loss && value_loss.size > 0) {
      explanation += ' reduced by losses ' + loss
      explanation += ' ('
      value_loss.forEach((value, key) => explanation += key + ': ' + value + ', ')
      explanation = explanation.substring(0, explanation.length - 2) + ')'
    }
    return explanation
  }

  explain_short = (type: S) => {
    let base = 0
    const value_base = this.base_values.get(type)
    if (value_base)
      value_base.forEach(value => base += value)
    let explanation = ''
    if (value_base) {
      value_base.forEach((value, key) => explanation += key + ': ' + value + ', ')
      explanation = explanation.substring(0, explanation.length - 2)
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
