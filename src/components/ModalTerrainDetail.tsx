import React, { Component } from 'react'
import { Modal, Table, Input } from 'semantic-ui-react'
import { TerrainDefinition, ValueType, TerrainType, TerrainCalc } from '../store/terrains'

interface IProps {
  custom_value_key: string
  terrain: TerrainDefinition
  onClose: () => void
  onCustomBaseValueChange: (type: TerrainType, key: string, attribute: ValueType, value: number) => void
}

// Display component for showing and changing terrain details.
export class ModalTerrainDetail extends Component<IProps> {

  readonly attributes = Object.keys(TerrainCalc).map(k => TerrainCalc[k as any]) as TerrainCalc[]
  readonly headers = ['Attribute', 'Value', 'Explained', 'Custom base']

  render() {
    
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
                this.attributes.map((value) => this.renderRow(this.props.terrain, value))
              }
            </Table.Body>
          </Table>
        </Modal.Content>
      </Modal>
    )
  }

  renderRow = (tactic: TerrainDefinition, attribute: ValueType) => {
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
