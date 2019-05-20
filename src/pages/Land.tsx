import React, { Component } from 'react'
import { ActionCreators } from 'redux-undo'
import { Map, List } from 'immutable'
import { Container, Header, Button, Grid } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { AppState } from '../store/index'
import { ArmyType } from '../store/units/types'
import { TableLandBattle } from '../components/TableLandBattle'
import { battle, ParticipantState, selectTerrain } from '../store/land_battle'
import { TerrainDefinition, TerrainType, LocationType } from '../store/terrains'
import ModalUnitSelector, { ModalInfo as ModalUnitInfo } from '../containers/ModalUnitSelector'
import ModalTerrainSelector, { ModalInfo as ModalTerrainInfo } from '../containers/ModalTerrainSelector'


interface IStateFromProps {
  readonly attacker: ParticipantState
  readonly defender: ParticipantState
  readonly is_undo: boolean
  readonly is_redo: boolean
  readonly round: number
  readonly terrains: List<TerrainDefinition>
  readonly available_terrains: Map<TerrainType, TerrainDefinition>
}
interface IDispatchFromProps {
  battle: () => void
  undo: () => void
  redo: () => void
  selectTerrain: (index: number, terrain: TerrainDefinition) => void
}
interface IProps extends IStateFromProps, IDispatchFromProps { }

interface IState {
  modal_unit_info: ModalUnitInfo | null
  modal_terrain_info: ModalTerrainInfo | null
}

class Land extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props)
    this.state = { modal_unit_info: null, modal_terrain_info: null };
    this.props.selectTerrain(0, this.props.available_terrains.get(TerrainType.None)!)
    this.props.selectTerrain(1, this.props.available_terrains.get(TerrainType.Plains)!)
  }


  closeUnitModal = () => this.setState({ modal_unit_info: null })

  openUnitModal = (army: ArmyType, row: number, column: number) => this.setState({ modal_unit_info: { army, row, column }})

  closeTerrainModal = () => this.setState({ modal_terrain_info: null })

  openTerrainModal = (index: number) => this.setState({ modal_terrain_info: { index, location: this.props.terrains.get(index)!.location }})

  render() {
    return (
      <Container>
        <ModalUnitSelector
          info={this.state.modal_unit_info}
          onClose={this.closeUnitModal}
        />
        <ModalTerrainSelector
          info={this.state.modal_terrain_info}
          onClose={this.closeTerrainModal}
        />
        <Grid verticalAlign='middle'>
          <Grid.Row columns={3}>
            <Grid.Column>
              <Button disabled={!this.props.is_undo} onClick={this.props.undo}>
                {'<'}
              </Button>
              <Button onClick={this.props.battle}>
                FIGHT
              </Button>
              <Button disabled={!this.props.is_redo} onClick={this.props.redo}>
                {'>'}
              </Button>
            </Grid.Column>
            <Grid.Column></Grid.Column>
            <Grid.Column><Header>{'Round: ' + this.props.round}</Header></Grid.Column>
          </Grid.Row>
          <Grid.Row columns={1}>
            <Grid.Column>
              {
                this.renderArmy(ArmyType.Attacker, this.props.attacker)
              }
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={1}>
            <Grid.Column>
              {
                this.renderArmy(ArmyType.Defender, this.props.defender)
              }
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={2}>   
              {
                this.props.terrains.map((terrain, index) => this.renderTerrain(terrain, index))
              }
          </Grid.Row>
        </Grid >
      </Container >
    )
  }

  renderArmy = (army: ArmyType, units: ParticipantState) => {
    return (
      <div key={army}>
        <Header>{army}</Header>
        <TableLandBattle
          onClick={(row, column) => this.openUnitModal(army, row, column)}
          units={units.army}
          reverse={army === ArmyType.Attacker}
        />
      </div>
    )
  }

  renderTerrain = (terrain: TerrainDefinition, index: number) => {
    return (
      <Grid.Column key={terrain.location} onClick={() => this.openTerrainModal(index)}>
        <Header>{terrain.location}</Header>
        <div>
          {terrain.type}
        </div>
      </Grid.Column>
    )
  }
}

const mapStateToProps = (state: AppState): IStateFromProps => ({
  attacker: state.land.present.attacker,
  defender: state.land.present.defender,
  is_undo: state.land.past.length > 0,
  is_redo: state.land.future.length > 0,
  round: state.land.present.day,
  terrains: state.land.present.terrains,
  available_terrains: state.terrains.terrains
})

const mapDispatchToProps = (dispatch: any): IDispatchFromProps => ({
  battle: () => dispatch(battle()),
  undo: () => dispatch(ActionCreators.undo()),
  redo: () => dispatch(ActionCreators.redo()),
  
  selectTerrain: (index, terrain) => dispatch(selectTerrain(index, terrain))
})


export default connect(mapStateToProps, mapDispatchToProps)(Land)
