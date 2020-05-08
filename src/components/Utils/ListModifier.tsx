import React, { Component } from 'react'
import { List } from 'semantic-ui-react'
import { Modifier, ModifierType } from 'types'

type IProps = {
  name: string | null
  modifiers: Modifier[]
  padding?: string
}

/** Renders modifiers as a list. */
export default class ListModifier extends Component<IProps> {

  render() {
    const { modifiers, name, padding } = this.props
    return (
      <List>
        {name &&
          <List.Item key='name'>
            <List.Header>
              {name}
            </List.Header>
          </List.Item>
        }
        {
          modifiers.map((modifier, index) => (
            <List.Item key={index}>
              {
                this.getText(modifier)
              }
              {
                this.getValue(modifier, padding)
              }
            </List.Item>
          ))
        }
      </List>
    )
  }

  getText = (modifier: Modifier) => {
    if (modifier.target in ModifierType)
      return <span>{modifier.attribute}</span>
    return <span>{modifier.target + ' ' + modifier.attribute}</span>
  }

  getValue = (modifier: Modifier, padding: string = '') => {
    if (!modifier.value)
      return null
    const sign = modifier.value > 0 ? '+' : '-'
    const value = Math.abs(modifier.value)
    const str = modifier.noPercent ? value + padding : +(value * 100).toFixed(2) + ' %'
    return <span className={modifier.negative ? 'color-negative' : 'color-positive'} style={{ float: 'right' }}>{sign + str}</span>
  }
}
