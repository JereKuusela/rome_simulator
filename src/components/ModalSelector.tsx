import React, { Component } from 'react'
import { List } from 'immutable'
import { Modal, Table, Image } from 'semantic-ui-react'
import { TerrainType, TerrainCalc } from '../store/terrains'
import { UnitType, UnitCalc } from '../store/units'
import { BaseDefinition } from '../utils'

type ItemType = UnitType | TerrainType
type ItemAttribute = UnitCalc | TerrainCalc | UnitType | TerrainType

interface IProps<T extends ItemType, S extends ItemAttribute> {
  onClose: () => void
  items: List<BaseDefinition<T, S>>
  onSelection: (type: T | null) => void
  attributes: S[]
  can_remove: boolean
}

export class ModalSelector<S extends ItemAttribute, T extends ItemType> extends Component<IProps<T, S>> {

  render() {

    return (
      <Modal basic onClose={this.props.onClose} open>
        <Modal.Content>
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
                this.props.items.map(terrain => this.renderRow(terrain))
              }
            </Table.Body>
          </Table>
        </Modal.Content>
      </Modal>
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
          this.props.attributes.map(attribute => item.valueToRelativeNumber(attribute, false))
        }
      </Table.Row>
    )
  }

  onClick = (type: T | null) => {
    this.props.onSelection(type)
    this.props.onClose()
  }
}
