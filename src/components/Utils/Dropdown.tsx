import React, { Component } from 'react'
import { Dropdown as DropdownUI } from 'semantic-ui-react'

interface IProps<T extends string> {
  value: T
  values: T[]
  onChange?: (value: T) => void
  clearable?: boolean
}


export default class Dropdown<T extends string> extends Component<IProps<T>> {

  render() {
    const { value, values, clearable, onChange } = this.props
    return (
      <DropdownUI
        text={value}
        className='selection'
        clearable={clearable}
        value={value}
        disabled={!onChange}
        onChange={(_, { value }) => onChange && onChange(value as T)}
      >
        <DropdownUI.Menu>
          {
            values.map(item => (
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
