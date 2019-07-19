import React, { Component } from 'react'
import { List, Map } from 'immutable'
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
  custom_values?: Map<string, Map<T, number | string | JSX.Element>>
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

  renderRow = (item: BaseDefinition<T, S> | BaseValuesDefinition<T, S> | undefined): JSX.Element | null => {
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
        {
          this.props.custom_values && this.props.custom_values.map((values, key) => (
            <Table.Cell key={key}>
              {values.has(item.type) && values.get(item.type)}
              {values.has(item.type) && (' ' + key)}
            </Table.Cell>
          )).toList()
        }
      </Table.Row>
    )
  }

  onClick = (type: T | undefined): void => {
    this.props.onSelection(type)
    this.props.onClose()
  }
}
