import React, { Component } from 'react'
import { Dropdown as DropdownUI } from 'semantic-ui-react'

interface IProps<T extends string> {
  value: T
  values: ({ value: T, text: string, description?: string } | T)[]
  onChange?: (value: T) => void
  clearable?: boolean
  style?: any
  empty?: string
}


export default class Dropdown<T extends string> extends Component<IProps<T>> {

  getCurrentText = () => {
    const { value, values, empty } = this.props
    const item = values.find(item => typeof item === 'object' ? item.value === value : item === value)
    if (typeof item === 'object')
      return item.text
    if (item)
      return item
    return empty
  }

  render() {
    const { value, values, clearable, onChange, style, empty } = this.props
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
      >
        <DropdownUI.Menu>
          {
            empty && <DropdownUI.Item value={''} text={empty} key={''} active={value === ''}
              onClick={() => onChange && onChange('' as T)}
            />
          }
          {
            values.map(item => (typeof item === 'object' ?
              <DropdownUI.Item value={item.value} text={item.text} key={item.value} active={value === item.value}
                onClick={() => onChange && onChange(item.value)} description={item.description}
              />
              :
              <DropdownUI.Item value={item} text={item} key={item} active={value === item}
                onClick={() => onChange && onChange(item)}
              />
            ))
          }
        </DropdownUI.Menu>
      </DropdownUI>
    )
  }
}
