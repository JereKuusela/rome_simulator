import React, { Component } from 'react'
import { Table } from 'semantic-ui-react'

import Input from './Utils/Input'
import Headers from './Utils/Headers'
import DetailDropdownRow from './Detail/DetailDropdownRow'
import DetailInputRow from './Detail/DetailInputRow'
import Images from './Utils/Images'
import { Mode, ValuesType, TacticType, UnitType, TacticDefinition, TacticCalc, TacticValueType, Tactics } from 'types'
import { values, getImage } from 'utils'
import { getValue, calculateValue, explainShort } from 'definition_values'
import { toSignedPercent, toPercent } from 'formatters'


interface IProps {
  tactic_types: TacticType[]
  tactics: Tactics
  unit_types: UnitType[]
  images: { [key in UnitType]: string[] }
  custom_value_key: string
  tactic: TacticDefinition
  onCustomBaseValueChange: (key: string, attribute: TacticValueType, value: number) => void
  onTypeChange: (type: TacticType) => void
  onImageChange: (image: string) => void
  onModeChange: (mode: Mode) => void
}

/**
 * Shows and allows changing tactic properties.
 */
export default class TacticDetail extends Component<IProps> {

  readonly attributes = values(TacticCalc)
  readonly modes = values(Mode)
  readonly headers = ['Attribute', 'Value', 'Custom value', 'Explained']

  readonly CELLS = 4

  render() {
    const { tactic, unit_types, tactic_types, onTypeChange, onModeChange, onImageChange, images, tactics } = this.props
    const { type, mode, image } = tactic
    return (
      <Table celled unstackable>
        <Headers values={this.headers} />
        <Table.Body>
          <DetailInputRow text='Name' value={type} onChange={onTypeChange} cells={this.CELLS} />
          <DetailDropdownRow text='Mode' value={mode} values={this.modes} onChange={onModeChange} cells={this.CELLS} />
          <DetailInputRow text='Image' value={image} onChange={onImageChange} cells={this.CELLS} />
          {
            unit_types.map(type => this.renderRow(tactic, type, false, images[type]))
          }
          {tactic_types.map(value => this.renderRow(tactic, value, true, [getImage(tactics[value])]))}
          {this.attributes.map(value => this.renderRow(tactic, value, true, [getImage(null)]))}
        </Table.Body>
      </Table>
    )
  }

  renderRow = (tactic: TacticDefinition, attribute: TacticValueType, relative: boolean, images: string[]) => {
    const { custom_value_key, onCustomBaseValueChange } = this.props
    const base_value = getValue(ValuesType.Base, tactic, attribute, custom_value_key)
    const value = calculateValue(tactic, attribute)

    return (
      <Table.Row key={attribute}>
        <Table.Cell collapsing>
          <Images values={images} />
          {attribute}
        </Table.Cell>
        <Table.Cell collapsing>
          {relative ? toSignedPercent(value) : toPercent(value)}
        </Table.Cell>
        <Table.Cell collapsing>
          <Input value={String(base_value)} onChange={value => onCustomBaseValueChange(custom_value_key, attribute, Number(value))} />
        </Table.Cell>
        <Table.Cell>
          {explainShort(tactic, attribute)}
        </Table.Cell>
      </Table.Row>
    )
  }
}
