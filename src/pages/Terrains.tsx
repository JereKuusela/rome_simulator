import { Map } from 'immutable'
import React, { Component } from 'react'
import { Container, Header } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { AppState } from '../store/index'
import { setTerrainModal } from '../store/layout'
import { TableTerrainDefinitions } from '../components/TableTerrainDefinitions'
import { TerrainDefinition, TerrainType, LocationType } from '../store/terrains'


interface IStateFromProps {
  readonly terrains: Map<LocationType, Map<TerrainType, TerrainDefinition>>
}
interface IDispatchFromProps {
  editTerrain: (location: LocationType, terrain: TerrainDefinition) => void
}
interface IProps extends IStateFromProps, IDispatchFromProps { }

class Terrains extends Component<IProps> {

  render() {
    return (
      <Container>
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
          onRowClick={unit => this.props.editTerrain(location, unit)}
        />
      </div>
    )
  }
}

const mapStateToProps = (state: AppState): IStateFromProps => ({
  terrains: state.terrains.terrains
})

const mapDispatchToProps = (dispatch: any): IDispatchFromProps => ({
  editTerrain: (location, terrain) => dispatch(setTerrainModal(location, terrain))
})

export default connect(mapStateToProps, mapDispatchToProps)(Terrains)
