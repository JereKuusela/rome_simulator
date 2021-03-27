import React from 'react'
import { Input } from '../Utils/Inputs'

type Props = {
  value: number
  onChange?: (value: number) => void
  disabled?: boolean
}

const DetailValueInput = ({ value, onChange, disabled }: Props) => {
  return (
    <Input
      style={{ width: 50 }}
      value={String(value)}
      disabled={disabled}
      onChange={value => onChange && onChange(Number(value))}
    />
  )
}

export default DetailValueInput
