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

  render() {
    return (
      <Table celled selectable>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>
            </Table.HeaderCell>
            <Table.HeaderCell>
              Unit effectiveness
            </Table.HeaderCell>
            <Table.HeaderCell>
              Against other tactics
            </Table.HeaderCell>
            <Table.HeaderCell>
              Casualties
            </Table.HeaderCell>
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
          <List>
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
        <Table.Cell>
          <List>
            {
              this.tactics.filter(type => tactic.calculateValue(type)).map(type => (
                <List.Item key={type}>
                  <Image src={tactic_to_icon.get(type)} avatar />
                  {tactic.valueToString(type)}
                </List.Item>
              ))
            }
          </List>
        </Table.Cell>
        <Table.Cell>
        {tactic.valueToString(TacticCalc.Casualties)}
        </Table.Cell>
      </Table.Row>
    )
  }
}
