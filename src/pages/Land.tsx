import React, { Component } from 'react'
import { Container, Header, Button, Grid, Image, Checkbox, Input, Table, Divider } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { AppState } from '../store/index'
import { ArmyName, UnitDefinition, ArmyType } from '../store/units/types'
import UnitArmy from '../components/UnitArmy'
import { battle, undo, ParticipantState, toggleRandomRoll, setRoll, setGeneral } from '../store/land_battle'
import { calculateTactic} from '../store/land_battle/combat'
import { TerrainDefinition, TerrainCalc } from '../store/terrains'
import { TacticDefinition } from '../store/tactics'
import IconDice from '../images/chance.png'
import ModalUnitSelector, { ModalInfo as ModalUnitInfo } from '../containers/ModalUnitSelector'
import ModalTerrainSelector, { ModalInfo as ModalTerrainInfo } from '../containers/ModalTerrainSelector'
import ModalTacticSelector, { ModalInfo as ModalTacticInfo } from '../containers/ModalTacticSelector'
import ModalArmyUnitDetail, { ModalInfo as ModalArmyUnitInfo } from '../containers/ModalArmyUnitDetail'

interface IState {
  modal_unit_info: ModalUnitInfo | null
  modal_terrain_info: ModalTerrainInfo | null
  modal_tactic_info: ModalTacticInfo | null
  modal_army_unit_info: ModalArmyUnitInfo | null
}

