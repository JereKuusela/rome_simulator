import React, { Component } from 'react'
import { Dropdown as DropdownUI } from 'semantic-ui-react'

interface IProps<T extends string> {
  value: T
  values: ({ value: T, text: string } | T)[]
  onChange?: (value: T) => void
  clearable?: boolean
  style?: any
  search?: boolean
}


export default class Dropdown<T extends string> extends Component<IProps<T>> {

  getCurrentText = () => {
    const { value, values } = this.props
    const item = values.find(item => typeof item === 'object' ? item.value === value : item === value)
    if (typeof item === 'object')
      return item.text
    if (item)
      return item
    return ''
  }

  getOptions = () => (
    this.props.values.map(item => {
      if (typeof item === 'object')
        return { key: item.value, value: item.value, text: item.text }
      else
        return { key: item, value: item, text: item }
    })
  )

  render() {
    const { value, clearable, onChange, style, search } = this.props
    return (
      <DropdownUI
        text={this.getCurrentText()}
        className='selection'
        clearable={clearable}
        value={value}
        disabled={!onChange}
        onChange={(_, { value }) => onChange && onChange(value as T)}
        style={style}
        compact={!!style}
        search={search}
        options={this.getOptions()}
      >
      </DropdownUI>
    )
  }
}
