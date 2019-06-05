import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Modal } from 'semantic-ui-react'
import { AppState } from '../store/'
import { selectTerrain } from '../store/land_battle'
import ItemSelector from '../components/ItemSelector'
import { TerrainType, TerrainCalc, LocationType } from '../store/terrains';

export interface ModalInfo {
  index: number
  location: LocationType
}

class ModalTerrainSelector extends Component<IProps> {
  render() {
    if (!this.props.info)
      return null
    return (
      <Modal basic onClose={this.props.onClose} open>
        <Modal.Content>
          <ItemSelector
            onClose={this.props.onClose}
            onSelection={this.selectTerrain}
            items={this.props.terrains.toList().filter(terrain => this.props.info && terrain.location === this.props.info.location)}
            attributes={[TerrainCalc.Roll]}
            can_remove={false}
            can_select={true}
          />
        </Modal.Content>
      </Modal>
    )
  }

  selectTerrain = (type: TerrainType | undefined) => (
    this.props.info && type && this.props.selectTerrain(this.props.info.index, type)
  )
}

const mapStateToProps = (state: AppState) => ({
  terrains: state.terrains.definitions
})

const mapDispatchToProps = (dispatch: any) => ({
  selectTerrain: (index: number, type: TerrainType) => dispatch(selectTerrain(index, type))
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
  info: ModalInfo | null
  onClose: () => void
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalTerrainSelector)
