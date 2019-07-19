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

  render(): JSX.Element | string {
    if (this.props.hide_zero && this.props.value === 0)
      return ''
    const is_positive = this.props.reverse ? this.props.value < 0 : this.props.value > 0
    const className = this.props.value === 0 ? '' : (is_positive ? 'value-positive' : 'value-negative')
    const str = this.props.formatter(this.props.value)
    return (
        <span className={className}>
        {str}
        </span>
    )
  }
}
