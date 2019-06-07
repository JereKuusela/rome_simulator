import React, { Component } from 'react'
import { Table, Input, Dropdown } from 'semantic-ui-react'
import { TerrainDefinition, ValueType, TerrainType, TerrainCalc, valueToString, LocationType } from '../store/terrains'
import { get_base_value, explain_short } from '../base_definition'

interface IProps {
  custom_value_key: string
  terrain: TerrainDefinition
  onCustomBaseValueChange: (type: TerrainType, key: string, attribute: ValueType, value: number) => void
  onTypeChange: (old_type: TerrainType, new_type: TerrainType) => void
  onLocationChange: (type: TerrainType, location: LocationType) => void
}

// Display component for showing and changing terrain details.
export default class TerrainDetail extends Component<IProps> {

  readonly attributes = Object.keys(TerrainCalc).map(k => TerrainCalc[k as any]) as TerrainCalc[]
  readonly locations = Object.keys(LocationType).map(k => LocationType[k as any]) as LocationType[]
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
          <Table.Row>
            <Table.Cell>
              Type
            </Table.Cell>
            <Table.Cell collapsing>
              <Input
                size='mini'
                defaultValue={this.props.terrain.type}
                onChange={(_, data) => this.props.onTypeChange(this.props.terrain.type, data.value as TerrainType)}
              />
            </Table.Cell>
            <Table.Cell />
            <Table.Cell />
          </Table.Row>
          <Table.Row>
            <Table.Cell>
              Location
            </Table.Cell>
            <Table.Cell collapsing>
              {this.renderLocationDropdown()}
            </Table.Cell>
            <Table.Cell />
            <Table.Cell />
          </Table.Row>
          {
            this.attributes.map(value => this.renderRow(this.props.terrain, value))
          }
        </Table.Body>
      </Table>
    )
  }

  renderLocationDropdown = () => {
    return (
      <Dropdown
        text={this.props.terrain.location}
        selection
        value={this.props.terrain.location}
      >
        <Dropdown.Menu>
          {
            this.locations.map(value => (
              <Dropdown.Item value={value} text={value} key={value} active={this.props.terrain.location === value}
              onClick={() => this.props.onLocationChange(this.props.terrain.type, value)}
              />
            ))
          }
        </Dropdown.Menu>
      </Dropdown>
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
