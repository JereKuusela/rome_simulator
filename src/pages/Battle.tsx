
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button, Checkbox, Divider, Grid, Header, Image, Input, Table } from 'semantic-ui-react'
import {
    calculateBaseDamage, calculateRollModifierFromGenerals, calculateRollModifierFromTerrains,
    calculateTotalRoll
} from 'combat'
import ConfirmationButton from 'components/ConfirmationButton'
import Dropdown from 'components/Utils/Dropdown'
import StyledNumber from 'components/Utils/StyledNumber'
import ModalCohortDetail from 'containers/modal/ModalCohortDetail'
import ModalFastPlanner from 'containers/modal/ModalFastPlanner'
import ModalUnitSelector, { ModalInfo as ModalUnitInfo } from 'containers/modal/ModalUnitSelector'
import PreferredUnitTypes from 'containers/PreferredUnitTypes'
import Stats from 'containers/Stats'
import UnitArmy from 'containers/TableArmyPart'
import TacticSelector from 'containers/TacticSelector'
import TargetArrows from 'containers/TargetArrows'
import TerrainSelector from 'containers/TerrainSelector'
import WinRate from 'containers/WinRate'
import { addSign } from 'formatters'
import IconDice from 'images/chance.png'
import IconGeneral from 'images/military_power.png'
import IconTerrain from 'images/terrain.png'
import {
    invalidate, selectArmy, selectCohort, setRoll, toggleRandomRoll,
    undo, battle, refreshBattle, setSeed, setGeneralMartial, resetState
} from 'reducers'
import { AppState, getBattle, getCountry, getGeneralStats, getParticipant, getSettings, getCountries } from 'state'
import { ArmyType, CountryName, Participant, Setting, Side, GeneralStats } from 'types'
import { keys } from 'utils'

interface IState {
  modal_unit_info: ModalUnitInfo | null
  modal_army_unit_info: { country: CountryName, id: number, side: Side } | null
  modal_fast_planner_open: boolean
}

const ATTACKER_COLOR = '#FFAA00AA'
const DEFENDER_COLOR = '#00AAFFAA'

