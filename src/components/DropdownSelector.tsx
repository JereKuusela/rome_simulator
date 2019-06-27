import React, { Component } from 'react'
import { Collection } from 'immutable'
import { Dropdown } from 'semantic-ui-react'

interface IProps<T> {
  readonly items: Collection<any, T>
  readonly active: T
  readonly onSelect: (item: T) => void
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
        value={name}
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
