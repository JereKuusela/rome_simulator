import React, { Component } from 'react'

interface IProps {
  readonly value: number
  readonly reverse?: boolean
}

/**
 * Styles a number with positive/negative color and sign.
 */
export default class StyledNumber extends Component<IProps> {

  render(): JSX.Element {
    const is_positive = this.props.reverse ? this.props.value <= 0 : this.props.value >= 0
    const sign = this.props.value >= 0 ? '+' : '-'
    const str = Math.abs(this.props.value)
    return (
        <span className={is_positive ? 'value-positive' : 'value-negative'}>
        {sign + str}
        </span>
    )
  }
}

  