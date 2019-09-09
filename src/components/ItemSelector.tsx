import React, { Component } from 'react'
import { Table, Image } from 'semantic-ui-react'
import { TerrainType, TerrainCalc } from '../store/terrains'
import { UnitType, UnitCalc } from '../store/units'
import { BaseValuesDefinition, BaseDefinition, getImage } from '../base_definition'
import { TacticType, TacticCalc } from '../store/tactics'
import { toArr, has } from '../utils'

type ItemType = UnitType | TerrainType | TacticType
type ItemAttribute = UnitCalc | TerrainCalc | UnitType | TerrainType | TacticCalc | TacticType

export type SelectorAttributes<T extends ItemType> = { [key: string]: { [key in T]: number | string | JSX.Element } }

interface IProps<T extends ItemType, S extends ItemAttribute> {
  onClose: () => void
  items: (BaseDefinition<T, S> | BaseValuesDefinition<T, S> | null)[]
  onSelection: (type: T | null) => void
  attributes?: SelectorAttributes<T>
}

export default class ItemSelector<S extends ItemAttribute, T extends ItemType> extends Component<IProps<T, S>> {

  render(): JSX.Element {
    return (
      <Table celled selectable unstackable>
        <Table.Body>
          {
            this.props.items.map(item => this.renderRow(item))
          }
        </Table.Body>
      </Table>
    )
  }

  renderRow = (item: BaseDefinition<T, S> | BaseValuesDefinition<T, S> | null): JSX.Element | null => {
    if (!item)
      return null
    return (
      <Table.Row key={item.type} onClick={() => this.onClick(item.type)}>
        <Table.Cell>
          {<Image src={getImage(item)} avatar />}
          {item.type}
        </Table.Cell>
        {
          this.props.attributes && toArr(this.props.attributes, (values, key) => (
            <Table.Cell key={key}>
              {has(values, item.type) && values[item.type]}
              {has(values, item.type) && (' ' + key)}
            </Table.Cell>
          ))
        }
      </Table.Row>
    )
  }

  onClick = (type: T | null): void => {
    this.props.onSelection(type)
    this.props.onClose()
  }
}
