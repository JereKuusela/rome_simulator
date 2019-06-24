import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Modal } from 'semantic-ui-react'
import { AppState } from '../store/'
import { selectTerrain } from '../store/battle'
import ItemSelector from '../components/ItemSelector'
import { TerrainType, TerrainCalc, LocationType } from '../store/terrains'
import { DefinitionType } from '../base_definition'

export interface ModalInfo {
  index: number
  location?: LocationType
}

class ModalTerrainSelector extends Component<IProps> {
  render(): JSX.Element | null {
    if (!this.props.info)
      return null
    return (
      <Modal basic onClose={this.props.onClose} open>
        <Modal.Content>
          <ItemSelector
            onClose={this.props.onClose}
            onSelection={this.selectTerrain}
            items={this.props.terrains.toList().filter(terrain => (terrain.mode === this.props.mode || terrain.mode === DefinitionType.Any) && this.props.info && (!this.props.info.location || terrain.location === this.props.info.location))}
            attributes={[TerrainCalc.Roll]}
          />
        </Modal.Content>
      </Modal>
    )
  }

  selectTerrain = (type: TerrainType | undefined): void => (
    this.props.info && type && this.props.selectTerrain(this.props.mode, this.props.info.index, type)
  )
}

const mapStateToProps = (state: AppState) => ({
  terrains: state.terrains.definitions,
  mode: state.settings.mode
})

const mapDispatchToProps = (dispatch: any) => ({
  selectTerrain: (mode: DefinitionType, index: number, type: TerrainType) => dispatch(selectTerrain(mode, index, type))
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
  info: ModalInfo | null
  onClose: () => void
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalTerrainSelector)
