import { OrderedSet, Map } from 'immutable'
import React, { Component } from 'react'
import { Image, Table, List, Button } from 'semantic-ui-react'
import { UnitType, UnitDefinition } from '../store/units'
import { TacticDefinition, TacticType, TacticCalc, valueToString } from '../store/tactics'
import { calculateValue, valueToRelativeZeroPercent, getImage } from '../base_definition'
import NewDefinition from './NewDefinition'
import { renderImages } from './utils'

interface IProps {
  readonly tactics: Map<TacticType, TacticDefinition>
  readonly tactic_types: OrderedSet<TacticType>
  readonly units: Map<any, Map<UnitType, UnitDefinition>>
  readonly unit_types: OrderedSet<UnitType>
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

  readonly headers = ['Tactic', 'Unit effectiveness', 'Against other tactics', 'Casualties']

  render() {
    return (
      <div>
        <NewDefinition
            open={this.state.open_create}
            onCreate={this.onCreate}
            onClose={this.onClose}
            message='New tactic type'
          />
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
              this.props.tactic_types.map(value => this.renderRow(this.props.tactics.get(value)))
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
              this.props.unit_types.filter(type => calculateValue(tactic, type)).map(type => (
                <List.Item key={type} style={{ marginLeft: 0, marginRight: '1em' }}>
                  {renderImages(this.props.units.filter(value => value.get(type)).map(value => getImage(value.get(type))).toOrderedSet())}
                  {valueToString(tactic, type)}
                </List.Item>
              ))
            }
          </List>
        </Table.Cell>
        <Table.Cell singleLine>
          <List horizontal>
            {
              this.props.tactic_types.filter(type => calculateValue(tactic, type) && this.props.tactics.get(type)).map(type => (
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
