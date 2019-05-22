import React, { Component } from 'react'
import { Container } from 'semantic-ui-react'
import { connect } from 'react-redux'
import ModalTerrainDetail from '../containers/ModalTerrainDetail'
import { AppState } from '../store/index'
import { TableTerrainDefinitions } from '../components/TableTerrainDefinitions'
import { TerrainType, LocationType } from '../store/terrains'

interface IState {
  modal_location: LocationType | null
  modal_terrain: TerrainType | null
}

class Terrains extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props)
    this.state = { modal_location: null, modal_terrain: null }
  }

  closeModal = () => this.setState({ modal_location: null, modal_terrain: null })

  openModal = (terrain: TerrainType) => this.setState({ modal_terrain: terrain })


  render() {
    return (
      <Container>
        <ModalTerrainDetail
          onClose={this.closeModal}
          terrain={this.state.modal_terrain}
        />
        {
          <TableTerrainDefinitions
            terrains={this.props.terrains.toList()}
            onRowClick={terrain => this.openModal(terrain)}
          />
        }
      </Container>
    )
  }
}

const mapStateToProps = (state: AppState) => ({
  terrains: state.terrains.terrains
})

const mapDispatchToProps = (dispatch: any) => ({
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> { }

export default connect(mapStateToProps, mapDispatchToProps)(Terrains)
