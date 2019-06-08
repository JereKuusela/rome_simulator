import React, { Component } from 'react'
import { Map, List } from 'immutable'
import { Container, Header, Button, Grid, Image, Checkbox, Input, Table, Divider, Dropdown} from 'semantic-ui-react'
import { connect } from 'react-redux'
import { AppState } from '../store/index'
import { ArmyName, UnitDefinition, ArmyType, Unit, UnitType } from '../store/units/types'
import UnitArmy from '../components/UnitArmy'
import { battle, undo, Participant, ParticipantType, toggleRandomRoll, setRoll, setGeneral, RowType, setFlankSize, setArmyName } from '../store/land_battle'
import { calculateTactic } from '../store/battle/combat'
import { TerrainDefinition, TerrainCalc } from '../store/terrains'
import { TacticDefinition } from '../store/tactics'
import IconDice from '../images/chance.png'
import ModalUnitSelector, { ModalInfo as ModalUnitInfo } from '../containers/ModalUnitSelector'
import ModalRowTypeSelector, { ModalInfo as ModalRowInfo } from '../containers/ModalRowTypeSelector'
import ModalTerrainSelector, { ModalInfo as ModalTerrainInfo } from '../containers/ModalTerrainSelector'
import ModalTacticSelector, { ModalInfo as ModalTacticInfo } from '../containers/ModalTacticSelector'
import ModalArmyUnitDetail, { ModalInfo as ModalArmyUnitInfo } from '../containers/ModalArmyUnitDetail'
import ModalFastPlanner from '../containers/ModalFastPlanner'
import { calculateValue, mergeValues, getImage } from '../base_definition'

interface IState {
  modal_unit_info: ModalUnitInfo | null
  modal_terrain_info: ModalTerrainInfo | null
  modal_tactic_info: ModalTacticInfo | null
  modal_army_unit_info: ModalArmyUnitInfo | null
  modal_row_info: ModalRowInfo | null
  modal_fast_planner_open: boolean
}

