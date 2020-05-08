import React, { Component } from 'react'
import { Table } from 'semantic-ui-react'

import Input from './Utils/Input'
import Headers from './Utils/Headers'
import DetailDropdownRow from './Detail/DetailDropdownRow'
import DetailInputRow from './Detail/DetailInputRow'
import Images from './Utils/Images'
import { Mode, ValuesType, TacticType, UnitType, TacticDefinition, TacticCalc, TacticValueType, TacticDefinitions } from 'types'
import { values, getImage } from 'utils'
import { getValue, calculateValue, explainShort } from 'definition_values'
import { toSignedPercent, toPercent } from 'formatters'


interface IProps {
  tacticTypes: TacticType[]
  tactics: TacticDefinitions
  unitTypes: UnitType[]
  images: { [key in UnitType]: string[] }
  customValueKey: string
  tactic: TacticDefinition
  onCustomValueChange: (key: string, attribute: TacticValueType, value: number) => void
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
    const { tactic, unitTypes, tacticTypes, onTypeChange, onModeChange, onImageChange, images, tactics } = this.props
    const { type, mode, image } = tactic
    return (
      <Table celled unstackable>
        <Headers values={this.headers} />
        <Table.Body>
          <DetailInputRow text='Name' value={type} onChange={onTypeChange} cells={this.CELLS} />
          <DetailDropdownRow text='Mode' value={mode} values={this.modes} onChange={onModeChange} cells={this.CELLS} />
          <DetailInputRow text='Image' value={image} onChange={onImageChange} cells={this.CELLS} />
          {
            unitTypes.map(type => this.renderRow(tactic, type, false, images[type]))
          }
          {tacticTypes.map(value => this.renderRow(tactic, value, true, [getImage(tactics[value])]))}
          {this.attributes.map(value => this.renderRow(tactic, value, true, [getImage(null)]))}
        </Table.Body>
      </Table>
    )
  }

  renderRow = (tactic: TacticDefinition, attribute: TacticValueType, relative: boolean, images: string[]) => {
    const { customValueKey, onCustomValueChange } = this.props
    const baseValue = getValue(ValuesType.Base, tactic, attribute, customValueKey)
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
          <Input value={String(baseValue)} onChange={value => onCustomValueChange(customValueKey, attribute, Number(value))} />
        </Table.Cell>
        <Table.Cell>
          {explainShort(tactic, attribute)}
        </Table.Cell>
      </Table.Row>
    )
  }
}
