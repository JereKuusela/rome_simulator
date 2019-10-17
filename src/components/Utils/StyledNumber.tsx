import React, { Component } from 'react'

interface IProps {
  value: number
  reverse?: boolean
  hide_zero?: boolean
  formatter: (value: number) => string
  positive_color?: string
  negative_color?: string
}

/**
 * Styles a number with positive/negative color and sign.
 */
export default class StyledNumber extends Component<IProps> {

  render() {
    const { hide_zero, value, reverse, formatter, positive_color, negative_color } = this.props
    if (hide_zero && value === 0)
      return null
    const is_positive = reverse ? value < 0 : value > 0
    const className = value === 0 ? '' : (is_positive ? (positive_color || 'value-positive') : (negative_color || 'value-negative'))
    const str = formatter(value)
    return (
      <span className={className}>
        {str}
      </span>
    )
  }
}
