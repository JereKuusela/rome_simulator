import React, { Component } from 'react'
import { Modal, Table, Input } from 'semantic-ui-react'
import { UnitType, UnitDefinition, UnitCalc, ArmyType } from '../store/units'

interface IProps {
  army: ArmyType
  custom_value_key: string,
  unit: UnitDefinition,
  onClose: () => void,
  onCustomBaseValueChange: (army: ArmyType, type: UnitType, attribute: UnitCalc | UnitType, key: string, value: number) => void,
  onCustomModifierValueChange: (army: ArmyType, type: UnitType, attribute: UnitCalc | UnitType, key: string, value: number) => void,
}

// Display component for showing and changing unit details.
export class ModalUnitDetail extends Component<IProps> {

  render() {
    const attributes = Object.keys(UnitCalc).map(k => UnitCalc[k as any]) as UnitCalc[]
    const units = Object.keys(UnitType).map(k => UnitType[k as any]).sort() as UnitType[]
    const headers = ['Attribute', 'Value', 'Explained', 'Custom base', 'Custom modifier']
    return (
      <Modal basic onClose={this.props.onClose} open>
        <Modal.Content>
          <Table celled selectable>
            <Table.Header>
              <Table.Row>
                {
                  Array.from(headers).map((value) => {
                    return (
                      <Table.HeaderCell key={value}>
                        {value}
                      </Table.HeaderCell>
                    )
                  })
                }
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {
                Array.from(attributes).map((value) => {
                  return this.renderRow(this.props.unit, value)
                })
              }
              {
                Array.from(units).map((value) => {
                  return this.renderRow(this.props.unit, value)
                })
              }
            </Table.Body>
          </Table>
        </Modal.Content>
      </Modal>
    )
  }

  renderRow = (unit: UnitDefinition, attribute: UnitCalc | UnitType) => {
    let base_value = unit.get_base_value(attribute, this.props.custom_value_key)
    let modifier_value = unit.get_modifier_value(attribute, this.props.custom_value_key)

    return (
      <Table.Row key={attribute}>
        <Table.Cell>
          {attribute}
        </Table.Cell>
        <Table.Cell>
          {unit.valueToString(attribute)}
        </Table.Cell>
        <Table.Cell>
          {unit.explain(attribute)}
        </Table.Cell>
        <Table.Cell>
          <Input
            defaultValue={base_value}
            onChange={(_, data) => this.props.onCustomBaseValueChange(this.props.army, unit.type, attribute, this.props.custom_value_key, Number(data.value))
            }
          />
        </Table.Cell>
        <Table.Cell>
          <Input
            defaultValue={modifier_value}
            onChange={(_, data) => this.props.onCustomModifierValueChange(this.props.army, unit.type, attribute, this.props.custom_value_key, Number(data.value))}
          />
        </Table.Cell>
      </Table.Row>
    )
  }
}
