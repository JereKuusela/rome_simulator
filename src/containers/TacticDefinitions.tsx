import React, { Component } from 'react'
import { Image, Table, List, Button } from 'semantic-ui-react'

import VersusList from '../components/VersusList'
import StyledNumber from '../components/Utils/StyledNumber'

import Headers from '../components/Utils/Headers'
import { TacticDefinition, TacticType, TacticCalc, ModalType } from 'types'
import { calculateValue } from 'definition_values'
import { openModal, createTactic } from 'reducers'
import { toSignedPercent } from 'formatters'
import { getImage, toArr } from 'utils'
import { connect } from 'react-redux'
import { AppState, getMode, filterTactics, getUnitImages, mergeUnitTypes } from 'state'

/**
 * Shows tactic definitions for both sides.
 */
class TacticDefinitions extends Component<IProps> {

  readonly headers = ['Tactic', 'Unit effectiveness', 'Against other tactics', 'Casualties']

  render() {
    return (
      <>
        <Table celled selectable unstackable>
          <Headers values={this.headers} />
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

  onClick = () => this.props.openModal(ModalType.Value, {
    onSuccess: type => this.props.createTactic(type as TacticType, this.props.mode),
    message: 'New tactic type',
    button_message: 'Create',
    initial: ''
  })

  renderRow = (definition: TacticDefinition) => {
    const { images, unit_types } = this.props
    return (
      <Table.Row key={definition.type} onClick={() => this.openModal(definition)}>
        <Table.Cell>
          <Image src={getImage(definition)} avatar />
          {definition.type}
        </Table.Cell>
        <Table.Cell>
          <VersusList
            item={definition}
            images={images}
            unit_types={unit_types}
          />
        </Table.Cell>
        <Table.Cell singleLine>
          <List horizontal>
            {this.renderVersus(definition)}
          </List>
        </Table.Cell>
        <Table.Cell>
          <StyledNumber
            value={calculateValue(definition, TacticCalc.Casualties)}
            formatter={toSignedPercent} hide_zero reverse
          />
        </Table.Cell>
      </Table.Row>
    )
  }

  renderVersus = (tactic: TacticDefinition) => {
    const filtered = this.props.tactics.filter(versus => calculateValue(tactic, versus.type))
    return filtered.map(versus => (
      <List.Item key={versus.type} style={{ marginLeft: 0, marginRight: '1em' }}>
        <Image src={getImage(versus)} avatar />
        <StyledNumber
          value={calculateValue(tactic, versus.type)}
          formatter={toSignedPercent}
        />
      </List.Item>
    ))
  }

  openModal = (definition: TacticDefinition) => this.props.openModal(ModalType.TacticDetail, { type: definition.type })
}

const mapStateToProps = (state: AppState) => ({
  tactics: toArr(filterTactics(state)),
  images: getUnitImages(state),
  unit_types: mergeUnitTypes(state),
  mode: getMode(state)
})

const actions = {
  openModal, createTactic
}

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
type IProps = S & D

export default connect(mapStateToProps, actions)(TacticDefinitions)