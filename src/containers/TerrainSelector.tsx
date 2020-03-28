import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Image, Table } from 'semantic-ui-react'

import { AppState, getMode, getSelectedTerrains } from 'state'
import IconDice from 'images/chance.png'
import StyledNumber from 'components/Utils/StyledNumber'
import { Terrain, TerrainCalc, TerrainType } from 'types'
import { calculateValue } from 'definition_values'
import { addSign } from 'formatters'
import { selectTerrain, invalidate } from 'reducers'
import DropdownTerrain from 'components/Dropdowns/DropdownTerrain'
import { toArr } from 'utils'

type Props = {
}

/**
 * Table with row types and flank sizes.
 */
class TerrainSelector extends Component<IProps> {

  render() {
    const { selected: terrains } = this.props
    return (
      <Table celled unstackable >
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
          {terrains.map(this.renderTerrain)}
        </Table.Body>
      </Table >
    )
  }

  renderTerrain = (terrain: Terrain, index: number) => {
    const { terrains } = this.props
    const roll = calculateValue(terrain, TerrainCalc.Roll)
    return (
      <Table.Row key={terrain.location}>
        <Table.Cell>
          {terrain.location}
        </Table.Cell>
        <Table.Cell>
          <DropdownTerrain
            value={terrain.type}
            values={terrains.filter(item => item.location === terrain.location)}
            onSelect={type => this.selectTerrain(type, index)}
          />
        </Table.Cell>
        <Table.Cell>
          <Image src={IconDice} avatar />
          <StyledNumber value={roll} formatter={addSign} />
        </Table.Cell>
      </Table.Row>
    )
  }

  selectTerrain = (terrain_type: TerrainType, index: number): void => {
    const { selectTerrain, invalidate } = this.props
    selectTerrain(index, terrain_type)
    invalidate()
  }
}

const mapStateToProps = (state: AppState) => ({
  selected: getSelectedTerrains(state),
  terrains: toArr(state.terrains),
  mode: getMode(state)
})

const actions = { selectTerrain, invalidate }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
type IProps = Props & S & D

export default connect(mapStateToProps, actions)(TerrainSelector)
