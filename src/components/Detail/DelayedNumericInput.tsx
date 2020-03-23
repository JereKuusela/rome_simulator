import React, { Component } from 'react'

import { toPercent, toNumber } from 'formatters'
import { Input } from 'semantic-ui-react'

type IProps = {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
  percent?: boolean
}

type IState = {
  value: string
  timer: NodeJS.Timeout | null
}

/**
 * Custom numeric input which only send an update for numeric value when losing focus or after a delay.
 * This allows entering decimal numbers without the input resetting and also prevents stuttering when the battle doesn't update after every keystroke.
 * */
export default class DelayedNumericInput extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props)
    this.state = { value: this.convertValue(props.value), timer: null }
  }

  convertValue = (value: number) => {
    const { percent } = this.props
    return percent ? toPercent(value) : toNumber(value)
  }

  render() {
    const { disabled } = this.props
    const { value } = this.state
    return (
      <div onBlur={this.onLostFocus}>
        <Input
          size='mini'
          className='small-input'
          value={value}
          disabled={disabled}
          onChange={(_, { value }) => this.onChange(value)}
        />
      </div>

    )
  }

  onLostFocus = () => {
    if (this.state.timer)
      clearTimeout(this.state.timer)
    this.update()
  }

  onChange = (value: string) => {
    if (this.state.timer)
      clearTimeout(this.state.timer)
    this.setState({ value, timer: setTimeout(this.update, 2000) })
  }

  update = () => {
    const { value, onChange, percent } = this.props
    let new_value = Number(percent ? this.state.value.replace('%', '') : this.state.value)
    if (percent)
      new_value /= 100.0
    // Non-numeric values should just reset the previous value.
    if (Number.isNaN(new_value))
      this.setState({ value: this.convertValue(value) })
    else if (value !== new_value) {
      this.setState({ value: this.convertValue(new_value) })
      onChange(new_value)
    }
  }
}
