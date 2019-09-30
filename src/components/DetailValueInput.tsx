import React, { Component } from 'react'

import DetailInput from './DetailInput'

interface IProps {
  value: number
  onChange?: (value: number) => void
  disabled?: boolean
}


export default class DetailValueInput extends Component<IProps> {

  render() {
    const { value, onChange, disabled } = this.props
    return (
      <DetailInput
        style={{ width: 50 }}
        value={String(value)}
        disabled={disabled}
        onChange={value => onChange && onChange(Number(value))}
      />
    )
  }
}
