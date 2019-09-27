import React, { Component } from 'react'
import { Dropdown } from 'semantic-ui-react'

interface IProps<T> {
  readonly items: T[]
  readonly value: T
  readonly onSelect: (item: T) => void
  readonly clearable?: boolean
}

/**
 * Simple dropdown selector.
 */
export default class DropdownSelector<T extends string> extends Component<IProps<T>> {

  render(): JSX.Element {
    const { value, clearable, onSelect, items } = this.props
    return (
      <Dropdown
        text={value}
        selection
        clearable={clearable}
        value={value}
        onChange={(_, { value }) => onSelect(value as T)}
      >
        <Dropdown.Menu>
          {
            items.map(item => (
              <Dropdown.Item
                value={item} text={item} key={item}
                active={value === item}
                onClick={() => onSelect(item)}
              />
            ))
          }
        </Dropdown.Menu>
      </Dropdown>
    )
  }
}
