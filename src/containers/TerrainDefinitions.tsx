import React, { Component } from 'react'
import { Table, Button, Image } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { AppState, getMode } from 'state'

import Headers from '../components/Utils/Headers'
import StyledNumber from '../components/Utils/StyledNumber'

import { TerrainDefinition, TerrainType, TerrainCalc, ModalType } from 'types'
import { keys, getImage, toArr } from 'utils'
import { calculateValue } from 'definition_values'
import { openModal, createTerrain } from 'reducers'
import { addSign } from 'formatters'

// Display component for showing unit definitions for an army.
class TerrainDefinitions extends Component<IProps> {

  readonly attributes = keys(TerrainCalc).map(k => TerrainCalc[k])
  readonly headers = ['Terrain', 'Location', 'Roll']

  render() {
    const { terrains } = this.props
    return (
      <>
        <Table celled selectable unstackable>
          <Headers values={this.headers} />
          <Table.Body>
            {terrains.map(this.renderRow)}
          </Table.Body>
        </Table>
        <Button primary onClick={this.onClick}>
          Create new
        </Button>
      </>
    )
  }

  onClick = () => this.props.openModal(ModalType.Value, {
    onSuccess: type => this.props.createTerrain(type as TerrainType, this.props.mode),
    message: 'New terrain type',
    button_message: 'Create',
    initial: ''
  })

  renderRow = (definition: TerrainDefinition) => {
    return (
      <Table.Row key={definition.type} onClick={() => this.openModal(definition)}>
        <Table.Cell>
          <Image src={getImage(definition)} avatar />
          {definition.type}
        </Table.Cell>
        <Table.Cell>
          {definition.location}
        </Table.Cell>
        {this.renderAttributes(definition)}
      </Table.Row >
    )
  }

  renderAttributes = (terrain: TerrainDefinition) => (
    this.attributes.map(type => (
      <Table.Cell key={type}>
        <StyledNumber value={calculateValue(terrain, type)} formatter={addSign} hide_zero />
      </Table.Cell>
    ))
  )

  openModal = (definition: TerrainDefinition) => this.props.openModal(ModalType.TerrainDetail, { type: definition.type })
}

const mapStateToProps = (state: AppState) => ({
  terrains: toArr(state.terrains),
  mode: getMode(state)
})

const actions = {
  openModal, createTerrain
}

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
type IProps = S & D

export default connect(mapStateToProps, actions)(TerrainDefinitions)
