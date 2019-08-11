import React, { Component } from 'react'
import { List } from 'immutable'
import { Container, Header, Button, Grid, Image, Checkbox, Input, Table, Divider } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { AppState } from '../store/index'
import { BaseUnit, UnitDefinition } from '../store/units'
import UnitArmy from '../components/UnitArmy'
import TargetArrows from '../components/TargetArrows'
import { invalidate, invalidateCountry, ArmyType, battle, undo, Participant, Side, toggleRandomRoll, setRoll, RowType, setFlankSize, selectArmy, selectUnit, setSeed, refreshBattle } from '../store/battle'
import { calculateTactic, calculateRollModifierFromTerrains, calculateRollModifierFromGenerals, calculateBaseDamage } from '../store/combat/combat'
import { TerrainDefinition, TerrainCalc } from '../store/terrains'
import { TacticType } from '../store/tactics'
import IconDice from '../images/chance.png'
import DropdownSelector from '../components/DropdownSelector'
import ModalUnitSelector, { ModalInfo as ModalUnitInfo } from '../containers/ModalUnitSelector'
import ModalRowTypeSelector, { ModalInfo as ModalRowInfo } from '../containers/ModalRowTypeSelector'
import ModalTerrainSelector, { ModalInfo as ModalTerrainInfo } from '../containers/ModalTerrainSelector'
import ModalTacticSelector, { ModalInfo as ModalTacticInfo } from '../containers/ModalTacticSelector'
import ModalArmyUnitDetail, { ModalInfo as ModalArmyUnitInfo } from '../containers/ModalArmyUnitDetail'
import ModalFastPlanner from '../containers/ModalFastPlanner'
import { calculateValue, mergeValues, getImage, DefinitionType } from '../base_definition'
import { mergeSettings, getBattle, getArmy, Army, getParticipant } from '../store/utils'
import { addSign, toSignedPercent } from '../formatters'
import { CountryName, setGeneralMartial } from '../store/countries'
import { CombatParameter } from '../store/settings'
import IconTerrain from '../images/terrain.png'
import IconGeneral from '../images/military_power.png'
import StyledNumber from '../components/StyledNumber'
import { findUnitById } from '../utils'

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

  openUnitModal = (name: CountryName, type: ArmyType, country: CountryName, column: number, unit: BaseUnit | undefined): void => {
    if (unit)
      this.openArmyUnitModal(country, unit as BaseUnit & UnitDefinition)
    else
      this.openUnitSelector(name, type, country, column)
  }

  openUnitSelector = (name: CountryName, type: ArmyType, country: CountryName, index: number): void => this.setState({ modal_unit_info: { name, type, country, index } })

  openArmyUnitModal = (country: CountryName, current_unit: BaseUnit & UnitDefinition): void => {
    const base_unit = findUnitById(this.props.armies.get(country), current_unit.id)
    if (base_unit)
      this.setState({ modal_army_unit_info: { country, unit: current_unit, base_unit } })
  }

  openTerrainModal = (index: number): void => this.setState({ modal_terrain_info: { index, location: this.props.terrains.get(this.props.selected_terrains.get(index)!)!.location } })

  openTacticModal = (name: CountryName, counter?: TacticType): void => this.setState({ modal_tactic_info: { country: name, counter } })

  openFastPlanner = (): void => this.setState({ modal_fast_planner_open: true })

  openRowModal = (name: CountryName, country: CountryName, type: RowType): void => this.setState({ modal_row_info: { name, country, type } })

  render(): JSX.Element {
    if (this.props.outdated)
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
                this.renderArmy(Side.Attacker, army_a)
              }
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={1} style={{ padding: 0 }}>
            <Grid.Column>
              <TargetArrows
                attacker={this.props.fight_over ? undefined : army_a.frontline}
                defender={this.props.fight_over ? undefined : army_d.frontline}
                attacker_color={ATTACKER_COLOR}
                defender_color={DEFENDER_COLOR}
              />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={1}>
            <Grid.Column>
              {
                this.renderArmy(Side.Defender, army_d)
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

  renderArmy = (type: Side, participant: Army): JSX.Element => {
    const country = participant.name
    const combat_width = this.props.combat.get(CombatParameter.CombatWidth, 30)
    return (
      <div key={type}>
        {type === Side.Attacker && <Header>{type + '\'s frontline'}</Header>}
        <UnitArmy
          color={type === Side.Attacker ? ATTACKER_COLOR : DEFENDER_COLOR}
          side={type}
          onClick={(column, unit) => this.openUnitModal(country, ArmyType.Frontline, country, column, unit)}
          onRemove={column => this.props.removeUnit(this.props.mode, country, ArmyType.Frontline, column)}
          units={this.mergeAllValues(country, participant.frontline).setSize(combat_width)}
          row_width={Math.max(30, combat_width)}
          reverse={type === Side.Attacker}
          type={ArmyType.Frontline}
          disable_add={this.props.round > -1}
        />
        {type === Side.Defender && <Header>{type + '\'s frontline'}</Header>}
      </div>
    )
  }

  renderRoll = (type: Side, roll: number, is_random: boolean, general: number, opposing_general: number): JSX.Element => {
    const terrain_effect = type === Side.Attacker ? calculateRollModifierFromTerrains(this.props.selected_terrains.map(value => this.props.terrains.get(value))) : 0
    const general_effect = calculateRollModifierFromGenerals(general, opposing_general)
    const total = terrain_effect + general_effect + roll
    const base_damage = calculateBaseDamage(total, this.props.combat)
    return (
      <div key={type}>
        {base_damage.toFixed(2)} :
        <span style={{ paddingLeft: '1em' }} /><Image src={IconDice} avatar />
        {is_random ? roll : <Input size='mini' style={{ width: 100 }} type='number' value={roll} onChange={(_, data) => this.props.setRoll(this.props.mode, type, Number(data.value))} />}
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

  renderIsRollRandom = (type: Side, is_random: boolean): JSX.Element => {
    return (
      <Checkbox toggle checked={is_random} onClick={() => this.props.toggleRandomRoll(this.props.mode, type)} />
    )
  }

  renderReserve = (type: Side, participant: Army): JSX.Element => {
    const country = participant.name
    const units = this.mergeAllValues(country, participant.reserve)
    // + 1 ensures that the user can always select an empty space.
    // ceil ensures full rows for a cleaner UI.
    const size = Math.ceil((units.size + 1) / 30.0) * 30
    return (
      <div key={type}>
        <Header>{type + '\'s reserve'}</Header>
        <UnitArmy
          color={type === Side.Attacker ? ATTACKER_COLOR : DEFENDER_COLOR}
          side={type}
          onClick={(column, unit) => this.openUnitModal(country, ArmyType.Reserve, country, column, unit)}
          onRemove={column => this.props.removeUnit(this.props.mode, country, ArmyType.Reserve, column)}
          units={units.setSize(size)}
          row_width={30}
          reverse={false}
          type={ArmyType.Reserve}
        />
      </div>
    )
  }

  renderDefeatedArmy = (type: Side, participant: Army): JSX.Element => {
    const country = participant.name
    const units = this.mergeAllValues(country, participant.defeated)
    // + 1 ensures that the user can always select an empty space.
    // ceil ensures full rows for a cleaner UI.
    const size = Math.ceil((units.size + 1) / 30.0) * 30
    return (
      <div key={type}>
        <Header>{type + '\'s defeated units'}</Header>
        <UnitArmy
          color={type === Side.Attacker ? ATTACKER_COLOR : DEFENDER_COLOR}
          side={type}
          onClick={(column, unit) => this.openUnitModal(country, ArmyType.Defeated, country, column, unit)}
          onRemove={column => this.props.removeUnit(this.props.mode, country, ArmyType.Defeated, column)}
          units={units.setSize(size)}
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

  renderTactic = (participant: Army, counter?: TacticType): JSX.Element => {
    const country = participant.name
    const tactic = this.props.tactics.get(participant.tactic)
    const army = {
      frontline: this.mergeAllValues(country, participant.frontline),
      reserve: this.mergeAllValues(country, participant.reserve) as List<BaseUnit>,
      defeated: this.mergeAllValues(country, participant.defeated) as List<BaseUnit>
    }
    return (
      <div key={country} onClick={() => this.openTacticModal(country, counter)}>
        {<Image src={getImage(tactic)} avatar />}
        {(tactic && tactic.type) || 'None'}
        {' ('}
        <StyledNumber
          value={calculateTactic(army, tactic, counter)}
          formatter={toSignedPercent}
        />
        {')'}
      </div >
    )
  }

  renderArmyInfo = (type: Side, participant: Participant, army: Army, enemy: Army): JSX.Element => {
    const name = army.name
    return (
      <Table.Row key={type}>
        <Table.Cell collapsing>
          {type}
        </Table.Cell>
        <Table.Cell collapsing>
          <DropdownSelector
            items={this.props.armies.keySeq()}
            active={name}
            onSelect={name => this.props.selectArmy(this.props.mode, type, name)}
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
          {this.renderRoll(type, participant.roll, participant.randomize_roll, army.general.total, enemy.general.total)}
        </Table.Cell>
        <Table.Cell collapsing>
          {this.renderIsRollRandom(type, participant.randomize_roll)}
        </Table.Cell>
      </Table.Row>
    )
  }

  renderRowTypes = (type: Side, army: Army): JSX.Element => {
    const country = army.name
    const units = this.props.units.get(country)
    const row_types = army.row_types
    return (
      <Table.Row key={type}>
        <Table.Cell>
          {type}
        </Table.Cell>
        <Table.Cell selectable onClick={() => this.openRowModal(country, country, RowType.Front)}>
          <Image src={getImage(units && units.get(row_types.get(RowType.Front)!))} avatar />
        </Table.Cell>
        <Table.Cell selectable onClick={() => this.openRowModal(country, country, RowType.Back)}>
          <Image src={getImage(units && units.get(row_types.get(RowType.Back)!))} avatar />
        </Table.Cell>
        <Table.Cell selectable onClick={() => this.openRowModal(country, country, RowType.Flank)}>
          <Image src={getImage(units && units.get(row_types.get(RowType.Flank)!))} avatar />
        </Table.Cell>
        <Table.Cell collapsing>
          <Input size='mini' style={{ width: 100 }} type='number' value={army && army.flank_size} onChange={(_, data) => this.props.setFlankSize(this.props.mode, country, Number(data.value))} />
        </Table.Cell>
      </Table.Row>
    )
  }

  renderSeed = (): JSX.Element => {
    return (
      <Grid.Column>
        <Input type='number' value={this.props.seed} label='Seed for random generator'  onChange={(_, {value}) => this.setSeed(value)}/>
      </Grid.Column>
    )
  }

  setSeed = (value: string): void => {
    if (value === '')
      this.props.setSeed(this.props.mode, undefined)
    if (!isNaN(Number(value)))
      this.props.setSeed(this.props.mode, Number(value))
  }

  mergeAllValues = (name: CountryName, army: List<BaseUnit | undefined>): List<BaseUnit | undefined> => {
    return army.map(value => value && mergeValues(mergeValues(this.props.units.getIn([name, value.type]), value), this.props.global_stats.getIn([name, this.props.mode])))
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
  combat: mergeSettings(state),
  mode: state.settings.mode,
  countries: state.countries
})

const mapDispatchToProps = (dispatch: any) => ({
  battle: (mode: DefinitionType, steps: number) => dispatch(battle(mode, steps)),
  undo: (mode: DefinitionType, steps: number) => dispatch(undo(mode, steps)),
  toggleRandomRoll: (mode: DefinitionType, participant: Side) => dispatch(toggleRandomRoll(mode, participant)),
  setRoll: (mode: DefinitionType, participant: Side, roll: number) => dispatch(setRoll(mode, participant, roll)),
  setGeneralMartial: (name: CountryName, skill: number) => dispatch(setGeneralMartial(name, skill)) && dispatch(invalidateCountry(name)),
  setFlankSize: (mode: DefinitionType, name: CountryName, size: number) => dispatch(setFlankSize(mode, name, size)) && dispatch(invalidate(mode)),
  selectArmy: (mode: DefinitionType, type: Side, name: CountryName) => dispatch(selectArmy(mode, type, name)) && dispatch(invalidate(mode)),
  removeUnit: (mode: DefinitionType, name: CountryName, type: ArmyType, column: number) => (
    dispatch(selectUnit(mode, name, type, column, undefined))
  ),
  setSeed: (mode: DefinitionType, seed?: number) => dispatch(setSeed(mode, seed)) && dispatch(invalidate(mode)),
  refreshBattle: (mode: DefinitionType) => dispatch(refreshBattle(mode))
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> { }

export default connect(mapStateToProps, mapDispatchToProps)(Battle)
