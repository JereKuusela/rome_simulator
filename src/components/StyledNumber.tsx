import React, { Component } from 'react'

interface IProps {
  readonly value: number
  readonly reverse?: boolean
  readonly hide_zero?: boolean
  readonly formatter: (value: number) => string
}

/**
 * Styles a number with positive/negative color and sign.
 */
export default class StyledNumber extends Component<IProps> {

  render() {
    const { hide_zero, value, reverse, formatter } = this.props
    if (hide_zero && value === 0)
      return null
    const is_positive = reverse ? value < 0 : value > 0
    const className = value === 0 ? '' : (is_positive ? 'value-positive' : 'value-negative')
    const str = formatter(value)
    return (
      <span className={className}>
        {str}
      </span>
    )
  }
}
