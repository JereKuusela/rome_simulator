import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Modal } from 'semantic-ui-react'
import { AppState, filterTerrains, getMode } from 'state'
import ItemSelector, { SelectorAttributes } from '../../components/ItemSelector'
import StyledNumber from '../../components/Utils/StyledNumber'
import { LocationType, TerrainType, TerrainCalc } from 'types'
import { map, filter, toArr } from 'utils'
import { calculateValue } from 'definition_values'
import { addSign } from 'formatters'
import { selectTerrain, invalidate } from 'reducers'

type Props = {
  index?: number
  location?: LocationType
  onClose: () => void
}

class ModalTerrainSelector extends Component<IProps> {
  render() {
    const { index, terrains, onClose } = this.props
    if (index === undefined)
      return null
    const attributes = {} as SelectorAttributes<TerrainType>
    attributes['to attacker\'s roll'] = map(filter(terrains, value => calculateValue(value, TerrainCalc.Roll)), value => (
      <StyledNumber
        value={calculateValue(value, TerrainCalc.Roll)}
        formatter={addSign}
      />
    ))
    return (
      <Modal basic onClose={onClose} open>
        <Modal.Content>
          <ItemSelector
            onSelection={this.selectTerrain}
            items={toArr(terrains)}
            attributes={attributes}
          />
        </Modal.Content>
      </Modal>
    )
  }

  selectTerrain = (terrain_type: TerrainType | null): void => {
    const { selectTerrain, invalidate, onClose, mode, index } = this.props
    if (index !== undefined && terrain_type)
      selectTerrain(mode, index, terrain_type)
    invalidate(mode)
    onClose()
  }
}

const mapStateToProps = (state: AppState, props: Props) => ({
  terrains: filterTerrains(state, props.location),
  mode: getMode(state)
})

const actions = { selectTerrain, invalidate }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
type IProps = Props & S & D

export default connect(mapStateToProps, actions)(ModalTerrainSelector)