class Land extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props)
    this.state = { modal_unit_info: null, modal_terrain_info: null, modal_tactic_info: null, modal_army_unit_info: null }
  }


  closeModal = () => this.setState({ modal_unit_info: null, modal_terrain_info: null, modal_tactic_info: null, modal_army_unit_info: null })

  openUnitModal = (army: ArmyName, type: ArmyType, row: number, column: number, unit: UnitDefinition | null) => {
    if (unit)
      this.openArmyUnitModal(army, type, row, column, unit)
    else
      this.openUnitSelector(army, type, row, column, unit)
  }

  openUnitSelector = (army: ArmyName, type: ArmyType, row: number, column: number, unit: UnitDefinition | null) => this.setState({ modal_unit_info: { army, type, row, column, unit } })

  openArmyUnitModal = (army: ArmyName, type: ArmyType, row: number, column: number, unit: UnitDefinition) => this.setState({ modal_army_unit_info: { army, type, row, column, unit } })

  openTerrainModal = (index: number) => this.setState({ modal_terrain_info: { index, location: this.props.terrains.get(index)!.location } })

  openTacticModal = (army: ArmyName) => this.setState({ modal_tactic_info: { army } })

  render() {
    return (
      <Container>
        <ModalUnitSelector
          info={this.state.modal_unit_info}
          onClose={this.closeModal}
        />
        <ModalArmyUnitDetail
          info={this.state.modal_army_unit_info}
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
            <Grid.Column floated='left'><Header>{'Round: ' + this.roundName(this.props.round)}</Header></Grid.Column>
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
                this.renderArmy(ArmyName.Attacker, this.props.attacker)
              }
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={1}>
            <Grid.Column>
              {
                this.renderArmy(ArmyName.Defender, this.props.defender)
              }
            </Grid.Column>
          </Grid.Row>
          <Divider />
          <Grid.Row columns={1}>
            <Grid.Column>
              <Table celled unstackable>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>
                    </Table.HeaderCell>
                    <Table.HeaderCell collapsing>
                      General skill
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
                  {this.renderArmyInfo(ArmyName.Attacker, this.props.attacker, this.props.defender.tactic)}
                  {this.renderArmyInfo(ArmyName.Defender, this.props.defender, this.props.attacker.tactic)}
                </Table.Body>
              </Table>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={1}>
            <Grid.Column>
              <Table celled unstackable>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>
                      Location
                  </Table.HeaderCell>
                    <Table.HeaderCell>
                      Terrain
                    </Table.HeaderCell>
                    <Table.HeaderCell>
                      Roll modifier
                  </Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {
                    this.props.terrains.map((terrain, index) => this.renderTerrain(terrain, index))
                  }
                </Table.Body>
              </Table>
            </Grid.Column>
          </Grid.Row>
          <Divider />
          <Grid.Row columns={1}>
            <Grid.Column>
              {
                this.renderReserve(ArmyName.Attacker, this.props.attacker)
              }
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={1}>
            <Grid.Column>
              {
                this.renderReserve(ArmyName.Defender, this.props.defender)
              }
            </Grid.Column>
          </Grid.Row>
          <Divider />
          <Grid.Row columns={1}>
            <Grid.Column>
              {
                this.renderDefeatedArmy(ArmyName.Attacker, this.props.attacker)
              }
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={1}>
            <Grid.Column>
              {
                this.renderDefeatedArmy(ArmyName.Defender, this.props.defender)
              }
            </Grid.Column>
          </Grid.Row>
        </Grid >
      </Container >
    )
  }

  roundName = (round: number) => {
    if (round < 0)
      return 'Before combat'
    return String(round)
  }

  renderArmy = (army: ArmyName, units: ParticipantState) => {
    return (
      <div key={army}>
        {army === ArmyName.Attacker && <Header>{army + '\'s army'}</Header>}
        <UnitArmy
          onClick={(row, column, unit) => this.openUnitModal(army, ArmyType.Main, row, column, unit)}
          units={units.army}
          reverse={army === ArmyName.Attacker}
          type={ArmyType.Main}
        />
        {army === ArmyName.Defender && <Header>{army + '\'s army'}</Header>}
      </div>
    )
  }

  renderRoll = (army: ArmyName, roll: number, is_random: boolean) => {
    return (
      <div key={army}>
        <Image src={IconDice} avatar />
        {is_random ? roll : <Input size='mini' style={{ width: 100 }} type='number' value={roll} onChange={(_, data) => this.props.setRoll(army, Number(data.value))} />}
      </div>
    )
  }

  renderIsRollRandom = (army: ArmyName, is_random: boolean) => {
    return (
      <Checkbox toggle checked={is_random} onClick={() => this.props.toggleRandomRoll(army)} />
    )
  }

  renderReserve = (army: ArmyName, units: ParticipantState) => {
    return (
      <div key={army}>
        <Header>{army + '\'s reserve'}</Header>
        <UnitArmy
          onClick={(row, column, unit) => this.openUnitModal(army, ArmyType.Reserve, row, column, unit)}
          units={units.reserve}
          reverse={false}
          type={ArmyType.Reserve}
        />
      </div>
    )
  }

  renderDefeatedArmy = (army: ArmyName, units: ParticipantState) => {
    return (
      <div key={army}>
        <Header>{army + '\'s defeated units'}</Header>
        <UnitArmy
          onClick={(row, column, unit) => this.openUnitModal(army, ArmyType.Defeated, row, column, unit)}
          units={units.defeated}
          reverse={false}
          type={ArmyType.Defeated}
        />
      </div>
    )
  }

  renderTerrain = (terrain: TerrainDefinition, index: number) => {
    return (
      <Table.Row key={terrain.location} onClick={() => this.openTerrainModal(index)}>
        <Table.Cell>
          {terrain.location}
        </Table.Cell>
        <Table.Cell>
          {terrain.type}
        </Table.Cell>
        <Table.Cell>
          <Image src={IconDice} avatar />
          {terrain.calculateValue(TerrainCalc.Roll)}
        </Table.Cell>
      </Table.Row>
    )
  }

  renderTactic = (army: ArmyName, info: ParticipantState, counter: TacticDefinition | null) => {
    const tactic = info.tactic
    return (
      <div key={army} onClick={() => this.openTacticModal(army)}>
        {tactic && tactic.image ? <Image src={tactic.image} avatar /> : null}
        {tactic && tactic.type}
        {tactic && ' (' + this.toRelativePercent(calculateTactic(tactic, info.army.get(0)!, counter), true) + ')'}
      </div >
    )
  }

  toRelativePercent = (number: number, show_zero: boolean) => {
    const value = +(number * 100.0 - 100.0).toFixed(2)
    if (value > 0)
      return '+' + String(value) + '%'
    if (value === 0 && !show_zero)
      return ''
    if (value === 0 && show_zero)
      return '+0%'
    return String(value) + '%'
  }

  renderArmyInfo = (army_type: ArmyName, info: ParticipantState, counter_tactic: TacticDefinition | null) => {
    return (
      <Table.Row key={army_type}>
        <Table.Cell collapsing>
          {army_type}
        </Table.Cell>
        <Table.Cell collapsing>
          <Input size='mini' style={{ width: 100 }} type='number' value={info.general} onChange={(_, data) => this.props.setGeneral(army_type, Number(data.value))} />
        </Table.Cell>
        <Table.Cell collapsing>
          {this.renderTactic(army_type, info, counter_tactic)}
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
  is_undo: state.land.day > -1,
  round: state.land.day,
  terrains: state.land.terrains,
  fight_over: state.land.fight_over
})

const mapDispatchToProps = (dispatch: any) => ({
  battle: (steps: number) => dispatch(battle(steps)),
  undo: (steps: number) => dispatch(undo(steps)),
  toggleRandomRoll: (army: ArmyName) => dispatch(toggleRandomRoll(army)),
  setRoll: (army: ArmyName, roll: number) => dispatch(setRoll(army, roll)),
  setGeneral: (army: ArmyName, skill: number) => dispatch(setGeneral(army, skill))
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> { }

export default connect(mapStateToProps, mapDispatchToProps)(Land)
