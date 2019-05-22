import React, { Component } from 'react'
import { Container, Header, Button, Grid, Image, Checkbox, Input, Table } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { AppState } from '../store/index'
import { ArmyType } from '../store/units/types'
import { TableLandBattle } from '../components/TableLandBattle'
import { battle, undo, ParticipantState, toggleRandomRoll, setRoll, setGeneral } from '../store/land_battle'
import { TerrainDefinition } from '../store/terrains'
import { TacticDefinition } from '../store/tactics'
import IconDice from '../images/chance.png'
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
          <Grid.Row columns={3} >
            <Grid.Column floated='left'><Header>{'Round: ' + this.props.round}</Header></Grid.Column>
            <Grid.Column />
            <Grid.Column floated='right' textAlign='right'>
              <Button circular icon='angle double left' color='black' size='huge' disabled={!this.props.is_undo} onClick={() => this.props.undo(10)} />
              <Button circular icon='angle left' color='black' size='huge' disabled={!this.props.is_undo} onClick={() => this.props.undo(1)} />
              <Button circular icon='angle right' color='black' size='huge' disabled={this.props.fight_over} onClick={() => this.props.battle(1)} />
              <Button circular icon='angle double right' color='black' size='huge' disabled={this.props.fight_over} onClick={() => this.props.battle(10)} />
            </Grid.Column>

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
          <Grid.Row columns={1}>
            <Grid.Column>
              <Table celled>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>
                    </Table.HeaderCell>
                    <Table.HeaderCell>
                      General
                    </Table.HeaderCell>
                    <Table.HeaderCell>
                      Tactic
                    </Table.HeaderCell>
                    <Table.HeaderCell>
                      Dice
                    </Table.HeaderCell>
                    <Table.HeaderCell>
                      Randomize
                    </Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {this.renderArmyInfo(ArmyType.Attacker, this.props.attacker)}
                  {this.renderArmyInfo(ArmyType.Defender, this.props.defender)}
                </Table.Body>
              </Table>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={6}>
            {
              this.props.terrains.map((terrain, index) => this.renderTerrain(terrain, index))
            }
          </Grid.Row>
          <Grid.Row columns={1}>
            <Grid.Column>
              {
                this.renderDefeatedArmy(ArmyType.Attacker, this.props.attacker)
              }
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={1}>
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

  renderRoll = (army: ArmyType, roll: number, is_random: boolean) => {
    return (
      <div key={army}>
        <Image src={IconDice} avatar />
        {is_random ? roll : <Input size='mini' style={{width: 100}} type='number' value={roll} onChange={(_, data) => this.props.setRoll(army, Number(data.value))} />}
      </div>
    )
  }

  renderIsRollRandom = (army: ArmyType, is_random: boolean) => {
    return (
      <Checkbox toggle checked={is_random} onClick={() => this.props.toggleRandomRoll(army)} />
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

  renderTactic = (army: ArmyType, tactic: TacticDefinition | null) => {
    return (
      <div key={army} onClick={() => this.openTacticModal(army)}>
        {tactic && tactic.image ? <Image src={tactic.image} avatar /> : null}
        {tactic && tactic.type}
      </div >
    )
  }

  renderArmyInfo = (army_type: ArmyType, info: ParticipantState) => {
    return (
      <Table.Row key={army_type}>
        <Table.Cell collapsing>
          {army_type}
        </Table.Cell>
        <Table.Cell collapsing>
          <Input size='mini' style={{width: 100}} type='number' value={info.general} onChange={(_, data) => this.props.setGeneral(army_type, Number(data.value))} />
        </Table.Cell>
        <Table.Cell collapsing>
          {this.renderTactic(army_type, info.tactic)}
        </Table.Cell>
        <Table.Cell>
          {this.renderRoll(army_type, info.roll, info.randomize_roll)}
        </Table.Cell>
        <Table.Cell collapsing>
          {this.renderIsRollRandom(army_type, info.randomize_roll)}
        </Table.Cell>
      </Table.Row>
    )
  }
}

const mapStateToProps = (state: AppState) => ({
  attacker: state.land.attacker,
  defender: state.land.defender,
  is_undo: state.land.day > 0,
  round: state.land.day,
  terrains: state.land.terrains,
  fight_over: state.land.fight_over
})

const mapDispatchToProps = (dispatch: any) => ({
  battle: (steps: number) => dispatch(battle(steps)),
  undo: (steps: number) => dispatch(undo(steps)),
  toggleRandomRoll: (army: ArmyType) => dispatch(toggleRandomRoll(army)),
  setRoll: (army: ArmyType, roll: number) => dispatch(setRoll(army, roll)),
  setGeneral: (army: ArmyType, skill: number) => dispatch(setGeneral(army, skill))
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> { }

export default connect(mapStateToProps, mapDispatchToProps)(Land)
