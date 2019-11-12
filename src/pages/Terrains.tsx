import React, { Component } from 'react'
import { Modal } from 'semantic-ui-react'
import { connect } from 'react-redux'
import ModalTerrainDetail from '../containers/ModalTerrainDetail'
import { AppState } from '../store/index'
import TerrainDefinitions from '../components/TerrainDefinitions'
import ItemRemover from '../components/ItemRemover'
import { TerrainType, deleteTerrain, addTerrain, changeType } from '../store/terrains'
import { DefinitionType } from '../base_definition'
import { filterTerrains } from '../store/utils'
import { toArr } from '../utils'

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
          onCreateNew={type => this.props.addTerrain(type, this.props.mode)}
        />
      </>
    )
  }

  onRemove = (): void => {
    this.state.modal_terrain && this.props.deleteTerrain(this.state.modal_terrain)
    this.closeModal()
  }

  onChangeType = (old_type: TerrainType, new_type: TerrainType): void => {
    this.props.changeType(old_type, new_type)
    this.setState({ modal_terrain: new_type })
  }
}

const mapStateToProps = (state: AppState) => ({
  terrains: filterTerrains(state),
  mode: state.settings.mode
})

const mapDispatchToProps = (dispatch: any) => ({
  deleteTerrain: (type: TerrainType) => dispatch(deleteTerrain(type)),
  addTerrain: (type: TerrainType, mode: DefinitionType) => dispatch(addTerrain(type, mode)),
  changeType: (old_type: TerrainType, new_type: TerrainType) => dispatch(changeType(old_type, new_type))
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> { }

export default connect(mapStateToProps, mapDispatchToProps)(Terrains)
