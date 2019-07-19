import React, { Component } from 'react'
import { Map, OrderedSet } from 'immutable'
import { Table, Input, Image, Dropdown } from 'semantic-ui-react'
import { UnitType, UnitDefinition } from '../store/units'
import { TacticDefinition, ValueType, TacticType, TacticCalc } from '../store/tactics'
import { getBaseValue, explainShort, getImage, DefinitionType, calculateValue } from '../base_definition'
import { renderImages } from './utils'
import { toSignedPercent, toPercent } from '../formatters';

interface IProps {
  readonly tactic_types: OrderedSet<TacticType>
  readonly tactics: Map<TacticType, TacticDefinition>
  readonly unit_types: OrderedSet<UnitType>
  readonly units: Map<any, Map<UnitType, UnitDefinition>>
  readonly custom_value_key: string
  readonly tactic: TacticDefinition
  readonly onCustomBaseValueChange: (type: TacticType, key: string, attribute: ValueType, value: number) => void
  readonly onTypeChange: (old_type: TacticType, new_type: TacticType) => void
  readonly onImageChange: (type: TacticType, image: string) => void
  readonly onModeChange: (type: TacticType, mode: DefinitionType) => void
}

// Display component for showing and changing tactic details.
export default class TacticDetail extends Component<IProps> {

  readonly attributes = Object.keys(TacticCalc).map(k => TacticCalc[k as any]) as TacticCalc[]
  readonly modes = Object.keys(DefinitionType).map(k => DefinitionType[k as any]).sort() as DefinitionType[]
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
              <Image src={getImage(undefined)} avatar />
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
              <Image src={getImage(undefined)} avatar />
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
              <Image src={getImage(undefined)} avatar />
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
            this.props.unit_types.map(type => {
              const images = this.props.units.filter(value => value.get(type)).map(value => getImage(value.get(type))).toOrderedSet()
              return this.renderRow(tactic, type, false, images)
            })
          }
          {
            this.props.tactic_types.map(value => this.renderRow(tactic, value, true, OrderedSet<string>().add(getImage(this.props.tactics.get(value)))))
          }
          {
            this.attributes.map(value => this.renderRow(tactic, value, true, OrderedSet<string>().add(getImage(undefined))))
          }
        </Table.Body>
      </Table>
    )
  }

  renderRow = (tactic: TacticDefinition, attribute: ValueType, relative: boolean, images: OrderedSet<string>): JSX.Element => {
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
