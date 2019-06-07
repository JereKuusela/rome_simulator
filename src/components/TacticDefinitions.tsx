import { List as ImmutableList, Map } from 'immutable'
import React, { Component } from 'react'
import { Image, Table, List, Button } from 'semantic-ui-react'
import { UnitType, unit_to_icon } from '../store/units'
import { TacticDefinition, TacticType, TacticCalc, valueToString } from '../store/tactics'
import { calculateValue, valueToRelativeZeroPercent, getImage } from '../base_definition'
import NewDefinition from './NewDefinition'

interface IProps {
  readonly tactics: Map<TacticType, TacticDefinition>
  readonly types: ImmutableList<TacticType>
  readonly onRowClick: (type: TacticType) => void
  readonly onCreateNew: (type: TacticType) => void
}

interface IState {
  open_create: boolean
}

// Display component for showing unit definitions for an army.
export default class TacticDefinitions extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props)
    this.state = { open_create: false }
  }

  readonly units = Object.keys(UnitType).map(k => UnitType[k as any]).sort() as UnitType[]
  readonly headers = ['Tactic', 'Unit effectiveness', 'Against other tactics', 'Casualties']

  render() {
    return (
      <div>
        <Table celled selectable unstackable>
          <NewDefinition
            open={this.state.open_create}
            onCreate={this.onCreate}
            onClose={this.onClose}
            message='New tactic type'
          />
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
              this.props.types.map(value => this.renderRow(this.props.tactics.get(value)))
            }
          </Table.Body>
        </Table>
        <Button primary onClick={this.newOnClick}>
          Create new
        </Button>
      </div>
    )
  }

  newOnClick = () => this.setState({ open_create: true })

  onCreate = (type: string) => this.props.onCreateNew(type as TacticType)

  onClose = () => this.setState({ open_create: false })

  renderRow = (tactic: TacticDefinition | undefined) => {
    if (!tactic)
      return null
    return (
      <Table.Row key={tactic.type} onClick={() => this.props.onRowClick(tactic.type)}>
        <Table.Cell>
          <Image src={getImage(tactic)} avatar />
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
              this.props.types.filter(type => calculateValue(tactic, type) && this.props.tactics.get(type)).map(type => (
                <List.Item key={type} style={{ marginLeft: 0, marginRight: '1em' }}>
                  <Image src={getImage(this.props.tactics.find(value => value.type === type))} avatar />
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
