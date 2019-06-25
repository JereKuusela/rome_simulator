import React, { Component } from 'react'
import { List } from 'immutable'
import { Container, Header, Button, Grid, Image, Checkbox, Input, Table, Divider, Dropdown } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { AppState } from '../store/index'
import { ArmyName, UnitDefinition, ArmyType, Unit } from '../store/units'
import UnitArmy from '../components/UnitArmy'
import TargetArrows from '../components/TargetArrows'
import { battle, undo, Participant, ParticipantType, toggleRandomRoll, setRoll, setGeneral, RowType, setFlankSize, selectArmy, selectUnit } from '../store/battle'
import { calculateTactic, calculateRollModifierFromTerrains, calculateRollModifierFromGenerals, calculateBaseDamage } from '../store/combat/combat'
import { TerrainDefinition, TerrainCalc } from '../store/terrains'
import { TacticType } from '../store/tactics'
import IconDice from '../images/chance.png'
import ModalUnitSelector, { ModalInfo as ModalUnitInfo } from '../containers/ModalUnitSelector'
import ModalRowTypeSelector, { ModalInfo as ModalRowInfo } from '../containers/ModalRowTypeSelector'
import ModalTerrainSelector, { ModalInfo as ModalTerrainInfo } from '../containers/ModalTerrainSelector'
import ModalTacticSelector, { ModalInfo as ModalTacticInfo } from '../containers/ModalTacticSelector'
import ModalArmyUnitDetail, { ModalInfo as ModalArmyUnitInfo } from '../containers/ModalArmyUnitDetail'
import ModalFastPlanner from '../containers/ModalFastPlanner'
import { calculateValue, mergeValues, getImage, toRelativePercent, DefinitionType } from '../base_definition'
import { mergeSettings, getBattle } from '../utils'
import { CombatParameter } from '../store/settings'
import IconTerrain from '../images/terrain.png'
import IconGeneral from '../images/military_power.png'

interface IState {
  modal_unit_info: ModalUnitInfo | null
  modal_terrain_info: ModalTerrainInfo | null
  modal_tactic_info: ModalTacticInfo | null
  modal_army_unit_info: ModalArmyUnitInfo | null
  modal_row_info: ModalRowInfo | null
  modal_fast_planner_open: boolean
}

const ATTACKER_COLOR = '#FFAA00AA'
const DEFENDER_COLOR = '#00AAFFAA'

