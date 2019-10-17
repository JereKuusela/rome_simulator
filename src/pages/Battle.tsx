import React, { Component } from 'react'
import { Container, Header, Button, Grid, Image, Checkbox, Input, Table, Divider } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { AppState } from '../store/index'
import { BaseUnit, UnitDefinition, UnitDefinitions } from '../store/units'
import UnitArmy from '../components/UnitArmy'
import TargetArrows from '../components/TargetArrows'
import { invalidate, invalidateCountry, ArmyType, undo, Participant, Side, toggleRandomRoll, setRoll, RowType, setFlankSize, selectArmy, selectUnit, RowTypes, BaseFrontLine, BaseReserve, BaseDefeated } from '../store/battle'
import { battle, setSeed, refreshBattle } from '../store/combat'
import { calculateTactic, calculateRollModifierFromTerrains, calculateRollModifierFromGenerals, calculateBaseDamage, calculateTotalRoll } from '../store/combat/combat'
import { TerrainDefinition, TerrainCalc } from '../store/terrains'
import { TacticType } from '../store/tactics'
import IconDice from '../images/chance.png'
import Dropdown from '../components/Utils/Dropdown'
import ModalUnitSelector, { ModalInfo as ModalUnitInfo } from '../containers/ModalUnitSelector'
import ModalRowTypeSelector, { ModalInfo as ModalRowInfo } from '../containers/ModalRowTypeSelector'
import ModalTerrainSelector, { ModalInfo as ModalTerrainInfo } from '../containers/ModalTerrainSelector'
import ModalTacticSelector, { ModalInfo as ModalTacticInfo } from '../containers/ModalTacticSelector'
import ModalArmyUnitDetail from '../containers/ModalArmyUnitDetail'
import ModalFastPlanner from '../containers/ModalFastPlanner'
import { calculateValue, mergeValues, getImage, Mode } from '../base_definition'
import { getSettings, getBattle, getArmy, Army, getParticipant } from '../store/utils'
import { addSign, toSignedPercent } from '../formatters'
import { CountryName, setGeneralMartial } from '../store/countries'
import { CombatParameter } from '../store/settings'
import IconTerrain from '../images/terrain.png'
import IconGeneral from '../images/military_power.png'
import StyledNumber from '../components/Utils/StyledNumber'
import { keys, resize } from '../utils'

interface IState {
  modal_unit_info: ModalUnitInfo | null
  modal_terrain_info: ModalTerrainInfo | null
  modal_tactic_info: ModalTacticInfo | null
  modal_army_unit_info: { country: CountryName, id: number, side: Side} | null
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

  isModalOpen = () => this.state.modal_unit_info  || this.state.modal_terrain_info || this.state.modal_tactic_info || this.state.modal_army_unit_info || this.state.modal_fast_planner_open || this.state.modal_row_info

  closeModal = (): void => this.setState({ modal_unit_info: null, modal_terrain_info: null, modal_tactic_info: null, modal_army_unit_info: null, modal_fast_planner_open: false, modal_row_info: null })

  openUnitModal = (side: Side, type: ArmyType, country: CountryName, column: number, unit: BaseUnit | null): void => {
    if (unit)
      this.openArmyUnitModal(side, country, unit as BaseUnit & UnitDefinition)
    else
      this.openUnitSelector(type, country, column)
  }

  openUnitSelector = (type: ArmyType, country: CountryName, index: number): void => this.setState({ modal_unit_info: { type, country, index } })

  openArmyUnitModal = (side: Side, country: CountryName, current_unit: BaseUnit & UnitDefinition): void => {
    this.setState({ modal_army_unit_info: { country, id: current_unit.id, side } })
  }

  openTerrainModal = (index: number): void => this.setState({ modal_terrain_info: { index, location: this.props.terrains[this.props.selected_terrains[index]].location } })

  openTacticModal = (country: CountryName, counter?: TacticType): void => this.setState({ modal_tactic_info: { country, counter } })

  openFastPlanner = (): void => this.setState({ modal_fast_planner_open: true })

  openRowModal = (country: CountryName, type: RowType): void => this.setState({ modal_row_info: { country, type } })

