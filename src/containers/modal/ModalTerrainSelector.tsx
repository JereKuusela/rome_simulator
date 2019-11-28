import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Modal } from 'semantic-ui-react'
import { AppState } from '../../store/'
import { selectTerrain, invalidate } from '../../store/battle'
import ItemSelector, { SelectorAttributes } from '../../components/ItemSelector'
import { TerrainType, TerrainCalc, LocationType } from '../../store/terrains'
import { calculateValue } from '../../base_definition'
import { filterTerrains, getMode } from '../../store/utils'
import StyledNumber from '../../components/Utils/StyledNumber'
import { addSign } from '../../formatters'
import { toArr, filter, map } from '../../utils'

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
