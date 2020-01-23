import React, { Component } from 'react'
import { Table, Image } from 'semantic-ui-react'

import { UnitType, TerrainType, TacticType } from 'types'
import { toArr, getImage } from 'utils'

interface Item<T extends ItemType> {
  type: T,
  image?: string
}

type ItemType = UnitType | TerrainType | TacticType

export type SelectorAttributes<T extends ItemType> = { [key: string]: { [key in T]: number | string | JSX.Element | null } }

interface IProps<T extends ItemType> {
  items: Item<T>[]
  onSelection: (type: T) => void
  attributes?: SelectorAttributes<T>
}

/**
 * Component for selecting items.
 */
export default class ItemSelector<T extends ItemType> extends Component<IProps<T>> {

  render() {
    const { items } = this.props
    return (
      <Table celled selectable unstackable>
        <Table.Body>
          {items.map(this.renderRow)}
        </Table.Body>
      </Table>
    )
  }

  renderRow = (item: Item<T>) => {
    const { onSelection, attributes } = this.props
    return (
      <Table.Row key={item.type} onClick={() => onSelection(item.type)}>
        <Table.Cell>
          <Image src={getImage(item)} avatar />
          {item.type}
        </Table.Cell>
        {attributes ? this.renderAttributes(item, attributes) : null}
      </Table.Row>
    )
  }

  renderAttributes = (item: Item<T>, attributes: SelectorAttributes<T>) => (
    toArr(attributes, (values, key) => (
      <Table.Cell key={key}>
        {/* This might be a React Element so must be rendered separately.*/}
        {values[item.type]}
        {values[item.type] ? (' ' + key) : null}
      </Table.Cell>
    ))
  )
}
