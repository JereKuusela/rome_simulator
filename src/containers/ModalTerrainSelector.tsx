import React, { Component } from 'react'
import { connect } from 'react-redux'
import { AppState } from '../store/'
import { selectTerrain} from '../store/land_battle'
import { ModalSelector } from '../components/ModalSelector'
import { TerrainType, TerrainCalc, TerrainDefinition, LocationType } from '../store/terrains';

export interface ModalInfo {
  index: number
  location: LocationType
}

class ModalTerrainSelector extends Component<IProps> {
  render() {
    if (!this.props.info)
      return null
    return (
      <ModalSelector
        onClose={this.props.onClose}
        onSelection={this.selectTerrain}
        items={this.props.terrains.toList().filter(terrain => this.props.info && terrain.location === this.props.info.location)}
        attributes={[TerrainCalc.Roll]}
        can_remove={false}
      />
    )
  }

  selectTerrain = (type: TerrainType | null) => (
    this.props.info && type && this.props.selectTerrain(this.props.info.index, this.props.terrains.get(type)!)
  )
}

const mapStateToProps = (state: AppState) => ({
  terrains: state.terrains.terrains
})

const mapDispatchToProps = (dispatch: any) => ({
  selectTerrain: (index: number, terrain: TerrainDefinition) => dispatch(selectTerrain(index, terrain))
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
  info: ModalInfo | null
  onClose: () => void
 }

export default connect(mapStateToProps, mapDispatchToProps)(ModalTerrainSelector)