class Battle extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props)
    this.state = { modal_unit_info: null, modal_terrain_info: null, modal_tactic_info: null, modal_army_unit_info: null, modal_fast_planner_open: false, modal_row_info: null }
  }


  closeModal = (): void => this.setState({ modal_unit_info: null, modal_terrain_info: null, modal_tactic_info: null, modal_army_unit_info: null, modal_fast_planner_open: false, modal_row_info: null })

  openUnitModal = (name: ArmyName, type: ArmyType, column: number, unit: Unit | undefined): void => {
    if (unit)
      this.openArmyUnitModal(name, type, column)
    else
      this.openUnitSelector(name, type, column)
  }

  openUnitSelector = (name: ArmyName, type: ArmyType, index: number): void => this.setState({ modal_unit_info: { name, type, index } })

  openArmyUnitModal = (name: ArmyName, type: ArmyType, index: number): void => this.setState({ modal_army_unit_info: { name, type, index } })

  openTerrainModal = (index: number): void => this.setState({ modal_terrain_info: { index, location: this.props.terrains.get(this.props.selected_terrains.get(index)!)!.location } })

  openTacticModal = (name: ArmyName, counter?: TacticType): void => this.setState({ modal_tactic_info: { name, counter } })

  openFastPlanner = (): void => this.setState({ modal_fast_planner_open: true })

  openRowModal = (name: ArmyName, type: RowType): void => this.setState({ modal_row_info: { name, type } })

  render(): JSX.Element {
    const attacker = this.props.armies.get(this.props.attacker)
    const defender = this.props.armies.get(this.props.defender)
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
                Create and remove units
              </Button>
            </Grid.Column>
            <Grid.Column floated='right' textAlign='right'>
              <Button circular icon='angle double left' color='black' size='huge' disabled={!this.props.is_undo} onClick={() => this.props.undo(this.props.mode, 10)} />
              <Button circular icon='angle left' color='black' size='huge' disabled={!this.props.is_undo} onClick={() => this.props.undo(this.props.mode, 1)} />
              <Button circular icon='angle right' color='black' size='huge' disabled={this.props.fight_over} onClick={() => this.props.battle(this.props.mode, 1)} />
              <Button circular icon='angle double right' color='black' size='huge' disabled={this.props.fight_over} onClick={() => this.props.battle(this.props.mode, 10)} />
            </Grid.Column>

          </Grid.Row>
          <Grid.Row columns={1}>
            <Grid.Column>
              {
                this.renderArmy(ParticipantType.Attacker, this.props.attacker, attacker)
              }
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={1} style={{padding: 0}}>
            <Grid.Column>
              <TargetArrows
                attacker={this.props.fight_over ? undefined : attacker && attacker.frontline}
                defender={this.props.fight_over ? undefined : defender && defender.frontline}
                attacker_color={ATTACKER_COLOR}
                defender_color={DEFENDER_COLOR}
              />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={1}>
            <Grid.Column>
              {
                this.renderArmy(ParticipantType.Defender, this.props.defender, defender)
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
                      Base damage
                    </Table.HeaderCell>
                    <Table.HeaderCell>
                      Randomize
                    </Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {this.renderArmyInfo(ParticipantType.Attacker, this.props.attacker, attacker, defender)}
                  {this.renderArmyInfo(ParticipantType.Defender, this.props.defender, defender, attacker)}
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
                this.renderReserve(ParticipantType.Attacker, this.props.attacker, attacker)
              }
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={1}>
            <Grid.Column>
              {
                this.renderReserve(ParticipantType.Defender, this.props.defender, defender)
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
                  {this.renderRowTypes(ParticipantType.Attacker, this.props.attacker, attacker)}
                  {this.renderRowTypes(ParticipantType.Defender, this.props.defender, defender)}
                </Table.Body>
              </Table>
            </Grid.Column>
          </Grid.Row>
          <Divider />
          <Grid.Row columns={1}>
            <Grid.Column>
              {
                this.renderDefeatedArmy(ParticipantType.Attacker, this.props.attacker, attacker)
              }
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={1}>
            <Grid.Column>
              {
                this.renderDefeatedArmy(ParticipantType.Defender, this.props.defender, defender)
              }
            </Grid.Column>
          </Grid.Row>
        </Grid >
      </Container >
    )
  }

  roundName = (round: number): string => {
    if (round < 0)
      return 'Before combat'
    return String(round)
  }

  renderArmy = (type: ParticipantType, name: ArmyName, participant?: Participant): JSX.Element => {
    const combat_width = this.props.combat.get(CombatParameter.CombatWidth, 30)
    return (
      <div key={type}>
        {type === ParticipantType.Attacker && <Header>{type + '\'s army'}</Header>}
        <UnitArmy
          color={type === ParticipantType.Attacker ? ATTACKER_COLOR : DEFENDER_COLOR}
          side={type}
          onClick={(column, unit) => this.openUnitModal(name, ArmyType.Frontline, column, unit)}
          onRemove={column => this.props.removeUnit(this.props.mode, name, ArmyType.Frontline, column)}
          units={participant && this.mergeAllValues(name, participant.frontline).setSize(combat_width)}
          row_width={Math.max(30, combat_width)}
          reverse={type === ParticipantType.Attacker}
          type={ArmyType.Frontline}
        />
        {type === ParticipantType.Defender && <Header>{type + '\'s army'}</Header>}
      </div>
    )
  }

  renderRoll = (type: ParticipantType, name: ArmyName, roll: number, is_random: boolean, general: number, opposing_general: number): JSX.Element => {
    const terrain_effect = type === ParticipantType.Attacker ? calculateRollModifierFromTerrains(this.props.selected_terrains.map(value => this.props.terrains.get(value))) : 0
    const general_effect = calculateRollModifierFromGenerals(general, opposing_general)
    const total = terrain_effect + general_effect + roll
    const base_damage = calculateBaseDamage(total, this.props.combat)
    return (
      <div key={name}>
        {base_damage.toFixed(2)} :
        <span style={{ paddingLeft: '1em' }} /><Image src={IconDice} avatar />
        {is_random ? roll : <Input size='mini' style={{ width: 100 }} type='number' value={roll} onChange={(_, data) => this.props.setRoll(this.props.mode, name, Number(data.value))} />}
        {general_effect !== 0 ? <span style={{ paddingLeft: '1em' }}><Image src={IconGeneral} avatar />{general_effect}</span> : null}
        {terrain_effect !== 0 ? <span style={{ paddingLeft: '1em' }}><Image src={IconTerrain} avatar />{terrain_effect}</span> : null}
      </div>
    )
  }

  renderIsRollRandom = (name: ArmyName, is_random: boolean): JSX.Element => {
    return (
      <Checkbox toggle checked={is_random} onClick={() => this.props.toggleRandomRoll(this.props.mode, name)} />
    )
  }

  renderReserve = (type: ParticipantType, name: ArmyName, participant?: Participant): JSX.Element => {
    const units = participant && this.mergeAllValues(name, participant.reserve)
    // + 1 ensures that the user can always select an empty space.
    // ceil ensures full rows for a cleaner UI.
    const size = units && Math.ceil((units.size + 1) / 30.0) * 30
    return (
      <div key={type}>
        <Header>{type + '\'s reserve'}</Header>
        <UnitArmy
          color={type === ParticipantType.Attacker ? ATTACKER_COLOR : DEFENDER_COLOR}
          side={type}
          onClick={(column, unit) => this.openUnitModal(name, ArmyType.Reserve, column, unit)}
          onRemove={column => this.props.removeUnit(this.props.mode, name, ArmyType.Reserve, column)}
          units={units && units.setSize(size || 0)}
          row_width={30}
          reverse={false}
          type={ArmyType.Reserve}
        />
      </div>
    )
  }

  renderDefeatedArmy = (type: ParticipantType, name: ArmyName, participant?: Participant): JSX.Element => {
    const units = participant && this.mergeAllValues(name, participant.defeated)
    // + 1 ensures that the user can always select an empty space.
    // ceil ensures full rows for a cleaner UI.
    const size = units && Math.ceil((units.size + 1) / 30.0) * 30
    return (
      <div key={type}>
        <Header>{type + '\'s defeated units'}</Header>
        <UnitArmy
          color={type === ParticipantType.Attacker ? ATTACKER_COLOR : DEFENDER_COLOR}
          side={type}
          onClick={(column, unit) => this.openUnitModal(name, ArmyType.Defeated, column, unit)}
          onRemove={column => this.props.removeUnit(this.props.mode, name, ArmyType.Defeated, column)}
          units={units && units.setSize(size || 0)}
          row_width={30}
          reverse={false}
          type={ArmyType.Defeated}
        />
      </div>
    )
  }

  renderTerrain = (terrain: TerrainDefinition, index: number): JSX.Element => {
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

  renderTactic = (name: ArmyName, participant?: Participant, counter?: TacticType): JSX.Element => {
    const tactic = participant && this.props.tactics.get(participant.tactic)
    return (
      <div key={name} onClick={() => this.openTacticModal(name, counter)}>
        {<Image src={getImage(tactic)} avatar />}
        {(tactic && tactic.type) || 'None'}
        {participant && ' (' + toRelativePercent(calculateTactic(participant.frontline, tactic, counter), true) + ')'}
      </div >
    )
  }

  renderArmyNameDropdown = (type: ParticipantType, name: ArmyName): JSX.Element => {
    return (
      <Dropdown
        text={name}
        selection
        value={name}
      >
        <Dropdown.Menu>
          {
            this.props.armies.keySeq().map(key => (
              <Dropdown.Item value={key} text={key} key={key} active={name === key}
                onClick={() => this.props.selectArmy(this.props.mode, type, key)}
              />
            ))
          }
        </Dropdown.Menu>
      </Dropdown>
    )
  }

  renderArmyInfo = (type: ParticipantType, name: ArmyName, participant?: Participant, enemy?: Participant): JSX.Element => {
    return (
      <Table.Row key={type}>
        <Table.Cell collapsing>
          {type}
        </Table.Cell>
        <Table.Cell collapsing>
          {this.renderArmyNameDropdown(type, name)}
        </Table.Cell>
        <Table.Cell collapsing>
          <Input size='mini' style={{ width: 100 }} type='number' value={participant && participant.general} onChange={(_, data) => this.props.setGeneral(this.props.mode, name, Number(data.value))} />
        </Table.Cell>
        <Table.Cell collapsing>
          {this.renderTactic(name, participant, enemy && enemy.tactic)}
        </Table.Cell>
        <Table.Cell>
          {this.renderRoll(type, name, participant ? participant.roll : 0, participant ? participant.randomize_roll : true, participant ? participant.general : 0, enemy ? enemy.general : 0)}
        </Table.Cell>
        <Table.Cell collapsing>
          {this.renderIsRollRandom(name, participant ? participant.randomize_roll : true)}
        </Table.Cell>
      </Table.Row>
    )
  }

  renderRowTypes = (type: ParticipantType, name: ArmyName, participant?: Participant): JSX.Element => {
    const units = this.props.units.get(name)
    const row_types = participant && participant.row_types
    return (
      <Table.Row key={type}>
        <Table.Cell>
          {type}
        </Table.Cell>
        <Table.Cell selectable onClick={() => this.openRowModal(name, RowType.Front)}>
          <Image src={getImage(units && row_types && units.get(row_types.get(RowType.Front)!))} avatar />
        </Table.Cell>
        <Table.Cell selectable onClick={() => this.openRowModal(name, RowType.Back)}>
          <Image src={getImage(units && row_types && units.get(row_types.get(RowType.Back)!))} avatar />
        </Table.Cell>
        <Table.Cell selectable onClick={() => this.openRowModal(name, RowType.Flank)}>
          <Image src={getImage(units && row_types && units.get(row_types.get(RowType.Flank)!))} avatar />
        </Table.Cell>
        <Table.Cell collapsing>
          <Input size='mini' style={{ width: 100 }} type='number' value={participant && participant.flank_size} onChange={(_, data) => this.props.setFlankSize(this.props.mode, name, Number(data.value))} />
        </Table.Cell>
      </Table.Row>
    )
  }

  mergeAllValues = (name: ArmyName, army: List<Unit | undefined>): List<UnitDefinition | undefined> => {
    return army.map(value => value && mergeValues(mergeValues(this.props.units.getIn([name, value.type]), value), this.props.global_stats.getIn([name, this.props.mode])))
  }
}

