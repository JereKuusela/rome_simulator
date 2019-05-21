import React, { Component } from 'react'
import { Container, Header, Button, Grid, Image } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { AppState } from '../store/index'
import { ArmyType } from '../store/units/types'
import { TableLandBattle } from '../components/TableLandBattle'
import { battle, undo, ParticipantState } from '../store/land_battle'
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

  openUnitModal = (army: ArmyType, row: number, column: number) => this.setState({ modal_unit_info: { army, row, column, is_defeated: false } })

  openDefeatedUnitModal = (army: ArmyType, row: number, column: number) => this.setState({ modal_unit_info: { army, row, column, is_defeated: true } })

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
              <Button disabled={!this.props.is_undo} onClick={() => this.props.undo(10)}>
                {'<<'}
              </Button>
              <Button disabled={!this.props.is_undo} onClick={() => this.props.undo(1)}>
                {'<'}
              </Button>
              <Button onClick={() => this.props.battle(1)}>
                {'>'}
              </Button>
              <Button onClick={() => this.props.battle(10)}>
                {'>>'}
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
          <Grid.Row columns={2}>
            <Grid.Column>
            </Grid.Column>
            <Grid.Column>
              {
                this.renderDefeatedArmy(ArmyType.Attacker, this.props.attacker)
              }
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={2}>
            <Grid.Column>
            </Grid.Column>
            <Grid.Column>
              {
                this.renderDefeatedArmy(ArmyType.Defender, this.props.defender)
              }
            </Grid.Column>
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

  renderDefeatedArmy = (army: ArmyType, units: ParticipantState) => {
    return (
      <div key={army}>
        <Header>{army}</Header>
        <TableLandBattle
          onClick={(row, column) => this.openDefeatedUnitModal(army, row, column)}
          units={units.defeated_army}
          reverse={false}
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
  attacker: state.land.attacker,
  defender: state.land.defender,
  is_undo: state.land.day > 0,
  round: state.land.day,
  terrains: state.land.terrains
})

const mapDispatchToProps = (dispatch: any) => ({
  battle: (steps: number) => dispatch(battle(steps)),
  undo: (steps: number) => dispatch(undo(steps))
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> { }

export default connect(mapStateToProps, mapDispatchToProps)(Land)
