import React, { Component } from 'react'
import { Image, Table, List, Button } from 'semantic-ui-react'

import ValueModal from './ValueModal'
import VersusList from './VersusList'
import StyledNumber from './StyledNumber'

import { UnitType, Units } from '../store/units'
import { TacticDefinition, TacticType, TacticCalc } from '../store/tactics'

import { calculateValue, getImage } from '../base_definition'
import { toSignedPercent } from '../formatters'
import { renderHeaders } from './utils'

interface IProps {
  readonly tactics: TacticDefinition[]
  readonly units: Units
  readonly unit_types: Set<UnitType>
  readonly onRowClick: (type: TacticType) => void
  readonly onCreateNew: (type: TacticType) => void
}

interface IState {
  open_create: boolean
}

/**
 * Shows tactic definitions for both sides.
 */
export default class TacticDefinitions extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props)
    this.state = { open_create: false }
  }

  readonly headers = ['Tactic', 'Unit effectiveness', 'Against other tactics', 'Casualties']

  render(): JSX.Element {
    return (
      <>
        <ValueModal
          open={this.state.open_create}
          onSuccess={this.props.onCreateNew}
          onClose={this.onClose}
          message='New tactic type'
          button_message='Create'
          initial={'' as TacticType}
        />
        <Table celled selectable unstackable>
          {renderHeaders(this.headers)}
          <Table.Body>
            {this.props.tactics.map(this.renderRow)}
          </Table.Body>
        </Table>
        <Button primary onClick={this.onClick}>
          Create new
        </Button>
      </>
    )
  }

  onClick = (): void => this.setState({ open_create: true })
  onClose = (): void => this.setState({ open_create: false })

  renderRow = (tactic: TacticDefinition) => {
    const { onRowClick, units, unit_types } = this.props
    return (
      <Table.Row key={tactic.type} onClick={() => onRowClick(tactic.type)}>
        <Table.Cell>
          <Image src={getImage(tactic)} avatar />
          {tactic.type}
        </Table.Cell>
        <Table.Cell>
          <VersusList
            item={tactic}
            units={units}
            unit_types={unit_types}
          />
        </Table.Cell>
        <Table.Cell singleLine>
          <List horizontal>
            {this.renderVersus(tactic)}
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

  renderVersus = (tactic: TacticDefinition) => {
    const non_zero = this.props.tactics.filter(versus => calculateValue(tactic, versus.type))
    return non_zero.map(versus => (
      <List.Item key={versus.type} style={{ marginLeft: 0, marginRight: '1em' }}>
        <Image src={getImage(versus)} avatar />
        <StyledNumber
          value={calculateValue(tactic, versus.type)}
          formatter={toSignedPercent}
        />
      </List.Item>
    ))
  }
}
