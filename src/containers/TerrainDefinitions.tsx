import React, { Component } from 'react'
import { Table, Button, Image } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { AppState } from 'state'

import Headers from '../components/Utils/Headers'
import StyledNumber from '../components/Utils/StyledNumber'

import { TerrainData, TerrainType, TerrainCalc, ModalType } from 'types'
import { keys, getImage } from 'utils'
import { calculateValue } from 'data_values'
import { openModal, createTerrain } from 'reducers'
import { addSign } from 'formatters'
import { getMode, getTerrainsArray } from 'selectors'

// Display component for showing unit definitions for an army.
class TerrainDefinitions extends Component<IProps> {
  readonly attributes = keys(TerrainCalc).map(k => TerrainCalc[k])
  readonly headers = ['Terrain', 'Location', 'Attacker roll', 'Combat width']

  render() {
    const { terrains } = this.props
    return (
      <>
        <Table celled selectable unstackable>
          <Headers values={this.headers} />
          <Table.Body>{terrains.map(this.renderRow)}</Table.Body>
        </Table>
        <Button primary onClick={this.onClick}>
          Create new
        </Button>
      </>
    )
  }

  onClick = () =>
    this.props.openModal(ModalType.Value, {
      onSuccess: type => this.props.createTerrain(type as TerrainType),
      message: 'New terrain type',
      buttonMessage: 'Create',
      initial: ''
    })

  renderRow = (definition: TerrainData) => {
    return (
      <Table.Row key={definition.type} onClick={() => this.openModal(definition)}>
        <Table.Cell>
          <Image src={getImage(definition)} avatar />
          {definition.type}
        </Table.Cell>
        <Table.Cell>{definition.location}</Table.Cell>
        {this.renderAttributes(definition)}
      </Table.Row>
    )
  }

  renderAttributes = (definition: TerrainData) =>
    this.attributes.map(type => (
      <Table.Cell key={type}>
        <StyledNumber value={calculateValue(definition, type)} formatter={addSign} hideZero />
      </Table.Cell>
    ))

  openModal = (definition: TerrainData) => this.props.openModal(ModalType.TerrainDetail, { type: definition.type })
}

const mapStateToProps = (state: AppState) => ({
  terrains: getTerrainsArray(state, undefined),
  mode: getMode(state)
})

const actions = {
  openModal,
  createTerrain
}

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
type IProps = S & D

export default connect(mapStateToProps, actions)(TerrainDefinitions)