  render(): JSX.Element {
    if (this.props.outdated && !this.isModalOpen())
      this.props.refreshBattle(this.props.mode)
    const army_a = this.props.army_a
    const army_d = this.props.army_d
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
          country={this.state.modal_army_unit_info ? this.state.modal_army_unit_info.country : '' as CountryName}
          id={this.state.modal_army_unit_info ? this.state.modal_army_unit_info.id : -1}
          side={this.state.modal_army_unit_info ? this.state.modal_army_unit_info.side : Side.Attacker}
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
                this.renderFrontline(Side.Attacker, army_a)
              }
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={1} style={{ padding: 0 }}>
            <Grid.Column>
              <TargetArrows
                visible={!this.props.fight_over}
                attacker={army_a.frontline}
                defender={army_d.frontline}
                attacker_color={ATTACKER_COLOR}
                defender_color={DEFENDER_COLOR}
              />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={1}>
            <Grid.Column>
              {
                this.renderFrontline(Side.Defender, army_d)
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
                      Country
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
                  {this.renderArmyInfo(Side.Attacker, this.props.attacker, army_a, army_d)}
                  {this.renderArmyInfo(Side.Defender, this.props.defender, army_d, army_a)}
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
                    this.props.selected_terrains.map((terrain, index) => this.renderTerrain(this.props.terrains[terrain], index))
                  }
                </Table.Body>
              </Table>
            </Grid.Column>
          </Grid.Row>
          <Divider />
          <Grid.Row columns={1}>
            <Grid.Column>
              {
                this.renderReserve(Side.Attacker, army_a)
              }
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={1}>
            <Grid.Column>
              {
                this.renderReserve(Side.Defender, army_d)
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
                  {this.renderRowTypes(Side.Attacker, army_a)}
                  {this.renderRowTypes(Side.Defender, army_d)}
                </Table.Body>
              </Table>
            </Grid.Column>
          </Grid.Row>
          <Divider />
          <Grid.Row columns={1}>
            <Grid.Column>
              {
                this.renderDefeatedArmy(Side.Attacker, army_a)
              }
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={1}>
            <Grid.Column>
              {
                this.renderDefeatedArmy(Side.Defender, army_d)
              }
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            {
              this.renderSeed()
            }
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

  renderFrontline = (side: Side, participant: Army): JSX.Element => {
    const country = participant.name
    const combat_width = this.props.combat[CombatParameter.CombatWidth]
    return (
      <div key={side}>
        {side === Side.Attacker && <Header>{side + '\'s frontline'}</Header>}
        <UnitArmy
          color={side === Side.Attacker ? ATTACKER_COLOR : DEFENDER_COLOR}
          side={side}
          onClick={(column, unit) => this.openUnitModal(side, ArmyType.Frontline, country, column, unit)}
          onRemove={column => this.props.removeUnit(this.props.mode, country, ArmyType.Frontline, column)}
          units={resize(this.mergeAllValues(country, participant.frontline), combat_width, null)}
          row_width={Math.max(30, combat_width)}
          reverse={side === Side.Attacker}
          type={ArmyType.Frontline}
          disable_add={this.props.round > -1}
        />
        {side === Side.Defender && <Header>{side + '\'s frontline'}</Header>}
      </div>
    )
  }

  renderRoll = (side: Side, roll: number, is_random: boolean, general: number, opposing_general: number): JSX.Element => {
    const terrain_effect = side === Side.Attacker ? calculateRollModifierFromTerrains(this.props.selected_terrains.map(value => this.props.terrains[value])) : 0
    const general_effect = calculateRollModifierFromGenerals(general, opposing_general)
    const total = calculateTotalRoll(roll, side === Side.Attacker ? this.props.selected_terrains.map(value => this.props.terrains[value]) : [], general, opposing_general)
    const base_damage = calculateBaseDamage(total, this.props.combat)
    return (
      <div key={side}>
        {base_damage.toFixed(2)} :
        <span style={{ paddingLeft: '1em' }} /><Image src={IconDice} avatar />
        {is_random ? roll : <Input size='mini' style={{ width: 100 }} type='number' value={roll} onChange={(_, data) => this.props.setRoll(this.props.mode, side, Number(data.value))} />}
        {general_effect !== 0 ?
          <span style={{ paddingLeft: '1em' }}>
            <Image src={IconGeneral} avatar />
            <StyledNumber value={general_effect} formatter={addSign} />
          </span>
          : null}
        {terrain_effect !== 0 ?
          <span style={{ paddingLeft: '1em' }}>
            <Image src={IconTerrain} avatar />
            <StyledNumber value={terrain_effect} formatter={addSign} />
          </span>
          : null}
      </div>
    )
  }

  renderIsRollRandom = (side: Side, is_random: boolean): JSX.Element => {
    return (
      <Checkbox toggle checked={is_random} onClick={() => this.props.toggleRandomRoll(this.props.mode, side)} />
    )
  }

  renderReserve = (side: Side, participant: Army): JSX.Element => {
    const country = participant.name
    const units = this.mergeAllValues(country, participant.reserve)
    // + 1 ensures that the user can always select an empty space.
    // ceil ensures full rows for a cleaner UI.
    const size = Math.ceil((units.length + 1) / 30.0) * 30
    return (
      <div key={side}>
        <Header>{side + '\'s reserve'}</Header>
        <UnitArmy
          color={side === Side.Attacker ? ATTACKER_COLOR : DEFENDER_COLOR}
          side={side}
          onClick={(column, unit) => this.openUnitModal(side, ArmyType.Reserve, country, column, unit)}
          onRemove={column => this.props.removeUnit(this.props.mode, country, ArmyType.Reserve, column)}
          units={resize(units, size, null)}
          row_width={30}
          reverse={false}
          type={ArmyType.Reserve}
        />
      </div>
    )
  }

  renderDefeatedArmy = (side: Side, participant: Army): JSX.Element => {
    const country = participant.name
    const units = this.mergeAllValues(country, participant.defeated)
    // + 1 ensures that the user can always select an empty space.
    // ceil ensures full rows for a cleaner UI.
    const size = Math.ceil((units.length + 1) / 30.0) * 30
    return (
      <div key={side}>
        <Header>{side + '\'s defeated units'}</Header>
        <UnitArmy
          color={side === Side.Attacker ? ATTACKER_COLOR : DEFENDER_COLOR}
          side={side}
          onClick={(column, unit) => this.openUnitModal(side, ArmyType.Defeated, country, column, unit)}
          onRemove={column => this.props.removeUnit(this.props.mode, country, ArmyType.Defeated, column)}
          units={resize(units, size, null)}
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
          {calculateValue(terrain, TerrainCalc.Roll) ?
            <StyledNumber value={calculateValue(terrain, TerrainCalc.Roll)} formatter={addSign} />
            : 0
          }
        </Table.Cell>
      </Table.Row>
    )
  }

  renderTactic = (army: Army, counter?: TacticType): JSX.Element => {
    const country = army.name
    const tactic = this.props.tactics[army.tactic]
    const units = {
      frontline: this.mergeAllValues(country, army.frontline),
      reserve: this.mergeAllValues(country, army.reserve) as BaseReserve,
      defeated: this.mergeAllValues(country, army.defeated) as BaseDefeated
    }
    return (
      <div key={country} onClick={() => this.openTacticModal(country, counter)}>
        {<Image src={getImage(tactic)} avatar />}
        {(tactic && tactic.type) || 'None'}
        {' ('}
        <StyledNumber
          value={calculateTactic(units, tactic, counter)}
          formatter={toSignedPercent}
        />
        {')'}
      </div >
    )
  }

  renderArmyInfo = (side: Side, participant: Participant, army: Army, enemy: Army): JSX.Element => {
    const name = army.name
    return (
      <Table.Row key={side}>
        <Table.Cell collapsing>
          {side}
        </Table.Cell>
        <Table.Cell collapsing>
          <Dropdown
            values={keys(this.props.armies)}
            value={name}
            onChange={name => this.props.selectArmy(this.props.mode, side, name)}
          />
        </Table.Cell>
        <Table.Cell collapsing>
          <Input disabled={!army.has_general} size='mini' style={{ width: 100 }} type='number' value={army.general.base} onChange={(_, { value }) => this.props.setGeneralMartial(name, Number(value))} />
          {' '}<StyledNumber value={army.general.trait} formatter={addSign} />
        </Table.Cell>
        <Table.Cell collapsing>
          {this.renderTactic(army, enemy.tactic)}
        </Table.Cell>
        <Table.Cell>
          {this.renderRoll(side, participant.roll, participant.randomize_roll, army.general.total, enemy.general.total)}
        </Table.Cell>
        <Table.Cell collapsing>
          {this.renderIsRollRandom(side, participant.randomize_roll)}
        </Table.Cell>
      </Table.Row>
    )
  }

  renderCell = (country: CountryName, type: RowType, types: RowTypes, units: UnitDefinitions): JSX.Element => {
    const unit = types[type]
    return (
      <Table.Cell selectable onClick={() => this.openRowModal(country, type)}>
        <Image src={getImage(unit && units[unit])} avatar />
      </Table.Cell>
    )
  }

  renderRowTypes = (type: Side, army: Army): JSX.Element => {
    const country = army.name
    const units = this.props.units[country]
    const row_types = army.row_types
    return (
      <Table.Row key={type}>
        <Table.Cell>
          {type}
        </Table.Cell>
        {this.renderCell(country, RowType.Front, row_types, units)}
        {this.renderCell(country, RowType.Back, row_types, units)}
        {this.renderCell(country, RowType.Flank, row_types, units)}
        <Table.Cell collapsing>
          <Input size='mini' style={{ width: 100 }} type='number' value={army && army.flank_size} onChange={(_, data) => this.props.setFlankSize(this.props.mode, country, Number(data.value))} />
        </Table.Cell>
      </Table.Row>
    )
  }

  renderSeed = (): JSX.Element => {
    return (
      <Grid.Column>
        <Input type='number' value={this.props.seed} label='Seed for random generator' onChange={(_, { value }) => this.setSeed(value)} />
      </Grid.Column>
    )
  }

  setSeed = (value: string): void => {
    if (value === '')
      this.props.setSeed(this.props.mode, undefined)
    if (!isNaN(Number(value)))
      this.props.setSeed(this.props.mode, Number(value))
  }

  mergeAllValues = (name: CountryName, army: BaseFrontLine): BaseFrontLine => {
    return army.map(value => value && mergeValues(mergeValues(this.props.units[name][value.type], value), this.props.global_stats[name][this.props.mode]))
  }
}

const mapStateToProps = (state: AppState) => ({
  army_a: getArmy(state, Side.Attacker),
  army_d: getArmy(state, Side.Defender),
  attacker: getParticipant(state, Side.Attacker),
  defender: getParticipant(state, Side.Defender),
  armies: getBattle(state).armies,
  is_undo: getBattle(state).round > -1,
  round: getBattle(state).round,
  seed: getBattle(state).seed,
  outdated: getBattle(state).outdated,
  selected_terrains: getBattle(state).terrains,
  terrains: state.terrains,
  tactics: state.tactics,
  fight_over: getBattle(state).fight_over,
  units: state.units,
  global_stats: state.global_stats,
  combat: getSettings(state),
  mode: state.settings.mode,
  countries: state.countries
})

const mapDispatchToProps = (dispatch: any) => ({
  battle: (mode: Mode, steps: number) => dispatch(battle(mode, steps)),
  undo: (mode: Mode, steps: number) => dispatch(undo(mode, steps)),
  toggleRandomRoll: (mode: Mode, participant: Side) => dispatch(toggleRandomRoll(mode, participant)),
  setRoll: (mode: Mode, participant: Side, roll: number) => dispatch(setRoll(mode, participant, roll)),
  setGeneralMartial: (name: CountryName, skill: number) => dispatch(setGeneralMartial(name, skill)) && dispatch(invalidateCountry(name)),
  setFlankSize: (mode: Mode, name: CountryName, size: number) => dispatch(setFlankSize(mode, name, size)) && dispatch(invalidate(mode)),
  selectArmy: (mode: Mode, type: Side, name: CountryName) => dispatch(selectArmy(mode, type, name)) && dispatch(invalidate(mode)),
  removeUnit: (mode: Mode, name: CountryName, type: ArmyType, column: number) => (
    dispatch(selectUnit(mode, name, type, column, null))
  ),
  setSeed: (mode: Mode, seed?: number) => dispatch(setSeed(mode, seed)) && dispatch(invalidate(mode)),
  refreshBattle: (mode: Mode) => dispatch(refreshBattle(mode))
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> { }

export default connect(mapStateToProps, mapDispatchToProps)(Battle)