const mapStateToProps = (state: AppState) => ({
  attacker: getBattle(state).attacker,
  defender: getBattle(state).defender,
  armies: getBattle(state).armies,
  is_undo: getBattle(state).round > -1,
  round: getBattle(state).round,
  selected_terrains: getBattle(state).terrains,
  terrains: state.terrains.definitions,
  tactics: state.tactics.definitions,
  fight_over: getBattle(state).fight_over,
  units: state.units.definitions,
  global_stats: state.global_stats,
  combat: mergeSettings(state),
  mode: state.settings.mode
})

const mapDispatchToProps = (dispatch: any) => ({
  battle: (mode: DefinitionType, steps: number) => dispatch(battle(mode, steps)),
  undo: (mode: DefinitionType, steps: number) => dispatch(undo(mode, steps)),
  toggleRandomRoll: (mode: DefinitionType, name: ArmyName) => dispatch(toggleRandomRoll(mode, name)),
  setRoll: (mode: DefinitionType, name: ArmyName, roll: number) => dispatch(setRoll(mode, name, roll)),
  setGeneral: (mode: DefinitionType, name: ArmyName, skill: number) => dispatch(setGeneral(mode, name, skill)),
  setFlankSize: (mode: DefinitionType, name: ArmyName, size: number) => dispatch(setFlankSize(mode, name, size)),
  selectArmy: (mode: DefinitionType, type: ParticipantType, name: ArmyName) => dispatch(selectArmy(mode, type, name)),
  removeUnit: (mode: DefinitionType, name: ArmyName, type: ArmyType, column: number) => (
    dispatch(selectUnit(mode, name, type, column, undefined))
  )
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> { }

export default connect(mapStateToProps, mapDispatchToProps)(Battle)
