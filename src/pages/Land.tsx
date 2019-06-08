import React, { Component } from 'react'
import { Map, List } from 'immutable'
import { Container, Header, Button, Grid, Image, Checkbox, Input, Table, Divider } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { AppState } from '../store/index'
import { ArmyName, UnitDefinition, ArmyType, Unit, UnitType } from '../store/units/types'
import UnitArmy from '../components/UnitArmy'
import { battle, undo, Participant, toggleRandomRoll, setRoll, setGeneral, RowType, setFlankSize } from '../store/land_battle'
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

  openUnitModal = (army: ArmyName, type: ArmyType, column: number, unit: UnitDefinition | undefined) => {
    if (unit)
      this.openArmyUnitModal(army, type, column, unit)
    else
      this.openUnitSelector(army, type, column, unit)
  }

  openUnitSelector = (army: ArmyName, type: ArmyType, index: number, unit: UnitDefinition | undefined) => this.setState({ modal_unit_info: { army, type, index, unit } })

  openArmyUnitModal = (army: ArmyName, type: ArmyType, index: number, unit: UnitDefinition) => this.setState({ modal_army_unit_info: { army, type, index, unit } })

  openTerrainModal = (index: number) => this.setState({ modal_terrain_info: { index, location: this.props.terrains.get(this.props.selected_terrains.get(index)!)!.location } })

  openTacticModal = (army: ArmyName) => this.setState({ modal_tactic_info: { army } })

  openFastPlanner = () => this.setState({ modal_fast_planner_open: true })

  openRowModal = (army: ArmyName, type: RowType) => this.setState({ modal_row_info: {army, type} })

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
                  {this.renderArmyInfo(ArmyName.Attacker, this.props.attacker, this.props.tactics.get(this.props.defender.tactic)!)}
                  {this.renderArmyInfo(ArmyName.Defender, this.props.defender, this.props.tactics.get(this.props.attacker.tactic)!)}
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
                  {this.renderRowTypes(ArmyName.Attacker, this.props.attacker.row_types, this.props.attacker.flank_size)}
                  {this.renderRowTypes(ArmyName.Defender, this.props.defender.row_types, this.props.defender.flank_size)}
                </Table.Body>
              </Table>
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

  renderArmy = (army: ArmyName, units: Participant) => {
    return (
      <div key={army}>
        {army === ArmyName.Attacker && <Header>{army + '\'s army'}</Header>}
        <UnitArmy
          onClick={(column, unit) => this.openUnitModal(army, ArmyType.Main, column, unit)}
          units={this.mergeAllValues(army, units.army)}
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

  renderReserve = (army: ArmyName, units: Participant) => {
    return (
      <div key={army}>
        <Header>{army + '\'s reserve'}</Header>
        <UnitArmy
          onClick={(column, unit) => this.openUnitModal(army, ArmyType.Reserve, column, unit)}
          units={this.mergeAllValues(army, units.reserve)}
          reverse={false}
          type={ArmyType.Reserve}
        />
      </div>
    )
  }

  renderDefeatedArmy = (army: ArmyName, units: Participant) => {
    return (
      <div key={army}>
        <Header>{army + '\'s defeated units'}</Header>
        <UnitArmy
          onClick={(column, unit) => this.openUnitModal(army, ArmyType.Defeated, column, unit)}
          units={this.mergeAllValues(army, units.defeated)}
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

  renderTactic = (army: ArmyName, info: Participant, counter: TacticDefinition) => {
    const tactic = this.props.tactics.get(info.tactic)
    return (
      <div key={army} onClick={() => this.openTacticModal(army)}>
        {<Image src={getImage(tactic)} avatar />}
        {(tactic && tactic.type) || 'None'}
        {' (' + this.toRelativePercent(calculateTactic(info.army, tactic, counter), true) + ')'}
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

  renderArmyInfo = (army_type: ArmyName, info: Participant, counter_tactic: TacticDefinition) => {
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

  renderRowTypes = (army_type: ArmyName, row_types: Map<RowType, UnitType>, flank_size: number) => {
    const units = this.props.units.get(army_type)!
    return (
      <Table.Row key={army_type}>
        <Table.Cell>
          {army_type}
        </Table.Cell>
        <Table.Cell selectable onClick={() => this.openRowModal(army_type, RowType.Front)}>
          <Image src={getImage(units.get(row_types.get(RowType.Front)!))} avatar />
        </Table.Cell>
        <Table.Cell selectable onClick={() => this.openRowModal(army_type, RowType.Back)}>
          <Image src={getImage(units.get(row_types.get(RowType.Back)!))} avatar />
        </Table.Cell>
        <Table.Cell selectable onClick={() => this.openRowModal(army_type, RowType.Flank)}>
          <Image src={getImage(units.get(row_types.get(RowType.Flank)!))} avatar />
        </Table.Cell>
        <Table.Cell collapsing>
          <Input size='mini' style={{ width: 100 }} type='number' value={flank_size} onChange={(_, data) => this.props.setFlankSize(army_type, Number(data.value))} />
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
  toggleRandomRoll: (army: ArmyName) => dispatch(toggleRandomRoll(army)),
  setRoll: (army: ArmyName, roll: number) => dispatch(setRoll(army, roll)),
  setGeneral: (army: ArmyName, skill: number) => dispatch(setGeneral(army, skill)),
  setFlankSize: (army: ArmyName, size: number) => dispatch(setFlankSize(army, size))
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> { }

export default connect(mapStateToProps, mapDispatchToProps)(Land)
