import React, { Component } from 'react'
import { Table, Image } from 'semantic-ui-react'

import DetailInput from './DetailInput'

import { UnitType, Units } from '../store/units'
import { TacticDefinition, ValueType, TacticType, TacticCalc, TacticDefinitions } from '../store/tactics'

import { getBaseValue, explainShort, getImage, DefinitionType, calculateValue, getImages } from '../base_definition'
import { renderImages, renderModeDropdown, renderHeaders } from './utils'
import { toSignedPercent, toPercent } from '../formatters'
import { toArr, values } from '../utils'

interface IProps {
  readonly tactic_types: TacticType[]
  readonly tactics: TacticDefinitions
  readonly unit_types: UnitType[]
  readonly units: Units
  readonly custom_value_key: string
  readonly tactic: TacticDefinition
  readonly onCustomBaseValueChange: (type: TacticType, key: string, attribute: ValueType, value: number) => void
  readonly onTypeChange: (old_type: TacticType, new_type: TacticType) => void
  readonly onImageChange: (type: TacticType, image: string) => void
  readonly onModeChange: (type: TacticType, mode: DefinitionType) => void
}

/**
 * Shows and allows changing tactic properties.
 */
export default class TacticDetail extends Component<IProps> {

  readonly attributes = values(TacticCalc)
  readonly headers = ['Attribute', 'Value', 'Custom value', 'Explained']

  render() {
    const { tactic, unit_types, tactic_types, onTypeChange, onModeChange, onImageChange, units, tactics } = this.props
    const { type, mode, image } = tactic
    return (
      <Table celled unstackable>
        {renderHeaders(this.headers)}
        <Table.Body>
          <Table.Row>
            <Table.Cell>
              <Image src={getImage(null)} avatar />
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
              <Image src={getImage(null)} avatar />
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
              <Image src={getImage(null)} avatar />
              Image
            </Table.Cell>
            <Table.Cell collapsing>
              <DetailInput value={image} onChange={value => onImageChange(type, value)} />
            </Table.Cell>
            <Table.Cell />
            <Table.Cell />
          </Table.Row>
          {
            unit_types.map(type => {
              const images = getImages(toArr(units), type)
              return this.renderRow(tactic, type, false, images)
            })
          }
          {
            tactic_types.map(value => this.renderRow(tactic, value, true, new Set([getImage(tactics[value])])))
          }
          {
            this.attributes.map(value => this.renderRow(tactic, value, true, new Set([getImage(null)])))
          }
        </Table.Body>
      </Table>
    )
  }

  renderRow = (tactic: TacticDefinition, attribute: ValueType, relative: boolean, images: Set<string>) => {
    const { custom_value_key, onCustomBaseValueChange } = this.props
    const { type } = tactic
    const base_value = getBaseValue(tactic, attribute, custom_value_key)
    const value = calculateValue(tactic, attribute)

    return (
      <Table.Row key={attribute}>
        <Table.Cell collapsing>
          {renderImages(images)}
          {attribute}
        </Table.Cell>
        <Table.Cell collapsing>
          {relative ? toSignedPercent(value) : toPercent(value)}
        </Table.Cell>
        <Table.Cell collapsing>
          <DetailInput value={String(base_value)} onChange={value => onCustomBaseValueChange(type, custom_value_key, attribute, Number(value))} />
        </Table.Cell>
        <Table.Cell>
          {explainShort(tactic, attribute)}
        </Table.Cell>
      </Table.Row>
    )
  }
}
