import React, { Component } from 'react'
import { List } from 'immutable'
import { Table, Image } from 'semantic-ui-react'
import { TerrainType, TerrainCalc } from '../store/terrains'
import { UnitType, UnitCalc } from '../store/units'
import { BaseValuesDefinition, BaseDefinition, valueToRelativeNumber, getImage } from '../base_definition'
import { TacticType, TacticCalc } from '../store/tactics'

type ItemType = UnitType | TerrainType | TacticType
type ItemAttribute = UnitCalc | TerrainCalc | UnitType | TerrainType | TacticCalc | TacticType

interface IProps<T extends ItemType, S extends ItemAttribute> {
  onClose: () => void
  items: List<BaseDefinition<T, S> | BaseValuesDefinition<T, S> | undefined>
  onSelection: (type: T | undefined) => void
  attributes?: S[]
}

export default class ItemSelector<S extends ItemAttribute, T extends ItemType> extends Component<IProps<T, S>> {

  render() {

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

  renderRow = (item: BaseDefinition<T, S> | BaseValuesDefinition<T, S> | undefined) => {
    if (!item)
      return null
    return (
      <Table.Row key={item.type} onClick={() => this.onClick(item.type)}>
        <Table.Cell>
          {<Image src={getImage(item)} avatar />}
          {item.type}
        </Table.Cell>
        {
          this.props.attributes && this.props.attributes.map(attribute => (
            <Table.Cell key={attribute}>
              {valueToRelativeNumber(item, attribute, false)}
            </Table.Cell>
          ))
        }
      </Table.Row>
    )
  }

  onClick = (type: T | undefined) => {
    this.props.onSelection(type)
    this.props.onClose()
  }
}
