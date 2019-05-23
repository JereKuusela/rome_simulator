import React, { Component } from 'react'
import { List } from 'immutable'
import { Table, Image } from 'semantic-ui-react'
import { TerrainType, TerrainCalc } from '../store/terrains'
import { UnitType, UnitCalc } from '../store/units'
import { BaseDefinition } from '../utils'
import { TacticType, TacticCalc } from '../store/tactics'

type ItemType = UnitType | TerrainType | TacticType
type ItemAttribute = UnitCalc | TerrainCalc | UnitType | TerrainType | TacticCalc | TacticType

interface IProps<T extends ItemType, S extends ItemAttribute> {
  onClose: () => void
  items: List<BaseDefinition<T, S>>
  onSelection: (type: T | null) => void
  attributes: S[]
  can_remove: boolean
  can_select: boolean
}

export default class ItemSelector<S extends ItemAttribute, T extends ItemType> extends Component<IProps<T, S>> {

  render() {

    return (
          <Table celled selectable>
            <Table.Body>
              {this.props.can_remove ? (
                <Table.Row onClick={() => this.onClick(null)}>
                  <Table.Cell>
                    Remove
                  </Table.Cell>
                </Table.Row>
              ) : null}
              {
                this.props.can_select && this.props.items.map(terrain => this.renderRow(terrain))
              }
            </Table.Body>
          </Table>
        
    )
  }

  renderRow = (item: BaseDefinition<T, S>) => {
    return (
      <Table.Row key={item.type} onClick={() => this.onClick(item.type)}>
        <Table.Cell>
          {item.image ? <Image src={item.image} avatar /> : null}
          {item.type}
        </Table.Cell>
        {
          this.props.attributes.map(attribute => (
            <Table.Cell key={attribute}>
              {item.valueToRelativeNumber(attribute, false)}
            </Table.Cell>
            ))
        }
      </Table.Row>
    )
  }

  onClick = (type: T | null) => {
    this.props.onSelection(type)
    this.props.onClose()
  }
}
