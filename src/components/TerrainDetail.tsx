import React, { Component } from 'react'
import { Table, Dropdown } from 'semantic-ui-react'

import DetailInput from './DetailInput'

import { TerrainDefinition, ValueType, TerrainType, TerrainCalc, valueToString, LocationType } from '../store/terrains'

import { getBaseValue, explainShort, DefinitionType } from '../base_definition'
import { values } from '../utils'
import { renderModeDropdown, renderHeaders } from './utils'

interface IProps {
  readonly custom_value_key: string
  readonly terrain: TerrainDefinition
  readonly onCustomBaseValueChange: (type: TerrainType, key: string, attribute: ValueType, value: number) => void
  readonly onTypeChange: (old_type: TerrainType, new_type: TerrainType) => void
  readonly onLocationChange: (type: TerrainType, location: LocationType) => void
  readonly onImageChange: (type: TerrainType, image: string) => void
  readonly onModeChange: (type: TerrainType, mode: DefinitionType) => void
}

// Display component for showing and changing terrain details.
export default class TerrainDetail extends Component<IProps> {

  readonly attributes = values(TerrainCalc)
  readonly locations = values(LocationType)
  readonly headers = ['Attribute', 'Value', 'Custom value', 'Explained']

  render(): JSX.Element {
    const { terrain, onTypeChange, onModeChange, onImageChange } = this.props
    const { type, mode, image, location } = terrain
    return (
      <Table celled unstackable>   
        {renderHeaders(this.headers)}
        <Table.Body>
          <Table.Row>
            <Table.Cell>
              Type
            </Table.Cell>
            <Table.Cell collapsing>
              <DetailInput value={type} onChange={value => onTypeChange(type, value)} />
            </Table.Cell>
            <Table.Cell />
            <Table.Cell />
          </Table.Row>
          <Table.Row>
            <Table.Cell>
              Mode
            </Table.Cell>
            <Table.Cell collapsing>
              {renderModeDropdown(mode, mode => onModeChange(type, mode))}
            </Table.Cell>
            <Table.Cell />
            <Table.Cell />
            <Table.Cell />
            <Table.Cell />
          </Table.Row>
          <Table.Row>
            <Table.Cell>
              Image
            </Table.Cell>
            <Table.Cell collapsing>
              <DetailInput value={image} onChange={value => onImageChange(type, value)} />
            </Table.Cell>
            <Table.Cell />
            <Table.Cell />
          </Table.Row>
          <Table.Row>
            <Table.Cell>
              Location
            </Table.Cell>
            <Table.Cell collapsing>
              {this.renderLocationDropdown(type, location)}
            </Table.Cell>
            <Table.Cell />
            <Table.Cell />
          </Table.Row>
          {
            this.attributes.map(value => this.renderRow(terrain, value))
          }
        </Table.Body>
      </Table>
    )
  }

  renderLocationDropdown = (type: TerrainType, location: LocationType) => {
    return (
      <Dropdown
        text={location}
        selection
        value={location}
      >
        <Dropdown.Menu>
          {
            this.locations.map(value => (
              <Dropdown.Item value={value} text={value} key={value} active={location === value}
                onClick={() => this.props.onLocationChange(type, value)}
              />
            ))
          }
        </Dropdown.Menu>
      </Dropdown>
    )
  }

  renderRow = (tactic: TerrainDefinition, attribute: ValueType): JSX.Element => {
    const { custom_value_key, onCustomBaseValueChange } = this.props
    let base_value = getBaseValue(tactic, attribute, custom_value_key)

    return (
      <Table.Row key={attribute}>
        <Table.Cell collapsing>
          {attribute}
        </Table.Cell>
        <Table.Cell collapsing>
          {valueToString(tactic, attribute)}
        </Table.Cell>
        <Table.Cell collapsing>
          <DetailInput value={String(base_value)} onChange={value => onCustomBaseValueChange(tactic.type, custom_value_key, attribute, Number(value))} />
        </Table.Cell>
        <Table.Cell>
          {explainShort(tactic, attribute)}
        </Table.Cell>
      </Table.Row>
    )
  }
}
