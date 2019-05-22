import { List as ImmutableList } from 'immutable'
import React, { Component } from 'react'
import { Image, Table, List } from 'semantic-ui-react'
import { UnitType, unit_to_icon } from '../store/units'
import { TacticDefinition, TacticType, TacticCalc, tactic_to_icon } from '../store/tactics';

interface IProps {
  readonly tactics: ImmutableList<TacticDefinition>
  readonly onRowClick: (tactic: TacticType) => void
}

// Display component for showing unit definitions for an army.
export class TableTacticDefinitions extends Component<IProps> {

  readonly tactics = Object.keys(TacticType).map(k => TacticType[k as any]) as TacticType[]
  readonly units = Object.keys(UnitType).map(k => UnitType[k as any]).sort() as UnitType[]
  readonly headers = ['Tactic', 'Unit effectiveness', 'Against other tactics', 'Casualties']

  render() {
    return (
      <Table celled selectable>
        <Table.Header>
          <Table.Row>
            {
              Array.from(this.headers).map((value) => (
                <Table.HeaderCell key={value} textAlign='center'>
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
          <Image src={tactic.image} avatar />
          {tactic.type}</Table.Cell>
        <Table.Cell>
          <List horizontal>
            {
              this.units.filter(type => tactic.calculateValue(type)).map(type => (
                <List.Item key={type}>
                  <Image src={unit_to_icon.get(type)} avatar />
                  {tactic.valueToString(type)}
                </List.Item>
              ))
            }
          </List>
        </Table.Cell>
        <Table.Cell singleLine>
          <List horizontal>
            {
              this.tactics.filter(type => tactic.calculateValue(type)).map(type => (
                <List.Item key={type}>
                  <Image src={tactic_to_icon.get(type)} avatar />
                  {tactic.valueToRelativeZeroPercent(type, true)}
                </List.Item>
              ))
            }
          </List>
        </Table.Cell>
        <Table.Cell>
          {tactic.valueToRelativeZeroPercent(TacticCalc.Casualties, false)}
        </Table.Cell>
      </Table.Row>
    )
  }
}
