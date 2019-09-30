import React, { Component } from 'react'
import { Dropdown } from 'semantic-ui-react'

interface IProps<T extends string> {
  value: T
  values: T[]
  onChange?: (value: T) => void
  style?: any
}


export default class DetailDropdown<T extends string> extends Component<IProps<T>> {

  render() {
    const { value, values, onChange } = this.props
    return (
      <Dropdown
        text={value}
        selection
        value={value}
        disabled={!onChange}
      >
        <Dropdown.Menu>
          {
            values.map(item => (
              <Dropdown.Item value={item} text={item} key={item} active={value === item}
                onClick={() => onChange && onChange(item)}
              />
            ))
          }
        </Dropdown.Menu>
      </Dropdown>
    )
  }
}
