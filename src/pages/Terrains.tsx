import { Map } from 'immutable'
import React, { Component } from 'react'
import { Container } from 'semantic-ui-react'
import { connect } from 'react-redux'
import ModalTerrainDetail from '../containers/ModalTerrainDetail'
import { AppState } from '../store/index'
import { TableTerrainDefinitions } from '../components/TableTerrainDefinitions'
import { TerrainDefinition, TerrainType, LocationType } from '../store/terrains'


interface IStateFromProps {
  readonly terrains: Map<TerrainType, TerrainDefinition>
}
interface IDispatchFromProps {
}
interface IProps extends IStateFromProps, IDispatchFromProps { }

interface IState {
  modal_location: LocationType | null
  modal_terrain: TerrainType | null
}

class Terrains extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props)
    this.state = { modal_location: null, modal_terrain: null }
  }

  closeModal = () => this.setState({modal_location: null, modal_terrain: null})
  
  openModal = (terrain: TerrainType) => this.setState({modal_terrain: terrain})
  

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

const mapStateToProps = (state: AppState): IStateFromProps => ({
  terrains: state.terrains.terrains
})

const mapDispatchToProps = (dispatch: any): IDispatchFromProps => ({
})

export default connect(mapStateToProps, mapDispatchToProps)(Terrains)
