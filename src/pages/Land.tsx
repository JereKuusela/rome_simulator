import React, { Component } from 'react'
import { ActionCreators } from 'redux-undo'
import { Container, Header, Button, Grid, Image } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { AppState } from '../store/index'
import { ArmyType } from '../store/units/types'
import { TableLandBattle } from '../components/TableLandBattle'
import { battle, ParticipantState } from '../store/land_battle'
import { TerrainDefinition } from '../store/terrains'
import { TacticDefinition } from '../store/tactics'
import ModalUnitSelector, { ModalInfo as ModalUnitInfo } from '../containers/ModalUnitSelector'
import ModalTerrainSelector, { ModalInfo as ModalTerrainInfo } from '../containers/ModalTerrainSelector'
import ModalTacticSelector, { ModalInfo as ModalTacticInfo } from '../containers/ModalTacticSelector'

interface IState {
  modal_unit_info: ModalUnitInfo | null
  modal_terrain_info: ModalTerrainInfo | null
  modal_tactic_info: ModalTacticInfo | null
}

class Land extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props)
    this.state = { modal_unit_info: null, modal_terrain_info: null, modal_tactic_info: null }
  }


  closeModal = () => this.setState({ modal_unit_info: null, modal_terrain_info: null, modal_tactic_info: null })

  openUnitModal = (army: ArmyType, row: number, column: number) => this.setState({ modal_unit_info: { army, row, column } })

  openTerrainModal = (index: number) => this.setState({ modal_terrain_info: { index, location: this.props.terrains.get(index)!.location } })

  openTacticModal = (army: ArmyType) => this.setState({ modal_tactic_info: { army } })

  render() {
    return (
      <Container>
        <ModalUnitSelector
          info={this.state.modal_unit_info}
          onClose={this.closeModal}
        />
        <ModalTerrainSelector
          info={this.state.modal_terrain_info}
          onClose={this.closeModal}
        />
        <ModalTacticSelector
          info={this.state.modal_tactic_info}
          onClose={this.closeModal}
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
          <Grid.Row columns={2}>
          <Grid.Column>
              {
                this.renderTactic(this.props.attacker.tactic, ArmyType.Attacker)
              }
            </Grid.Column>
            <Grid.Column>
              {
                this.renderArmy(ArmyType.Attacker, this.props.attacker)
              }
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={2}>
          <Grid.Column>
              {
                this.renderTactic(this.props.defender.tactic, ArmyType.Defender)
              }
            </Grid.Column>
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

  renderTactic = (tactic: TacticDefinition | null, army: ArmyType) => {
    return (
      <Grid.Column key={army} onClick={() => this.openTacticModal(army)}>
        <Header>{army}</Header>
        <div>
          {tactic && tactic.image ? <Image src={tactic.image} avatar /> : null}
          {tactic && tactic.type}
        </div>
      </Grid.Column>
    )
  }
}

const mapStateToProps = (state: AppState) => ({
  attacker: state.land.present.attacker,
  defender: state.land.present.defender,
  is_undo: state.land.past.length > 0,
  is_redo: state.land.future.length > 0,
  round: state.land.present.day,
  terrains: state.land.present.terrains
})

const mapDispatchToProps = (dispatch: any) => ({
  battle: () => dispatch(battle()),
  undo: () => dispatch(ActionCreators.undo()),
  redo: () => dispatch(ActionCreators.redo())
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> { }

export default connect(mapStateToProps, mapDispatchToProps)(Land)