class Land extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props)
    this.state = { modal_unit_info: null, modal_terrain_info: null, modal_tactic_info: null, modal_army_unit_info: null, modal_fast_planner_open: false, modal_row_info: null }
  }


  closeModal = () => this.setState({ modal_unit_info: null, modal_terrain_info: null, modal_tactic_info: null, modal_army_unit_info: null, modal_fast_planner_open: false, modal_row_info: null })

  openUnitModal = (participant: ParticipantType, name: ArmyName, type: ArmyType, column: number, unit: UnitDefinition | undefined) => {
    if (unit)
      this.openArmyUnitModal(participant, name, type, column)
    else
      this.openUnitSelector(participant, name, type, column)
  }

  openUnitSelector = (participant: ParticipantType, name: ArmyName, type: ArmyType, index: number) => this.setState({ modal_unit_info: { participant, name, type, index } })

  openArmyUnitModal = (participant: ParticipantType, name: ArmyName, type: ArmyType, index: number) => this.setState({ modal_army_unit_info: { participant, name, type, index } })

  openTerrainModal = (index: number) => this.setState({ modal_terrain_info: { index, location: this.props.terrains.get(this.props.selected_terrains.get(index)!)!.location } })

  openTacticModal = (participant: ParticipantType) => this.setState({ modal_tactic_info: { participant } })

  openFastPlanner = () => this.setState({ modal_fast_planner_open: true })

  openRowModal = (participant: ParticipantType, name: ArmyName, type: RowType) => this.setState({ modal_row_info: { participant, name, type } })

  render() {
    return (
      <Container>
        <ModalUnitSelector
          info={this.state.modal_unit_info}
          onClose={this.closeModal}
        />
        <ModalRowTypeSelector
          info={this.state.modal_row_info}
          onClose={this.closeModal}
        />
        <ModalFastPlanner
          open={this.state.modal_fast_planner_open}
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
            <Grid.Column textAlign='center'>
              <Button primary size='large' onClick={this.openFastPlanner}>
                Create units
                </Button>
            </Grid.Column>
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
                this.renderArmy(ParticipantType.Attacker, this.props.attacker)
              }
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={1}>
            <Grid.Column>
              {
                this.renderArmy(ParticipantType.Defender, this.props.defender)
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
                    <Table.HeaderCell>
                      Army
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
                  {this.renderArmyInfo(ParticipantType.Attacker, this.props.attacker, this.props.tactics.get(this.props.defender.tactic)!)}
                  {this.renderArmyInfo(ParticipantType.Defender, this.props.defender, this.props.tactics.get(this.props.attacker.tactic)!)}
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
                    this.props.selected_terrains.map((terrain, index) => this.renderTerrain(this.props.terrains.get(terrain)!, index))
                  }
                </Table.Body>
              </Table>
            </Grid.Column>
          </Grid.Row>
          <Divider />
          <Grid.Row columns={1}>
            <Grid.Column>
              {
                this.renderReserve(ParticipantType.Attacker, this.props.attacker)
              }
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={1}>
            <Grid.Column>
              {
                this.renderReserve(ParticipantType.Defender, this.props.defender)
              }
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={1}>
            <Grid.Column>
              <Table celled unstackable>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>
                      Preferred unit types
                    </Table.HeaderCell>
                    <Table.HeaderCell>
                      {RowType.Front}
                    </Table.HeaderCell>
                    <Table.HeaderCell>
                      {RowType.Back}
                    </Table.HeaderCell>
                    <Table.HeaderCell>
                      {RowType.Flank}
                    </Table.HeaderCell>
                    <Table.HeaderCell>
                      Flank size
                    </Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {this.renderRowTypes(ParticipantType.Attacker, this.props.attacker.name, this.props.attacker.row_types, this.props.attacker.flank_size)}
                  {this.renderRowTypes(ParticipantType.Defender, this.props.defender.name, this.props.defender.row_types, this.props.defender.flank_size)}
                </Table.Body>
              </Table>
            </Grid.Column>
          </Grid.Row>
          <Divider />
          <Grid.Row columns={1}>
            <Grid.Column>
              {
                this.renderDefeatedArmy(ParticipantType.Attacker, this.props.attacker)
              }
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={1}>
            <Grid.Column>
              {
                this.renderDefeatedArmy(ParticipantType.Defender, this.props.defender)
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

  renderArmy = (type: ParticipantType, participant: Participant) => {
    return (
      <div key={type}>
        {type === ParticipantType.Attacker && <Header>{type + '\'s army'}</Header>}
        <UnitArmy
          onClick={(column, unit) => this.openUnitModal(type, participant.name, ArmyType.Main, column, unit)}
          units={this.mergeAllValues(participant.name, participant.army)}
          reverse={type === ParticipantType.Attacker}
          type={ArmyType.Main}
        />
        {type === ParticipantType.Defender && <Header>{type + '\'s army'}</Header>}
      </div>
    )
  }

  renderRoll = (type: ParticipantType, roll: number, is_random: boolean) => {
    return (
      <div key={type}>
        <Image src={IconDice} avatar />
        {is_random ? roll : <Input size='mini' style={{ width: 100 }} type='number' value={roll} onChange={(_, data) => this.props.setRoll(type, Number(data.value))} />}
      </div>
    )
  }

  renderIsRollRandom = (type: ParticipantType, is_random: boolean) => {
    return (
      <Checkbox toggle checked={is_random} onClick={() => this.props.toggleRandomRoll(type)} />
    )
  }

  renderReserve = (type: ParticipantType, participant: Participant) => {
    return (
      <div key={type}>
        <Header>{type + '\'s reserve'}</Header>
        <UnitArmy
          onClick={(column, unit) => this.openUnitModal(type, participant.name, ArmyType.Reserve, column, unit)}
          units={this.mergeAllValues(participant.name, participant.reserve)}
          reverse={false}
          type={ArmyType.Reserve}
        />
      </div>
    )
  }

  renderDefeatedArmy = (type: ParticipantType, participant: Participant) => {
    return (
      <div key={type}>
        <Header>{type + '\'s defeated units'}</Header>
        <UnitArmy
          onClick={(column, unit) => this.openUnitModal(type, participant.name, ArmyType.Defeated, column, unit)}
          units={this.mergeAllValues(participant.name, participant.defeated)}
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
          {calculateValue(terrain, TerrainCalc.Roll)}
        </Table.Cell>
      </Table.Row>
    )
  }

  renderTactic = (type: ParticipantType, participant: Participant, counter: TacticDefinition) => {
    const tactic = this.props.tactics.get(participant.tactic)
    return (
      <div key={type} onClick={() => this.openTacticModal(type)}>
        {<Image src={getImage(tactic)} avatar />}
        {(tactic && tactic.type) || 'None'}
        {' (' + this.toRelativePercent(calculateTactic(participant.army, tactic, counter), true) + ')'}
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

  renderArmyNameDropdown = (type: ParticipantType, name: ArmyName) => {
    return (
      <Dropdown
        text={name}
        selection
        value={name}
      >
        <Dropdown.Menu>
          {
            this.props.units.keySeq().map(key => (
              <Dropdown.Item value={key} text={key} key={key} active={name === key}
              onClick={() => this.props.setArmyName(type, key)}
              />
            ))
          }
        </Dropdown.Menu>
      </Dropdown>
    )
  }

  renderArmyInfo = (type: ParticipantType, participant: Participant, counter_tactic: TacticDefinition) => {
    return (
      <Table.Row key={type}>
        <Table.Cell collapsing>
          {type}
        </Table.Cell>
        <Table.Cell collapsing>
          {this.renderArmyNameDropdown(type, participant.name)}
        </Table.Cell>
        <Table.Cell collapsing>
          <Input size='mini' style={{ width: 100 }} type='number' value={participant.general} onChange={(_, data) => this.props.setGeneral(type, Number(data.value))} />
        </Table.Cell>
        <Table.Cell collapsing>
          {this.renderTactic(type, participant, counter_tactic)}
        </Table.Cell>
        <Table.Cell>
          {this.renderRoll(type, participant.roll, participant.randomize_roll)}
        </Table.Cell>
        <Table.Cell collapsing>
          {this.renderIsRollRandom(type, participant.randomize_roll)}
        </Table.Cell>
      </Table.Row>
    )
  }

  renderRowTypes = (type: ParticipantType, name: ArmyName, row_types: Map<RowType, UnitType>, flank_size: number) => {
    const units = this.props.units.get(name)!
    return (
      <Table.Row key={type}>
        <Table.Cell>
          {type}
        </Table.Cell>
        <Table.Cell selectable onClick={() => this.openRowModal(type, name, RowType.Front)}>
          <Image src={getImage(units.get(row_types.get(RowType.Front)!))} avatar />
        </Table.Cell>
        <Table.Cell selectable onClick={() => this.openRowModal(type, name, RowType.Back)}>
          <Image src={getImage(units.get(row_types.get(RowType.Back)!))} avatar />
        </Table.Cell>
        <Table.Cell selectable onClick={() => this.openRowModal(type, name, RowType.Flank)}>
          <Image src={getImage(units.get(row_types.get(RowType.Flank)!))} avatar />
        </Table.Cell>
        <Table.Cell collapsing>
          <Input size='mini' style={{ width: 100 }} type='number' value={flank_size} onChange={(_, data) => this.props.setFlankSize(type, Number(data.value))} />
        </Table.Cell>
      </Table.Row>
    )
  }

  mergeAllValues = (name: ArmyName, army: List<Unit | undefined>): List<UnitDefinition | undefined> => {
    return army.map(value => value && mergeValues(mergeValues(this.props.units.getIn([name, value.type]), value), this.props.global_stats.get(name)!))
  }
}

const mapStateToProps = (state: AppState) => ({
  attacker: state.land.attacker,
  defender: state.land.defender,
  is_undo: state.land.day > -1,
  round: state.land.day,
  selected_terrains: state.land.terrains,
  terrains: state.terrains.definitions,
  tactics: state.tactics.definitions,
  fight_over: state.land.fight_over,
  units: state.units.definitions,
  global_stats: state.global_stats
})

const mapDispatchToProps = (dispatch: any) => ({
  battle: (steps: number) => dispatch(battle(steps)),
  undo: (steps: number) => dispatch(undo(steps)),
  toggleRandomRoll: (participant: ParticipantType) => dispatch(toggleRandomRoll(participant)),
  setRoll: (participant: ParticipantType, roll: number) => dispatch(setRoll(participant, roll)),
  setGeneral: (participant: ParticipantType, skill: number) => dispatch(setGeneral(participant, skill)),
  setFlankSize: (participant: ParticipantType, size: number) => dispatch(setFlankSize(participant, size)),
  setArmyName: (participant: ParticipantType, name: ArmyName) => dispatch(setArmyName(participant, name))
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> { }

export default connect(mapStateToProps, mapDispatchToProps)(Land)
