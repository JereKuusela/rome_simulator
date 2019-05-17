import { Map } from 'immutable'
import React, { Component } from 'react'
import { Container, Header } from 'semantic-ui-react'
import { connect } from 'react-redux'
import ModalTerrainDetail from '../containers/ModalTerrainDetail'
import { AppState } from '../store/index'
import { TableTerrainDefinitions } from '../components/TableTerrainDefinitions'
import { TerrainDefinition, TerrainType, LocationType } from '../store/terrains'


interface IStateFromProps {
  readonly terrains: Map<LocationType, Map<TerrainType, TerrainDefinition>>
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
    this.state = { modal_location: null, modal_terrain: null };
  }

  closeModal = () => this.setState({modal_location: null, modal_terrain: null})
  
  openModal = (location: LocationType, terrain: TerrainType) => this.setState({modal_location: location, modal_terrain: terrain})
  

  render() {
    return (
      <Container>
        <ModalTerrainDetail
          onClose={this.closeModal}
          location={this.state.modal_location}
          terrain={this.state.modal_terrain}
        />
        {
          Array.from(this.props.terrains).map(value => {
            return this.renderLocation(value[0], value[1])
          })
        }
      </Container>
    )
  }
  renderLocation = (location: LocationType, terrains: Map<TerrainType, TerrainDefinition>) => {
    return (
      <div key={location}>
        <Header>{location}</Header>
        <TableTerrainDefinitions
          terrains={terrains.toList()}
          onRowClick={terrain => this.openModal(location, terrain)}
        />
      </div>
    )
  }
}

const mapStateToProps = (state: AppState): IStateFromProps => ({
  terrains: state.terrains.terrains
})

const mapDispatchToProps = (dispatch: any): IDispatchFromProps => ({
})

export default connect(mapStateToProps, mapDispatchToProps)(Terrains)
