import React, { Component } from 'react'
import { Dropdown } from 'semantic-ui-react'

interface IProps<T extends string | number> {
  value: T
  values: ({ value: T; text: string } | T)[]
  onChange?: (value: T) => void
  clearable?: boolean
  onAdd?: (value: T) => void
  style?: any
  search?: boolean
  placeholder?: string
}

export default class SimpleDropdown<T extends string | number> extends Component<IProps<T>> {
  getOptions = () =>
    this.props.values.map(item => {
      if (typeof item === 'object') return { key: item.value, value: item.value, text: item.text }
      else return { key: item, value: item, text: item }
    })

  render() {
    const { value, clearable, onChange, onAdd, search, placeholder } = this.props
    const style = this.props.style ?? { minWidth: 170, maxWidth: 170 }
    return (
      <Dropdown
        className='selection'
        clearable={clearable}
        value={value}
        disabled={!onChange}
        onAddItem={(_, { value }) => onAdd && onAdd(value as T)}
        onChange={(_, { value }) => onChange && onChange(value as T)}
        style={style}
        compact={!!style}
        search={search || !!onAdd}
        selection
        options={this.getOptions()}
        placeholder={placeholder}
        allowAdditions={!!onAdd}
      />
    )
  }
}
