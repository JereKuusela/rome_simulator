import React, { Component } from 'react'
import { Modal, Table, Input, Image } from 'semantic-ui-react'
import { UnitType, unit_to_icon } from '../store/units'
import { TacticDefinition, ValueType, TacticType, TacticCalc, tactic_to_icon } from '../store/tactics'

interface IProps {
  custom_value_key: string
  tactic: TacticDefinition | undefined
  onClose: () => void
  onCustomBaseValueChange: (type: TacticType, key: string, attribute: ValueType, value: number) => void
}

// Display component for showing and changing tactic details.
export class ModalTacticDetail extends Component<IProps> {

  readonly attributes = Object.keys(TacticCalc).map(k => TacticCalc[k as any]) as TacticCalc[]
  readonly tactics = Object.keys(TacticType).map(k => TacticType[k as any]) as TacticType[]
  readonly units = Object.keys(UnitType).map(k => UnitType[k as any]).sort() as UnitType[]
  readonly headers = ['Attribute', 'Value', 'Custom value', 'Explained']

  render() {
    if (this.props.tactic === undefined)
      return null
    const tactic = this.props.tactic
    return (
      <Modal basic onClose={this.props.onClose} open>
        <Modal.Content>
          <Table celled>
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
                this.units.map((value) => this.renderRow(tactic, value, false, unit_to_icon.get(value)))
              }
              {
                this.tactics.map((value) => this.renderRow(tactic, value, true, tactic_to_icon.get(value)))
              }
              {
                this.attributes.map((value) => this.renderRow(tactic, value, true, undefined))
              }
            </Table.Body>
          </Table>
        </Modal.Content>
      </Modal>
    )
  }

  renderRow = (tactic: TacticDefinition, attribute: ValueType, relative: boolean, image: string | undefined) => {
    let base_value = tactic.get_base_value(attribute, this.props.custom_value_key)

    return (
      <Table.Row key={attribute}>
        <Table.Cell collapsing>
          {image ? <Image src={image} avatar /> : <div className='ui avatar image' />}
          {attribute}
        </Table.Cell>
        <Table.Cell collapsing>
          {relative ? tactic.valueToRelativeZeroPercent(attribute, true) : tactic.valueToPercent(attribute, true)}
        </Table.Cell>
        <Table.Cell collapsing>
          <Input
            size='mini'
            defaultValue={base_value}
            onChange={(_, data) => this.props.onCustomBaseValueChange(tactic.type, this.props.custom_value_key, attribute, Number(data.value))
            }
          />
        </Table.Cell>
        <Table.Cell>
          {tactic.explain_short(attribute)}
        </Table.Cell>
      </Table.Row>
    )
  }
}
