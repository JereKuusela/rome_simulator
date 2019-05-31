import React, { Component } from 'react'
import { Table, Input } from 'semantic-ui-react'
import { TerrainDefinition, ValueType, TerrainType, TerrainCalc, valueToString } from '../store/terrains'
import { get_base_value, explain_short } from '../base_definition'

interface IProps {
  custom_value_key: string
  terrain: TerrainDefinition
  onCustomBaseValueChange: (type: TerrainType, key: string, attribute: ValueType, value: number) => void
}

// Display component for showing and changing terrain details.
export default class TerrainDetail extends Component<IProps> {

  readonly attributes = Object.keys(TerrainCalc).map(k => TerrainCalc[k as any]) as TerrainCalc[]
  readonly headers = ['Attribute', 'Value', 'Custom value', 'Explained']

  render() {

    return (
      <Table celled unstackable>
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
            this.attributes.map((value) => this.renderRow(this.props.terrain, value))
          }
        </Table.Body>
      </Table>
    )
  }

  renderRow = (tactic: TerrainDefinition, attribute: ValueType) => {
    let base_value = get_base_value(tactic, attribute, this.props.custom_value_key)

    return (
      <Table.Row key={attribute}>
        <Table.Cell collapsing>
          {attribute}
        </Table.Cell>
        <Table.Cell collapsing>
          {valueToString(tactic, attribute)}
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
          {explain_short(tactic, attribute)}
        </Table.Cell>
      </Table.Row>
    )
  }
}
