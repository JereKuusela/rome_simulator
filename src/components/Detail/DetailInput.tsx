import React, { Component } from 'react'
import { Input } from 'semantic-ui-react'

interface IProps<T extends string> {
  value: T
  onChange?: (value: T) => void
  disabled?: boolean
  style?: any
}


export default class DetailInput<T extends string> extends Component<IProps<T>> {

  render() {
    const { value, onChange, style } = this.props
    return (
      <Input
        size='mini'
        style={style}
        defaultValue={value}
        disabled={!onChange}
        onChange={(_, { value }) => onChange && onChange(value as T)}
      />
    )
  }
}
