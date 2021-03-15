import React, { Component } from 'react'
import { Table } from 'semantic-ui-react'

import PaddedRow from './Utils/PaddedRow'
import DetailInputRow from './Detail/DetailInputRow'
import DetailDropdownRow from './Detail/DetailDropdownRow'
import Input from './Utils/Input'
import Headers from './Utils/Headers'

import {
  ValuesType,
  Terrain,
  TerrainType,
  LocationType,
  TerrainCalc,
  TerrainValueType,
  terrainValueToString
} from 'types'
import { values } from 'utils'
import { getValue, explainShort } from 'definition_values'

interface IProps {
  customValueKey: string
  terrain: Terrain
  onCustomValueChange: (key: string, attribute: TerrainValueType, value: number) => void
  onTypeChange: (type: TerrainType) => void
  onLocationChange: (location: LocationType) => void
  onImageChange: (image: string) => void
}

// Display component for showing and changing terrain details.
export default class TerrainDetail extends Component<IProps> {
  readonly attributes = values(TerrainCalc)
  readonly locations = values(LocationType)
  readonly headers = ['Attribute', 'Value', 'Custom value', 'Explained']

  readonly CELLS = 4

  render() {
    const { terrain, onTypeChange, onImageChange, onLocationChange } = this.props
    const { type, image, location } = terrain
    return (
      <Table celled unstackable>
        <Headers values={this.headers} />
        <Table.Body>
          <DetailInputRow text='Name' cells={this.CELLS} value={type} onChange={onTypeChange} />
          <DetailInputRow text='Image' cells={this.CELLS} value={image} onChange={onImageChange} />
          <DetailDropdownRow
            text='Location'
            cells={this.CELLS}
            value={location}
            values={this.locations}
            onChange={onLocationChange}
          />
          {this.attributes.map(value => this.renderRow(terrain, value))}
        </Table.Body>
      </Table>
    )
  }

  renderRow = (terrain: Terrain, attribute: TerrainValueType) => {
    const { customValueKey, onCustomValueChange } = this.props
    const value = getValue(ValuesType.Base, terrain, attribute, customValueKey)

    return (
      <PaddedRow key={attribute} cells={this.CELLS}>
        {attribute}
        {terrainValueToString(terrain, attribute)}
        <Input
          value={String(value)}
          onChange={value => onCustomValueChange(customValueKey, attribute, Number(value))}
        />
        {explainShort(terrain, attribute)}
      </PaddedRow>
    )
  }
}
