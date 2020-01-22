import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Image, Table } from 'semantic-ui-react'

import { AppState, getMode, getSelectedTerrains } from 'state'
import ModalTerrainSelector from './modal/ModalTerrainSelector'
import IconDice from 'images/chance.png'
import StyledNumber from 'components/Utils/StyledNumber'
import { LocationType, TerrainDefinition, TerrainCalc } from 'types'
import { calculateValue } from 'definition_values'
import { addSign } from 'formatters'

type Props = {
}

type IState = {
  index?: number
  location?: LocationType
}

/**
 * Table with row types and flank sizes.
 */
class TerrainSelector extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = { index: undefined, location: undefined }
  }

  render() {
    const { terrains } = this.props
    const { index, location } = this.state
    return (
      <>
        <ModalTerrainSelector
          index={index}
          location={location}
          onClose={this.closeModal}
        />
        <Table celled unstackable selectable >
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>
                Location
                  </Table.HeaderCell>
              <Table.HeaderCell>
                Terrain
                    </Table.HeaderCell>
              <Table.HeaderCell>
                Roll modifier
                  </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {
              terrains.map((terrain, index) => this.renderTerrain(terrain, index))
            }
          </Table.Body>
        </Table >
      </>
    )
  }

  renderTerrain = (terrain: TerrainDefinition, index: number) => {
    const roll = calculateValue(terrain, TerrainCalc.Roll)
    return (
      <Table.Row key={terrain.location} onClick={() => this.setState({ index, location: terrain.location })}>
        <Table.Cell>
          {terrain.location}
        </Table.Cell>
        <Table.Cell>
          {terrain.type}
        </Table.Cell>
        <Table.Cell>
          <Image src={IconDice} avatar />
          <StyledNumber value={roll} formatter={addSign} />
        </Table.Cell>
      </Table.Row>
    )
  }

  closeModal = () => {
    this.setState({ index: undefined, location: undefined })
  }
}

const mapStateToProps = (state: AppState) => ({
  terrains: getSelectedTerrains(state),
  mode: getMode(state)
})

const actions = { }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
type IProps = Props & S & D

export default connect(mapStateToProps, actions)(TerrainSelector)
