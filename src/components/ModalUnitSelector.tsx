import React, { Component } from 'react'
import { Modal, Table, Image } from 'semantic-ui-react'
import { UnitType, unit_to_icon } from '../store/units'

interface IProps {
  onClose: () => void
  onUnitSelection: (type: UnitType | null) => void
}

export class ModalUnitSelector extends Component<IProps> {

  readonly units = Object.keys(UnitType).map(k => UnitType[k as any]).sort() as UnitType[]

  render() {

    return (
      <Modal basic onClose={this.props.onClose} open>
        <Modal.Content>
          <Table celled selectable>
            <Table.Body>
              <Table.Row onClick={() => this.onClick(null)}>
                <Table.Cell>
                  Remove
                </Table.Cell>
              </Table.Row>
              {
                this.units.map((value) => this.renderRow(value))
              }
            </Table.Body>
          </Table>
        </Modal.Content>
      </Modal>
    )
  }

  renderRow = (unit: UnitType) => {
    return (
      <Table.Row key={unit} onClick={() => this.onClick(unit)}>
        <Table.Cell>
          <Image src={unit_to_icon.get(unit)} avatar />
          {unit}
        </Table.Cell>
      </Table.Row>
    )
  }

  onClick = (unit: UnitType | null) => {
    this.props.onUnitSelection(unit)
    this.props.onClose()
  }
}
