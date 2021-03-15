import React, { useEffect, useRef, useState } from 'react'

import { toPercent, toNumber } from 'formatters'
import { Input, InputOnChangeData } from 'semantic-ui-react'

type IProps = {
  value: number
  type?: string
  onChange: (value: number) => void
  disabled?: boolean
  percent?: boolean
  delay?: number
}

const convertValue = (value: number, percent?: boolean) => {
  return percent ? toPercent(value) : toNumber(value)
}

/**
 * Custom numeric input which only send an update for numeric value when losing focus or after a delay.
 * This allows entering decimal numbers without the input resetting and also prevents stuttering when the battle doesn't update after every keystroke.
 */
const DelayedNumericInput = ({ disabled, type, value, percent, onChange, delay }: IProps) => {
  const [currentValue, setCurrentValue] = useState('')
  const timer = useRef<NodeJS.Timeout | null>()

  useEffect(() => {
    setCurrentValue(convertValue(value, percent))
  }, [value, percent])

  const clearTimer = () => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
  }

  const update = (currentValue: string) => {
    let newValue = Number(percent ? currentValue.replace('%', '') : currentValue)
    if (percent) newValue /= 100.0
    // Non-numeric values should just reset the previous value.
    if (Number.isNaN(newValue)) setCurrentValue(convertValue(value, percent))
    else {
      setCurrentValue(convertValue(newValue, percent))
      if (value !== newValue) onChange(newValue)
    }
  }

  const setValue = (newValue: string) => {
    setCurrentValue(newValue)
    clearTimer()
    timer.current = setTimeout(() => update(newValue), delay ?? 2000)
  }

  const handleBlur = () => {
    clearTimer()
    update(currentValue)
  }
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') handleBlur()
  }

  const handleChange = (_: unknown, { value }: InputOnChangeData) => {
    setValue(value)
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => e.target.select()

  return (
    <div onBlur={handleBlur} style={{ display: 'inline-block' }}>
      <Input
        size='mini'
        className='small-input'
        value={currentValue}
        type={type}
        disabled={disabled}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        onFocus={handleFocus}
      />
    </div>
  )
}

export default DelayedNumericInput
