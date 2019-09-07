import React, { Component } from 'react'
import { Dropdown } from 'semantic-ui-react'

interface IProps<T> {
  readonly items: T[]
  readonly active: T
  readonly onSelect: (item: T) => void
  readonly clearable?: boolean
}

/**
 * Simple dropdown selector.
 */
export default class DropdownSelector<T extends string> extends Component<IProps<T>> {

  render(): JSX.Element {
    const name = this.props.active
    return (
      <Dropdown
        text={name}
        selection
        clearable={this.props.clearable}
        value={name}
        onChange={(_, { value }) => this.props.onSelect(value as T)}
      >
        <Dropdown.Menu>
          {
            this.props.items.map(item => (
              <Dropdown.Item value={item} text={item} key={item} active={name === item}
              onClick={() => this.props.onSelect(item)}
              />
            ))
          }
        </Dropdown.Menu>
      </Dropdown>
    )
  }
}
