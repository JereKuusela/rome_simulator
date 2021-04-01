import React, { Component } from 'react'
import { Image, Table, List, Button } from 'semantic-ui-react'

import VersusList from '../components/VersusList'
import StyledNumber from '../components/Utils/StyledNumber'

import Headers from '../components/Utils/Headers'
import { TacticData, TacticType, TacticCalc, ModalType } from 'types'
import { calculateValue } from 'data_values'
import { openModal, createTactic } from 'reducers'
import { toSignedPercent } from 'formatters'
import { getImage, toArr } from 'utils'
import { connect } from 'react-redux'
import { AppState, getUnitImages, mergeUnitTypes } from 'state'
import { getMode, getTacticsData } from 'selectors'

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
          <Table.Body>{this.props.tactics.map(this.renderRow)}</Table.Body>
        </Table>
        <Button primary onClick={this.onClick}>
          Create new
        </Button>
      </>
    )
  }

  onClick = () =>
    this.props.openModal(ModalType.Value, {
      onSuccess: type => this.props.createTactic(type as TacticType, this.props.mode),
      message: 'New tactic type',
      buttonMessage: 'Create',
      initial: ''
    })

  renderRow = (definition: TacticData) => {
    const { images, unitTypes } = this.props
    return (
      <Table.Row key={definition.type} onClick={() => this.openModal(definition)}>
        <Table.Cell>
          <Image src={getImage(definition)} avatar />
          {definition.type}
        </Table.Cell>
        <Table.Cell>
          <VersusList item={definition} images={images} unitTypes={unitTypes} />
        </Table.Cell>
        <Table.Cell singleLine>
          <List horizontal>{this.renderVersus(definition)}</List>
        </Table.Cell>
        <Table.Cell>
          <StyledNumber
            value={calculateValue(definition, TacticCalc.Casualties)}
            formatter={toSignedPercent}
            hideZero
            reverse
          />
        </Table.Cell>
      </Table.Row>
    )
  }

  renderVersus = (definition: TacticData) => {
    const filtered = this.props.tactics.filter(versus => calculateValue(definition, versus.type))
    return filtered.map(versus => (
      <List.Item key={versus.type} style={{ marginLeft: 0, marginRight: '1em' }}>
        <Image src={getImage(versus)} avatar />
        <StyledNumber value={calculateValue(definition, versus.type)} formatter={toSignedPercent} />
      </List.Item>
    ))
  }

  openModal = (definition: TacticData) => this.props.openModal(ModalType.TacticDetail, { type: definition.type })
}

const mapStateToProps = (state: AppState) => ({
  tactics: toArr(getTacticsData(state)),
  images: getUnitImages(state),
  unitTypes: mergeUnitTypes(state),
  mode: getMode(state)
})

const actions = {
  openModal,
  createTactic
}

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
type IProps = S & D

export default connect(mapStateToProps, actions)(TacticDefinitions)
