import React, { Component } from 'react'
import { Table, Input, Image, Dropdown } from 'semantic-ui-react'
import { UnitType, Units } from '../store/units'
import { TacticDefinition, ValueType, TacticType, TacticCalc, TacticDefinitions } from '../store/tactics'
import { getBaseValue, explainShort, getImage, DefinitionType, calculateValue, getImages } from '../base_definition'
import { renderImages } from './utils'
import { toSignedPercent, toPercent } from '../formatters'
import { toArr, values } from '../utils'

interface IProps {
  readonly tactic_types: Set<TacticType>
  readonly tactics: TacticDefinitions
  readonly unit_types: Set<UnitType>
  readonly units: Units
  readonly custom_value_key: string
  readonly tactic: TacticDefinition
  readonly onCustomBaseValueChange: (type: TacticType, key: string, attribute: ValueType, value: number) => void
  readonly onTypeChange: (old_type: TacticType, new_type: TacticType) => void
  readonly onImageChange: (type: TacticType, image: string) => void
  readonly onModeChange: (type: TacticType, mode: DefinitionType) => void
}

// Display component for showing and changing tactic details.
export default class TacticDetail extends Component<IProps> {

  readonly attributes = values(TacticCalc)
  readonly modes = values(DefinitionType)
  readonly headers = ['Attribute', 'Value', 'Custom value', 'Explained']

  renderModeDropdown = (type: TacticType, mode: DefinitionType): JSX.Element => {
    return (
      <Dropdown
        text={mode}
        selection
        value={mode}
      >
        <Dropdown.Menu>
          {
            this.modes.map(key => (
              <Dropdown.Item value={key} text={key} key={key} active={mode === key}
                onClick={() => this.props.onModeChange && this.props.onModeChange(type, key)}
              />
            ))
          }
        </Dropdown.Menu>
      </Dropdown>
    )
  }

  render(): JSX.Element | null {
    if (this.props.tactic === undefined)
      return null
    const tactic = this.props.tactic
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
              <Image src={getImage(null)} avatar />
              Type
            </Table.Cell>
            <Table.Cell collapsing>
              <Input
                size='mini'
                defaultValue={this.props.tactic.type}
                onChange={(_, data) => this.props.onTypeChange(this.props.tactic.type, data.value as TacticType)}
              />
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
              {this.renderModeDropdown(this.props.tactic.type, this.props.tactic.mode)}
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
              <Input
                size='mini'
                defaultValue={this.props.tactic.image}
                onChange={(_, data) => this.props.onImageChange(this.props.tactic.type, data.value)}
              />
            </Table.Cell>
            <Table.Cell />
            <Table.Cell />
          </Table.Row>
          {
            Array.from(this.props.unit_types).map(type => {
              const images = getImages(toArr(this.props.units), type)
              return this.renderRow(tactic, type, false, images)
            })
          }
          {
            Array.from(this.props.tactic_types).map(value => this.renderRow(tactic, value, true, new Set([getImage(this.props.tactics[value])])))
          }
          {
            this.attributes.map(value => this.renderRow(tactic, value, true, new Set([getImage(null)])))
          }
        </Table.Body>
      </Table>
    )
  }

  renderRow = (tactic: TacticDefinition, attribute: ValueType, relative: boolean, images: Set<string>): JSX.Element => {
    const base_value = getBaseValue(tactic, attribute, this.props.custom_value_key)
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
          <Input
            size='mini'
            defaultValue={base_value}
            onChange={(_, data) => this.props.onCustomBaseValueChange(tactic.type, this.props.custom_value_key, attribute, Number(data.value))
            }
          />
        </Table.Cell>
        <Table.Cell>
          {explainShort(tactic, attribute)}
        </Table.Cell>
      </Table.Row>
    )
  }
}
