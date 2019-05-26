import { Map, OrderedMap } from 'immutable'

export class BaseDefinition<T, S> {
  constructor(public readonly type: T, public readonly image: string | null, public readonly base_values: Map<S, OrderedMap<string, number>> = Map(), public readonly modifier_values: Map<S, OrderedMap<string, number>> = Map(),
  public readonly loss_values: Map<S, OrderedMap<string, number>> = Map()) {

  }

  toPercent = (number: number, show_zero: boolean) => {
    const value = +(number * 100.0).toFixed(2)
    if (value === 0 && !show_zero)
      return ''
    return String(value) + '%'
  }

  toRelativePercent = (number: number, show_zero: boolean) => {
    const value = +(number * 100.0 - 100.0).toFixed(2)
    if (value > 0)
      return '+' + String(value) + '%'
    if (value === 0 && !show_zero)
      return ''
    if (value === 0 && show_zero)
      return '+0%'
    return String(value) + '%'
  }

  toRelativeZeroPercent = (number: number, show_zero: boolean) => {
    const value = +(number * 100.0).toFixed(2)
    if (value > 0)
      return '+' + String(value) + '%'
    if (value === 0 && !show_zero)
      return ''
    if (value === 0 && show_zero)
      return '+0%'
    return String(value) + '%'
  }

  calculateBase = (type: S): number => this.calculateValueSub(this.base_values, type, 0)
  calculateModifier = (type: S): number => this.calculateValueSub(this.modifier_values, type, 1.0)
  calculateLoss = (type: S): number => this.calculateValueSub(this.loss_values, type, 0)

  private calculateValueSub = (container: Map<S, OrderedMap<string, number>>, type: S, initial: number): number => {
    let result = initial
    const values = container.get(type)
    if (values)
      values.forEach(value => result += value)
    return Math.round(result * 1000.0) / 1000.0
    
  }
  calculateValue = (type: S): number => {
    return this.round(this.calculateBase(type) * this.calculateModifier(type) - this.calculateLoss(type))
  }

  round = (number : number) => +(Math.round(1000.0 * number) / 1000.0).toFixed(3)

  calculateValueWithoutLoss = (type: S): number => {
    return this.calculateBase(type) * this.calculateModifier(type)
  }

  valueToString = (type: S): string => (+(this.calculateValue(type).toFixed(2))).toString()

  valueToPercent = (type: S, show_zero: boolean) => this.toPercent(this.calculateValue(type), show_zero)

  valueToRelativePercent = (type: S, show_zero: boolean) => this.toRelativePercent(this.calculateValue(type), show_zero)

  valueToRelativeZeroPercent = (type: S, show_zero: boolean) => this.toRelativeZeroPercent(this.calculateValue(type), show_zero)

  valueToNumber = (type: S, show_zero: boolean) => {
    const value = this.calculateValue(type)
    if (value === 0 && !show_zero)
      return ''
    return +(value).toFixed(2)
  }

  valueToRelativeNumber = (type: S, show_zero: boolean) => {
    const value = this.calculateValue(type)
    if (value > 0)
      return '+' + String(value)
    if (value === 0 && !show_zero)
      return ''
    return +(value).toFixed(2)
  }

  explain = (type: S) => {
    const value_modifier = this.modifier_values.get(type)
    const value_loss = this.loss_values.get(type)
    if ((!value_modifier || value_modifier.size === 0) && (!value_loss || value_loss.size === 0))
      return this.explain_short(type)
    let explanation = ''
    let base = 0
    const value_base = this.base_values.get(type)
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
      explanation += ' multiplied by ' + this.toPercent(modifier, true)
      explanation += ' ('
      value_modifier.forEach((value, key) => explanation += key + ': ' + this.toPercent(value, true) + ', ')
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

  protected add_values = (container: Map<S, OrderedMap<string, number>>, key: string, values: [S, number][]): Map<S, OrderedMap<string, number>> => {
    let new_values = container
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

  get_base_value = (type: S, key: string): number => this.get_value(this.base_values, type, key)

  get_modifier_value = (type: S, key: string): number => this.get_value(this.modifier_values, type, key)

  get_loss_value = (type: S, key: string): number => this.get_value(this.loss_values, type, key)

  private get_value = (container: Map<S, OrderedMap<string, number>>, type: S, key: string): number => {
    const values = container.get(type)
    if (!values)
      return 0
    const value = values.get(key)
    if (!value)
      return 0
    return value
  }
}
