import React, { Component } from 'react'
import { Map, List } from 'immutable'
import { Table, Input, Image } from 'semantic-ui-react'
import { UnitType, unit_to_icon } from '../store/units'
import { TacticDefinition, ValueType, TacticType, TacticCalc } from '../store/tactics'
import { get_base_value, valueToRelativeZeroPercent, valueToPercent, explain_short, getImage } from '../base_definition'

interface IProps {
  readonly types: List<TacticType>
  readonly tactics: Map<TacticType, TacticDefinition>
  readonly custom_value_key: string
  readonly tactic: TacticDefinition
  readonly onCustomBaseValueChange: (type: TacticType, key: string, attribute: ValueType, value: number) => void
  readonly onTypeChange: (old_type: TacticType, new_type: TacticType) => void
  readonly onImageChange: (type: TacticType, image: string) => void
}

// Display component for showing and changing tactic details.
export default class TacticDetail extends Component<IProps> {

  readonly attributes = Object.keys(TacticCalc).map(k => TacticCalc[k as any]) as TacticCalc[]
  readonly units = Object.keys(UnitType).map(k => UnitType[k as any]).sort() as UnitType[]
  readonly headers = ['Attribute', 'Value', 'Custom value', 'Explained']

  render() {
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
            this.units.map(value => this.renderRow(tactic, value, false, unit_to_icon.get(value)!))
          }
          {
            this.props.types.map(value => this.renderRow(tactic, value, true, getImage(this.props.tactics.get(value))))
          }
          {
            this.attributes.map(value => this.renderRow(tactic, value, true, getImage(undefined)))
          }
        </Table.Body>
      </Table>
    )
  }

  renderRow = (tactic: TacticDefinition, attribute: ValueType, relative: boolean, image: string) => {
    let base_value = get_base_value(tactic, attribute, this.props.custom_value_key)

    return (
      <Table.Row key={attribute}>
        <Table.Cell collapsing>
          {<Image src={image} avatar />}
          {attribute}
        </Table.Cell>
        <Table.Cell collapsing>
          {relative ? valueToRelativeZeroPercent(tactic, attribute, true) : valueToPercent(tactic, attribute, true)}
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
