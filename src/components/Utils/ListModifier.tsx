import React from 'react'
import { List } from 'semantic-ui-react'
import { Modifier, ModifierType } from 'types'

type Props = {
  name: string | null
  modifiers: Modifier[]
  padding?: string
  showZero?: boolean
  horizontal?: boolean
}

const getText = (modifier: Modifier) => {
  if (modifier.target in ModifierType) return <span>{modifier.attribute}</span>
  return <span>{modifier.target + ' ' + modifier.attribute + ''}</span>
}

const getValue = (modifier: Modifier, showZero = false, padding = '') => {
  if (!modifier.value && !showZero) return null
  const sign = modifier.value >= 0 ? '+' : '-'
  let value = Math.abs(modifier.value)
  value = modifier.noPercent ? value : value * 100
  value = +value.toFixed(3)
  const str = modifier.noPercent ? value + padding : value + ' %'
  return (
    <span className={modifier.negative ? 'color-negative' : 'color-positive'} style={{ float: 'right', marginLeft: 4 }}>
      {sign + str}
    </span>
  )
}

const ListModifier = ({ modifiers, name, showZero, padding, horizontal }: Props) => {
  return (
    <List horizontal={horizontal}>
      {name && (
        <List.Item key='name'>
          <List.Header>{name}</List.Header>
        </List.Item>
      )}
      {modifiers.map((modifier, index) => (
        <List.Item key={index}>
          {getText(modifier)} {getValue(modifier, showZero, padding)}
        </List.Item>
      ))}
    </List>
  )
}

export default ListModifier
