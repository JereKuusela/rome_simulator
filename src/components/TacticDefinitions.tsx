import { List as ImmutableList } from 'immutable'
import React, { Component } from 'react'
import { Image, Table, List } from 'semantic-ui-react'
import { UnitType, unit_to_icon } from '../store/units'
import { TacticDefinition, TacticType, TacticCalc, tactic_to_icon, valueToString } from '../store/tactics'
import { calculateValue, valueToRelativeZeroPercent,  } from '../base_definition'

interface IProps {
  readonly tactics: ImmutableList<TacticDefinition>
  readonly onRowClick: (tactic: TacticType) => void
}

// Display component for showing unit definitions for an army.
export default class TacticDefinitions extends Component<IProps> {

  readonly tactics = Object.keys(TacticType).map(k => TacticType[k as any]) as TacticType[]
  readonly units = Object.keys(UnitType).map(k => UnitType[k as any]).sort() as UnitType[]
  readonly headers = ['Tactic', 'Unit effectiveness', 'Against other tactics', 'Casualties']

  render() {
    return (
      <Table celled selectable unstackable>
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
            this.props.tactics.map(value => this.renderRow(value))
          }
        </Table.Body>
      </Table>
    )
  }


  renderRow = (tactic: TacticDefinition) => {

    return (
      <Table.Row key={tactic.type} onClick={() => this.props.onRowClick(tactic.type)}>
        <Table.Cell>
          <Image src={tactic_to_icon.get(tactic.type)} avatar />
          {tactic.type}</Table.Cell>
        <Table.Cell>
          <List horizontal>
            {
              this.units.filter(type => calculateValue(tactic, type)).map(type => (
                <List.Item key={type} style={{ marginLeft: 0, marginRight: '1em' }}>
                  <Image src={unit_to_icon.get(type)} avatar />
                  {valueToString(tactic, type)}
                </List.Item>
              ))
            }
          </List>
        </Table.Cell>
        <Table.Cell singleLine>
          <List horizontal>
            {
              this.tactics.filter(type => calculateValue(tactic, type)).map(type => (
                <List.Item key={type} style={{ marginLeft: 0, marginRight: '1em' }}>
                  <Image src={tactic_to_icon.get(type)} avatar />
                  {valueToRelativeZeroPercent(tactic, type, true)}
                </List.Item>
              ))
            }
          </List>
        </Table.Cell>
        <Table.Cell>
          {valueToRelativeZeroPercent(tactic, TacticCalc.Casualties, false)}
        </Table.Cell>
      </Table.Row>
    )
  }
}