class Battle extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props)
    this.state = { modal_unit_info: null, modal_army_unit_info: null, modal_fast_planner_open: false }
  }

  isModalOpen = () => this.state.modal_unit_info || this.state.modal_army_unit_info || this.state.modal_fast_planner_open

  closeModal = (): void => this.setState({ modal_unit_info: null, modal_army_unit_info: null, modal_fast_planner_open: false })

  openUnitModal = (side: Side, type: ArmyType, country: CountryName, column: number, id: number | undefined): void => {
    if (id)
      this.openArmyUnitModal(side, country, id)
    else
      this.openUnitSelector(type, country, column)
  }

  openUnitSelector = (type: ArmyType, country: CountryName, index: number): void => this.setState({ modal_unit_info: { type, country, index } })

  openArmyUnitModal = (side: Side, country: CountryName, id: number): void => {
    this.setState({ modal_army_unit_info: { country, id, side } })
  }

  openFastPlanner = (): void => this.setState({ modal_fast_planner_open: true })

  render() {
    const { attacker, defender, general_a, general_d, round, outdated, is_undo, fight_over, refreshBattle } = this.props
    if (outdated)
      refreshBattle()
    return (
      <>
        <ModalUnitSelector
          info={this.state.modal_unit_info}
          onClose={this.closeModal}
        />
        <ModalFastPlanner
          open={this.state.modal_fast_planner_open}
          onClose={this.closeModal}
        />
        <ModalCohortDetail
          country={this.state.modal_army_unit_info ? this.state.modal_army_unit_info.country : '' as CountryName}
          id={this.state.modal_army_unit_info ? this.state.modal_army_unit_info.id : -1}
          side={this.state.modal_army_unit_info ? this.state.modal_army_unit_info.side : Side.Attacker}
          onClose={this.closeModal}
        />
        <Grid verticalAlign='middle'>
          <Grid.Row>
            <Grid.Column floated='left' width='2'>
              <Header>{'Round: ' + this.roundName(round)}</Header>
            </Grid.Column>
            <Grid.Column textAlign='center' width='6'>
              <Button primary size='large' onClick={this.openFastPlanner}>
                Create and remove units
              </Button>
            </Grid.Column>
            <Grid.Column width='4'>
              <WinRate />
            </Grid.Column>
            <Grid.Column floated='right' textAlign='right' width='4'>
              <Button circular icon='angle double left' color='black' size='huge' disabled={!is_undo} onClick={() => this.props.undo(10)} />
              <Button circular icon='angle left' color='black' size='huge' disabled={!is_undo} onClick={() => this.props.undo(1)} />
              <Button circular icon='angle right' color='black' size='huge' disabled={fight_over} onClick={() => this.props.battle(1)} />
              <Button circular icon='angle double right' color='black' size='huge' disabled={fight_over} onClick={() => this.props.battle(10)} />
            </Grid.Column>

          </Grid.Row>
          <Grid.Row columns={1}>
            <Grid.Column>
              {
                this.renderFrontline(Side.Attacker, attacker.country)
              }
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={1} style={{ padding: 0 }}>
            <Grid.Column>
              <TargetArrows
                type={ArmyType.Frontline}
                visible={!fight_over}
                attacker_color={ATTACKER_COLOR}
                defender_color={DEFENDER_COLOR}
              />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={1}>
            <Grid.Column>
              {
                this.renderFrontline(Side.Defender, defender.country)
              }
            </Grid.Column>
          </Grid.Row>
          <Divider />
          <Grid.Row columns={1}>
            <Grid.Column>
              <Stats />
            </Grid.Column>
          </Grid.Row>
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
                  {this.renderArmyInfo(Side.Attacker, attacker, general_a, general_d)}
                  {this.renderArmyInfo(Side.Defender, defender, general_d, general_a)}
                </Table.Body>
              </Table>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={1}>
            <Grid.Column>
              <TerrainSelector />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={1}>
            <Grid.Column>
              <PreferredUnitTypes />
            </Grid.Column>
          </Grid.Row>
          <Divider />
          <Grid.Row columns={1}>
            <Grid.Column>
              {
                this.renderReserve(Side.Attacker, attacker.country)
              }
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={1}>
            <Grid.Column>
              {
                this.renderReserve(Side.Defender, defender.country)
              }
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={1}>
            <Grid.Column>
              {
                this.renderDefeatedArmy(Side.Attacker, attacker.country)
              }
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={1}>
            <Grid.Column>
              {
                this.renderDefeatedArmy(Side.Defender, defender.country)
              }
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            {
              this.renderSeed()
            }
            <Grid.Column floated='right' width='6' textAlign='right'>
              <ConfirmationButton
                negative text='Reset all data'
                message='Do you really want to reset all data?'
                onConfirm={() => this.props.resetState()}
              />
            </Grid.Column>
          </Grid.Row>
        </Grid >
      </ >
    )
  }

  roundName = (round: number): string => {
    if (round < 0)
      return 'Before combat'
    return String(round)
  }

  renderFrontline = (side: Side, country: CountryName) => {
    const combat_width = this.props.combat[Setting.CombatWidth]
    return (
      <div key={side}>
        {side === Side.Attacker && <Header>{side + '\'s frontline'}</Header>}
        <UnitArmy
          color={side === Side.Attacker ? ATTACKER_COLOR : DEFENDER_COLOR}
          side={side}
          onClick={(column, id) => this.openUnitModal(side, ArmyType.Frontline, country, column, id)}
          onRemove={column => this.props.removeUnit(country, ArmyType.Frontline, column)}
          row_width={Math.max(30, combat_width)}
          reverse={side === Side.Attacker}
          type={ArmyType.Frontline}
          disable_add={this.props.round > -1}
        />
        {side === Side.Defender && <Header>{side + '\'s frontline'}</Header>}
      </div>
    )
  }

  renderRoll = (side: Side, roll: number, is_random: boolean, general: number, opposing_general: number) => {
    const terrain_effect = side === Side.Attacker ? calculateRollModifierFromTerrains(this.props.selected_terrains.map(value => this.props.terrains[value])) : 0
    const general_effect = calculateRollModifierFromGenerals(general, opposing_general)
    const total = calculateTotalRoll(roll, side === Side.Attacker ? this.props.selected_terrains.map(value => this.props.terrains[value]) : [], general, opposing_general)
    const base_damage = calculateBaseDamage(total, this.props.combat)
    return (
      <div key={side}>
        {base_damage.toFixed(3)} :
        <span style={{ paddingLeft: '1em' }} /><Image src={IconDice} avatar />
        {is_random ? roll : <Input size='mini' style={{ width: 100 }} type='number' value={roll} onChange={(_, data) => this.props.setRoll(side, Number(data.value))} />}
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

  renderIsRollRandom = (side: Side, is_random: boolean) => {
    return (
      <Checkbox toggle checked={is_random} onClick={() => this.props.toggleRandomRoll(side)} />
    )
  }

  renderReserve = (side: Side, country: CountryName) => {
    return (
      <div key={side}>
        <Header>{side + '\'s reserve'}</Header>
        <UnitArmy
          color={side === Side.Attacker ? ATTACKER_COLOR : DEFENDER_COLOR}
          side={side}
          onClick={(column, id) => this.openUnitModal(side, ArmyType.Reserve, country, column, id)}
          onRemove={column => this.props.removeUnit(country, ArmyType.Reserve, column)}
          row_width={30}
          reverse={false}
          type={ArmyType.Reserve}
          full_rows
          extra_slot
        />
      </div>
    )
  }

  renderDefeatedArmy = (side: Side, country: CountryName) => {
    return (
      <div key={side}>
        <Header>{side + '\'s defeated units'}</Header>
        <UnitArmy
          color={side === Side.Attacker ? ATTACKER_COLOR : DEFENDER_COLOR}
          side={side}
          onClick={(column, id) => this.openUnitModal(side, ArmyType.Defeated, country, column, id)}
          onRemove={column => this.props.removeUnit(country, ArmyType.Defeated, column)}
          row_width={30}
          reverse={false}
          type={ArmyType.Defeated}
          full_rows
          extra_slot
        />
      </div>
    )
  }

  renderArmyInfo = (side: Side, participant: Participant, stats: GeneralStats, enemy: GeneralStats): JSX.Element => {
    return (
      <Table.Row key={side}>
        <Table.Cell collapsing>
          {side}
        </Table.Cell>
        <Table.Cell collapsing>
          <Dropdown
            values={keys(this.props.countries)}
            value={participant.country}
            onChange={name => this.props.selectArmy(side, name)}
          />
        </Table.Cell>
        <Table.Cell collapsing>
          <Input disabled={!stats.enabled} size='mini' style={{ width: 100 }} type='number' value={stats.base_martial} onChange={(_, { value }) => this.props.setGeneralMartial(participant.country, Number(value))} />
          {' '}<StyledNumber value={stats.trait_martial} formatter={addSign} />
        </Table.Cell>
        <Table.Cell collapsing>
          <TacticSelector side={side} />
        </Table.Cell>
        <Table.Cell>
          {this.renderRoll(side, participant.roll, participant.randomize_roll, stats.martial, enemy.martial)}
        </Table.Cell>
        <Table.Cell collapsing>
          {this.renderIsRollRandom(side, participant.randomize_roll)}
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
    if (!isNaN(Number(value)))
      this.props.setSeed(Number(value))
  }
}

const mapStateToProps = (state: AppState) => ({
  attacker: getParticipant(state, Side.Attacker),
  defender: getParticipant(state, Side.Defender),
  general_a: getGeneralStats(state, getCountry(state, Side.Attacker)),
  general_d: getGeneralStats(state, getCountry(state, Side.Defender)),
  countries: getCountries(state),
  is_undo: getBattle(state).round > -1,
  round: getBattle(state).round,
  seed: getBattle(state).seed,
  outdated: getBattle(state).outdated,
  selected_terrains: getBattle(state).terrains,
  terrains: state.terrains,
  tactics: state.tactics,
  fight_over: getBattle(state).fight_over,
  combat: getSettings(state)
})

const mapDispatchToProps = (dispatch: any) => ({
  battle: (steps: number) => dispatch(battle(steps)),
  undo: (steps: number) => dispatch(undo(steps)),
  toggleRandomRoll: (side: Side) => dispatch(toggleRandomRoll(side)),
  setRoll: (participant: Side, roll: number) => dispatch(setRoll(participant, roll)),
  setGeneralMartial: (country: CountryName, skill: number) => dispatch(setGeneralMartial(country, skill)) && dispatch(invalidate()),
  selectArmy: (type: Side, country: CountryName) => dispatch(selectArmy(type, country)) && dispatch(invalidate()),
  removeUnit: (country: CountryName, type: ArmyType, column: number) => (
    dispatch(selectCohort(country, type, column, null))
  ),
  setSeed: (seed: number) => dispatch(setSeed(seed)) && dispatch(invalidate()),
  refreshBattle: () => dispatch(refreshBattle()),
  resetState: () => dispatch(resetState())
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> { }

export default connect(mapStateToProps, mapDispatchToProps)(Battle)
