import React, { Component } from 'react'
import { Modal, Table, Input } from 'semantic-ui-react'
import { UnitType } from '../store/units'
import { TacticDefinition, ValueType, TacticType, TacticCalc } from '../store/tactics'

interface IProps {
  custom_value_key: string
  tactic: TacticDefinition | undefined
  onClose: () => void
  onCustomBaseValueChange: (type: TacticType, key: string, attribute: ValueType,  value: number) => void
}

// Display component for showing and changing tactic details.
export class ModalTacticDetail extends Component<IProps> {

  readonly attributes = Object.keys(TacticCalc).map(k => TacticCalc[k as any]) as TacticCalc[]
  readonly tactics = Object.keys(TacticType).map(k => TacticType[k as any]) as TacticType[]
  readonly units = Object.keys(UnitType).map(k => UnitType[k as any]).sort() as UnitType[]
  readonly headers = ['Attribute', 'Value', 'Explained', 'Custom base']

  render() {
    if (this.props.tactic === undefined)
      return null
    const tactic = this.props.tactic
    return (
      <Modal basic onClose={this.props.onClose} open>
        <Modal.Content>
          <Table celled selectable>
            <Table.Header>
              <Table.Row>
                {
                  Array.from(this.headers).map((value) => (
                    <Table.HeaderCell key={value}>
                      {value}
                    </Table.HeaderCell>
                  ))
                }
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {
                this.units.map((value) => this.renderRow(tactic, value))
              }
              {
                this.tactics.map((value) => this.renderRow(tactic, value))
              }
              {
                this.attributes.map((value) => this.renderRow(tactic, value))
              }
            </Table.Body>
          </Table>
        </Modal.Content>
      </Modal>
    )
  }

  renderRow = (tactic: TacticDefinition, attribute: ValueType) => {
    let base_value = tactic.get_base_value(attribute, this.props.custom_value_key)

    return (
      <Table.Row key={attribute}>
        <Table.Cell>
          {attribute}
        </Table.Cell>
        <Table.Cell>
          {tactic.valueToString(attribute)}
        </Table.Cell>
        <Table.Cell>
          {tactic.explain(attribute)}
        </Table.Cell>
        <Table.Cell>
          <Input
            defaultValue={base_value}
            onChange={(_, data) => this.props.onCustomBaseValueChange(tactic.type, this.props.custom_value_key, attribute, Number(data.value))
            }
          />
        </Table.Cell>
      </Table.Row>
    )
  }
}
