import React, { Component } from 'react'

interface IProps {
  value: number
  reverse?: boolean
  hideZero?: boolean
  formatter: (value: number) => string
  positiveColor?: string
  neutralColor?: string
  negativeColor?: string
}

/**
 * Styles a number with positive/negative color and sign.
 */
export default class StyledNumber extends Component<IProps> {

  render() {
    const { hideZero, value, reverse, formatter, positiveColor, negativeColor, neutralColor } = this.props
    if (hideZero && value === 0)
      return null
    const isPositive = reverse ? value < 0 : value > 0
    const className = value === 0 ? neutralColor || '' : (isPositive ? (positiveColor || 'color-positive') : (negativeColor || 'color-negative'))
    const str = formatter(value)
    return (
      <span className={className}>
        {str}
      </span>
    )
  }
}
