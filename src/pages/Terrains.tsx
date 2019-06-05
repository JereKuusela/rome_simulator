import React, { Component } from 'react'
import { Container, Modal } from 'semantic-ui-react'
import { connect } from 'react-redux'
import ModalTerrainDetail from '../containers/ModalTerrainDetail'
import { AppState } from '../store/index'
import TerrainDefinitions from '../components/TerrainDefinitions'
import { TerrainType } from '../store/terrains'

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
            <ModalTerrainDetail
              terrain={this.state.modal_terrain}
            />
          </Modal.Content>
        </Modal>
        {
          <TerrainDefinitions
            terrains={this.props.terrains.toList()}
            onRowClick={terrain => this.openModal(terrain)}
          />
        }
      </Container>
    )
  }
}

const mapStateToProps = (state: AppState) => ({
  terrains: state.terrains
})

const mapDispatchToProps = (dispatch: any) => ({
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> { }

export default connect(mapStateToProps, mapDispatchToProps)(Terrains)
