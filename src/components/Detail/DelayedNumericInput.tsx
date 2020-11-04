import React, { useCallback, useEffect, useState } from 'react'

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
const DelayedNumericInput = ({ disabled, type, value, percent, onChange, delay }: IProps): JSX.Element => {
  const [currentValue, setCurrentValue] = useState('')

  useEffect(() => {
    setCurrentValue(convertValue(value, percent))
  }, [value, percent])

  const update = useCallback(
    (currentValue: string) => {
      let newValue = Number(percent ? currentValue.replace('%', '') : currentValue)
      if (percent) newValue /= 100.0
      // Non-numeric values should just reset the previous value.
      if (Number.isNaN(newValue)) setCurrentValue(convertValue(value, percent))
      else {
        setCurrentValue(convertValue(value, percent))
        if (value !== newValue) onChange(newValue)
      }
    },
    [onChange, percent, value]
  )

  useEffect(() => {
    const timer = setTimeout(() => update(currentValue), delay ?? 2000)
    return () => {
      clearTimeout(timer)
    }
  }, [currentValue, delay, update])

  const handleBlur = useCallback(() => {
    update(currentValue)
  }, [update, currentValue])

  const handleKeyPress = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter') handleBlur()
    },
    [handleBlur]
  )

  const handleChange = useCallback(
    (_, { value }: InputOnChangeData) => {
      setCurrentValue(value)
    },
    [setCurrentValue]
  )

  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => e.target.select(), [])

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
