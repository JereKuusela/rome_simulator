import React, { Component } from 'react'
import { Image, Table, List, Button } from 'semantic-ui-react'
import { UnitType, Units } from '../store/units'
import { TacticDefinition, TacticType, TacticCalc, TacticDefinitions as Definitions} from '../store/tactics'
import { calculateValue, getImage } from '../base_definition'
import { toSignedPercent } from '../formatters'
import ValueModal from './ValueModal'
import VersusList from './VersusList'
import StyledNumber from './StyledNumber'
import { toArr } from '../utils';

interface IProps {
  readonly tactics: Definitions
  readonly units: Units
  readonly unit_types: Set<UnitType>
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

  render(): JSX.Element {
    return (
      <div>
        <ValueModal
            open={this.state.open_create}
            onSuccess={this.props.onCreateNew}
            onClose={this.onClose}
            message='New tactic type'
            button_message='Create'
            initial={'' as TacticType}
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
              toArr(this.props.tactics, this.renderRow)
            }
          </Table.Body>
        </Table>
        <Button primary onClick={() => this.setState({ open_create: true })}>
          Create new
        </Button>
      </div>
    )
  }

  onClose = (): void => this.setState({ open_create: false })

  renderRow = (tactic: TacticDefinition | undefined): JSX.Element | null => {
    if (!tactic)
      return null
    return (
      <Table.Row key={tactic.type} onClick={() => this.props.onRowClick(tactic.type)}>
        <Table.Cell>
          <Image src={getImage(tactic)} avatar />
          {tactic.type}</Table.Cell>
        <Table.Cell>
          <VersusList
            item={tactic}
            units={this.props.units}
            unit_types={this.props.unit_types}
          />
        </Table.Cell>
        <Table.Cell singleLine>
          <List horizontal>
            {
              toArr(this.props.tactics).filter(vs_tactic => calculateValue(tactic, vs_tactic.type)).map(vs_tactic => (
                <List.Item key={vs_tactic.type} style={{ marginLeft: 0, marginRight: '1em' }}>
                  <Image src={getImage(vs_tactic)} avatar />
                  <StyledNumber
                    value={calculateValue(tactic, vs_tactic.type)}
                    formatter={toSignedPercent}
                  />
                </List.Item>
              ))
            }
          </List>
        </Table.Cell>
        <Table.Cell>
          <StyledNumber
            value={calculateValue(tactic, TacticCalc.Casualties)}
            formatter={toSignedPercent} hide_zero reverse
          />
        </Table.Cell>
      </Table.Row>
    )
  }
}
