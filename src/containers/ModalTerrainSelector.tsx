import React, { Component } from 'react'
import { Map } from 'immutable'
import { connect } from 'react-redux'
import { AppState } from '../store/'
import { selectTerrain} from '../store/land_battle'
import { ModalSelector } from '../components/ModalSelector'
import { TerrainType, TerrainCalc, TerrainDefinition, LocationType } from '../store/terrains';

interface IStateFromProps {
  terrains : Map<TerrainType, TerrainDefinition>
}
interface IDispatchFromProps {
  selectTerrain: (index: number, terrain: TerrainDefinition) => void
}
interface IProps extends IStateFromProps, IDispatchFromProps {
  info: ModalInfo | null
  onClose: () => void
 }
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

const mapStateToProps = (state: AppState): IStateFromProps => ({
  terrains: state.terrains.terrains
})

const mapDispatchToProps = (dispatch: any): IDispatchFromProps => ({
  selectTerrain: (index, terrain) => dispatch(selectTerrain(index, terrain))
})

export default connect(mapStateToProps, mapDispatchToProps)(ModalTerrainSelector)
