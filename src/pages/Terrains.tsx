import React, { Component } from 'react'
import { Container, Modal } from 'semantic-ui-react'
import { connect } from 'react-redux'
import ModalTerrainDetail from '../containers/ModalTerrainDetail'
import { AppState } from '../store/index'
import TerrainDefinitions from '../components/TerrainDefinitions'
import ItemRemover from '../components/ItemRemover'
import { TerrainType, deleteTerrain, addTerrain, changeType } from '../store/terrains'

interface IState {
  modal_terrain: TerrainType | null
}

class Terrains extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props)
    this.state = { modal_terrain: null }
  }

  closeModal = () => this.setState({ modal_terrain: null })

  openModal = (terrain: TerrainType) => this.setState({ modal_terrain: terrain })


  render() {
    return (
      <Container>
        <Modal basic onClose={this.closeModal} open={this.state.modal_terrain !== null}>
          <Modal.Content>
            <ItemRemover
              onClose={this.closeModal}
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
        {
          <TerrainDefinitions
            terrains={this.props.types.map(type => this.props.terrains.get(type)!).filter(value => value)}
            onRowClick={terrain => this.openModal(terrain)}
            onCreateNew={this.props.addTerrain}
          />
        }
      </Container>
    )
  }

  onRemove = () => this.state.modal_terrain && this.props.deleteTerrain(this.state.modal_terrain)

  onChangeType = (old_type: TerrainType, new_type: TerrainType) => {
    this.props.changeType(old_type, new_type)
    this.setState({ modal_terrain: new_type })
  }
}

const mapStateToProps = (state: AppState) => ({
  terrains: state.terrains.definitions,
  types: state.terrains.types
})

const mapDispatchToProps = (dispatch: any) => ({
  deleteTerrain: (type: TerrainType) => dispatch(deleteTerrain(type)),
  addTerrain: (type: TerrainType) => dispatch(addTerrain(type)),
  changeType: (old_type: TerrainType, new_type: TerrainType) => dispatch(changeType(old_type, new_type))
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> { }

export default connect(mapStateToProps, mapDispatchToProps)(Terrains)
