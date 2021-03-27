import React, { ChangeEvent, useEffect, useState } from 'react'
import { Input as InputUI } from 'semantic-ui-react'

type Props<T extends string> = {
  value: T
  onChange?: (value: T) => void
  disabled?: boolean
  onBlur?: () => void
  style?: unknown
}

export const Input = <T extends string>({ value, onChange, onBlur, style }: Props<T>) => {
  return (
    <InputUI
      size='mini'
      style={style}
      defaultValue={value}
      disabled={!onChange}
      onBlur={onBlur}
      onChange={(_, { value }) => onChange && onChange(value as T)}
    />
  )
}

export const FileInput = ({ onChange, style }: { onChange: (file: File) => void; style?: unknown }) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) onChange(event.target.files[0])
  }
  return <InputUI type='file' onChange={handleChange} style={style} />
}

interface InputDelayedProps<T extends string> {
  value: T
  onChange: (value: T) => void
  style?: unknown
}

export const InputDelayed = <T extends string>({ value, onChange, style }: InputDelayedProps<T>) => {
  const [currentValue, setCurrentValue] = useState(value)
  useEffect(() => {
    setCurrentValue(value)
  }, [value])

  const handleBlur = () => {
    onChange(currentValue)
  }
  return <Input onBlur={handleBlur} style={style} value={value} onChange={setCurrentValue} />
}
