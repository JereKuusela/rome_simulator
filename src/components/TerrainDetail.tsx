import React, { Component } from 'react'
import { Table } from 'semantic-ui-react'

import PaddedRow from './Utils/PaddedRow'
import DetailInputRow from './Detail/DetailInputRow'
import DetailDropdownRow from './Detail/DetailDropndownRow'
import Input from './Utils/Input'
import Headers from './Utils/Headers'

import { TerrainDefinition, ValueType, TerrainType, TerrainCalc, valueToString, LocationType } from '../store/terrains'

import { getBaseValue, explainShort, DefinitionType } from '../base_definition'
import { values } from '../utils'

interface IProps {
  custom_value_key: string
  terrain: TerrainDefinition
  onCustomBaseValueChange: (key: string, attribute: ValueType, value: number) => void
  onTypeChange: (type: TerrainType) => void
  onLocationChange: (location: LocationType) => void
  onImageChange: (image: string) => void
  onModeChange: (mode: DefinitionType) => void
}

// Display component for showing and changing terrain details.
export default class TerrainDetail extends Component<IProps> {

  readonly attributes = values(TerrainCalc)
  readonly locations = values(LocationType)
  readonly modes = values(DefinitionType)
  readonly headers = ['Attribute', 'Value', 'Custom value', 'Explained']

  readonly CELLS = 4

  render(): JSX.Element {
    const { terrain, onTypeChange, onModeChange, onImageChange, onLocationChange } = this.props
    const { type, mode, image, location } = terrain
    return (
      <Table celled unstackable>
        <Headers values={this.headers} />
        <Table.Body>
          <DetailInputRow text='Name' cells={this.CELLS} value={type} onChange={onTypeChange} />
          <DetailDropdownRow text='Mode' cells={this.CELLS} value={mode} values={this.modes} onChange={onModeChange} />
          <DetailInputRow text='Image' cells={this.CELLS} value={image} onChange={onImageChange} />
          <DetailDropdownRow text='Location' cells={this.CELLS} value={location} values={this.locations} onChange={onLocationChange} />
          {this.attributes.map(value => this.renderRow(terrain, value))}
        </Table.Body>
      </Table>
    )
  }

  renderRow = (tactic: TerrainDefinition, attribute: ValueType) => {
    const { custom_value_key, onCustomBaseValueChange } = this.props
    const base_value = getBaseValue(tactic, attribute, custom_value_key)

    return (
      <PaddedRow key={attribute} cells={this.CELLS}>
        {attribute}
        {valueToString(tactic, attribute)}
        <Input value={String(base_value)} onChange={value => onCustomBaseValueChange(custom_value_key, attribute, Number(value))} />
        {explainShort(tactic, attribute)}
      </PaddedRow>
    )
  }
}
