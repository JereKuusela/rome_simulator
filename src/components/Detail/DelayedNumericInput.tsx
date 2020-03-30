import React, { Component } from 'react'

import { toPercent, toNumber } from 'formatters'
import { Input } from 'semantic-ui-react'

type IProps = {
  value: number
  type?: string
  onChange: (value: number) => void
  disabled?: boolean
  percent?: boolean
  delay?: number
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

  shouldComponentUpdate(prevProps: IProps, prevState: IState) {
    return this.state.value !== prevState.value || prevProps.value !== this.props.value
  }

  componentDidUpdate(prevProps: IProps) {
    if (prevProps.value !== this.props.value)
      this.setState({ value: this.convertValue(this.props.value) })
  }

  render() {
    const { disabled, type } = this.props
    const { value } = this.state
    return (
      <div onBlur={this.onLostFocus} style={{ display: 'inline-block' }}>
        <Input
          size='mini'
          className='small-input'
          value={value}
          type={type}
          disabled={disabled}
          onChange={(_, { value }) => this.onChange(value)}
          onKeyPress={this.onKeyPress}
          onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.select()}
        />
      </div>

    )
  }

  onKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter')
      this.onLostFocus()
  }

  onLostFocus = () => {
    if (this.state.timer)
      clearTimeout(this.state.timer)
    this.update()
  }

  onChange = (value: string) => {
    if (this.state.timer)
      clearTimeout(this.state.timer)
    this.setState({ value, timer: setTimeout(this.update, this.props.delay ?? 2000) })
  }

  update = () => {
    const { value, onChange, percent } = this.props
    let new_value = Number(percent ? this.state.value.replace('%', '') : this.state.value)
    if (percent)
      new_value /= 100.0
    // Non-numeric values should just reset the previous value.
    if (Number.isNaN(new_value))
      this.setState({ value: this.convertValue(value) })
    else {
      this.setState({ value: this.convertValue(new_value) })
      if (value !== new_value)
        onChange(new_value)
    }
  }
}
