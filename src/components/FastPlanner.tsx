import React, { Component } from 'react'
import { Map, OrderedSet } from 'immutable'
import { Table, Input } from 'semantic-ui-react'
import { UnitType, UnitDefinition } from '../store/units'
import { CountryName } from '../store/countries'
import { renderImages } from './utils'
import { getImage } from '../base_definition'

interface IProps {
  readonly attacker: CountryName
  readonly defender: CountryName
  readonly types_a?: OrderedSet<UnitType>
  readonly units: Map<any, Map<UnitType, UnitDefinition>>
  readonly types_d?: OrderedSet<UnitType>
  readonly reserve_a?: Map<UnitType, number>
  readonly reserve_d?: Map<UnitType, number>
  readonly onValueChange: (country: CountryName, unit: UnitType, value: number) => void
  readonly attached?: boolean
  readonly changes_a: Map<UnitType, number>
  readonly changes_d: Map<UnitType, number>
}

// Display component for showing and changing tactic details.
export default class FastPlanner extends Component<IProps> {

  readonly headers = ['Units in reserve', 'Attacker', 'Defender']

  render(): JSX.Element {
    let types = OrderedSet<UnitType>()
    if (this.props.types_a)
      types = types.merge(this.props.types_a)
    if (this.props.types_d)
      types = types.merge(this.props.types_d)
    return (
      <Table celled unstackable attached={this.props.attached}>
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
          {
            types.map(value => this.renderRow(value))
          }
        </Table.Body>
      </Table>
    )
  }

  renderImages = (type: UnitType): OrderedSet<JSX.Element> => {
    const images = this.props.units.filter(value => value.get(type)).map(value => getImage(value.get(type))).toOrderedSet()
    return renderImages(images)
  }

  renderRow = (type: UnitType): JSX.Element => (
    <Table.Row key={type}>
      <Table.Cell width='6'>
        {this.renderImages(type)}
        {type}
      </Table.Cell>
      <Table.Cell width='5'>
        {
          this.props.types_a && this.props.types_a.contains(type) ?
            <Input
              type='number'
              size='mini'
              value={this.props.changes_a.has(type) ? this.props.changes_a.get(type) : this.props.reserve_a && this.props.reserve_a.get(type)}
              onChange={(_, data) => this.props.onValueChange(this.props.attacker, type, Math.max(0, Math.round(Number(data.value))))
              }
            />
            : null
        }
      </Table.Cell>
      <Table.Cell width='5'>
        {
          this.props.types_d && this.props.types_d.contains(type) ?
            <Input
              type='number'
              size='mini'
              defaultValue={this.props.changes_d.has(type) ? this.props.changes_d.get(type) : this.props.reserve_d && this.props.reserve_d.get(type)}
              onChange={(_, data) => this.props.onValueChange(this.props.defender, type, Math.max(0, Math.round(Number(data.value))))
              }
            />
            : null
        }
      </Table.Cell>
    </Table.Row>
  )
}
