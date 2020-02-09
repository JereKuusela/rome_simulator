import React, { Component } from 'react'
import { Modal } from 'semantic-ui-react'
import { connect } from 'react-redux'
import ModalTerrainDetail from 'containers/modal/ModalTerrainDetail'
import { AppState, filterTerrains } from 'state'
import TerrainDefinitions from 'components/TerrainDefinitions'
import ItemRemover from 'components/ItemRemover'
import { TerrainType } from 'types'
import { toArr } from 'utils'
import { deleteTerrain, createTerrain, setTerrainType } from 'reducers'

interface IState {
  modal_terrain: TerrainType | null
}

class Terrains extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props)
    this.state = { modal_terrain: null }
  }

  closeModal = (): void => this.setState({ modal_terrain: null })

  openModal = (terrain: TerrainType): void => this.setState({ modal_terrain: terrain })


  render() {
    return (
      <>
        <Modal basic onClose={this.closeModal} open={this.state.modal_terrain !== null}>
          <Modal.Content>
            <ItemRemover
              onRemove={this.onRemove}
              confirm_remove={true}
              item={'terrain definition ' + String(this.state.modal_terrain)}
            />
            <ModalTerrainDetail
              terrain={this.state.modal_terrain}
              changeType={this.onChangeType}
            />
          </Modal.Content>
        </Modal>
        <TerrainDefinitions
          terrains={toArr(this.props.terrains)}
          onRowClick={terrain => this.openModal(terrain)}
          onCreateNew={type => this.props.createTerrain(type, this.props.mode)}
        />
      </>
    )
  }

  onRemove = (): void => {
    this.state.modal_terrain && this.props.deleteTerrain(this.state.modal_terrain)
    this.closeModal()
  }

  onChangeType = (old_type: TerrainType, new_type: TerrainType): void => {
    this.props.setTerrainType(old_type, new_type)
    this.setState({ modal_terrain: new_type })
  }
}

const mapStateToProps = (state: AppState) => ({
  terrains: filterTerrains(state),
  mode: state.settings.mode
})

const actions = { deleteTerrain, createTerrain, setTerrainType }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
type IProps = S & D

export default connect(mapStateToProps, actions)(Terrains)
