import React, { Component } from 'react'
import { Input as InputUI } from 'semantic-ui-react'

interface IProps<T extends string> {
  value: T
  onChange?: (value: T) => void
  disabled?: boolean
  style?: any
}


export default class Input<T extends string> extends Component<IProps<T>> {

  render() {
    const { value, onChange, style } = this.props
    return (
      <InputUI
        size='mini'
        style={style}
        defaultValue={value}
        disabled={!onChange}
        onChange={(_, { value }) => onChange && onChange(value as T)}
      />
    )
  }
}
