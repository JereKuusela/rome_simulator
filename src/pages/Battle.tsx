
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button, Grid, Header, Input, Modal, Checkbox } from 'semantic-ui-react'
import { getCombatPhase } from 'combat'
import ModalCohortDetail from 'containers/modal/ModalCohortDetail'
import ModalUnitSelector, { ModalSelectorInfo } from 'containers/modal/ModalUnitSelector'
import PreferredUnitTypes from 'containers/PreferredUnitTypes'
import TableStats from 'containers/TableStats'
import TableArmyPart from 'containers/TableArmyPart'
import TargetArrows from 'containers/TargetArrows'
import TerrainSelector from 'containers/TerrainSelector'
import WinRate from 'containers/WinRate'
import {
  invalidate, selectArmy, setDice, toggleRandomDice, clearCohorts, changeSiteParameter,
  undo, battle, refreshBattle, setSeed, setGeneralBaseStat, resetState, selectCulture
} from 'reducers'
import { AppState, getBattle, getParticipant, getSettings } from 'state'
import { ArmyType, CountryName, Setting, Side, CombatPhase, UnitType } from 'types'
import TableUnitTypes from 'containers/TableUnitTypes'
import TableArmyInfo from 'containers/TableArmyInfo'
import TableDamageAttributes from 'containers/TableDamageAttributes'
import AccordionToggle from 'containers/AccordionToggle'
import ModalUnitDetail from 'containers/modal/ModalUnitDetail'

interface IState {
  modal_cohort_info: ModalSelectorInfo | null
  modal_cohort_detail_info: { country: CountryName, id: number, side: Side } | null
  modal_unit_info: { country: CountryName, type: UnitType } | null
}

const ATTACKER_COLOR = '#FFAA00AA'
const DEFENDER_COLOR = '#00AAFFAA'

class Battle extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props)
    this.state = { modal_cohort_info: null, modal_cohort_detail_info: null, modal_unit_info: null }
  }

  componentDidMount() {
    // Ensures that the setup is not outdated.
    this.props.refreshBattle()
  }

  isModalOpen = () => this.state.modal_cohort_info || this.state.modal_cohort_detail_info || this.state.modal_unit_info

  closeModal = (): void => this.setState({ modal_cohort_info: null, modal_cohort_detail_info: null, modal_unit_info: null })

  openCohortModal = (side: Side, type: ArmyType, country: CountryName, row: number, column: number, id: number | undefined): void => {
    if (id)
      this.openCohortDetails(side, country, id)
    else
      this.openCohortSelector(type, side, row, column)
  }

  openCohortSelector = (type: ArmyType, side: Side, row: number, column: number): void => this.setState({ modal_cohort_info: { type, side, row, column } })

  openCohortDetails = (side: Side, country: CountryName, id: number): void => {
    this.setState({ modal_cohort_detail_info: { country, id, side } })
  }

  openUnitDetails = (country: CountryName, type: UnitType): void => {
    this.setState({ modal_unit_info: { country, type } })
  }

  componentDidUpdate() {
    const { outdated, refreshBattle, settings, round } = this.props
    if (outdated && (settings[Setting.AutoRefresh] || round < 0))
      refreshBattle()
  }

  render() {
    const { participant_a, participant_d, round, is_undo, fight_over, settings, timestamp, changeSiteParameter } = this.props
    if (!timestamp)
      return null
    return (
      <>
        <ModalUnitSelector
          info={this.state.modal_cohort_info}
          onClose={this.closeModal}
        />
        <ModalCohortDetail
          country={this.state.modal_cohort_detail_info ? this.state.modal_cohort_detail_info.country : '' as CountryName}
          id={this.state.modal_cohort_detail_info ? this.state.modal_cohort_detail_info.id : -1}
          side={this.state.modal_cohort_detail_info ? this.state.modal_cohort_detail_info.side : Side.Attacker}
          onClose={this.closeModal}
        />
        <Modal basic onClose={this.closeModal} open={!!this.state.modal_unit_info}>
          <Modal.Content>
            <ModalUnitDetail
              country={this.state.modal_unit_info?.country}
              unit_type={this.state.modal_unit_info?.type}
            />
          </Modal.Content>
        </Modal>
        <Grid verticalAlign='middle'>
          <Grid.Row>
            <Grid.Column floated='left' width='3'>
              <Header>{'Round: ' + this.roundName(round, getCombatPhase(round, settings))}</Header>
            </Grid.Column>
            <Grid.Column textAlign='center' width='4'>
              <Checkbox
                label={Setting.AutoRefresh}
                checked={settings[Setting.AutoRefresh]}
                onChange={(_, { checked }) => changeSiteParameter(Setting.AutoRefresh, !!checked)}
              />
            </Grid.Column>
            <Grid.Column width='5'>
              <WinRate />
            </Grid.Column>
            <Grid.Column floated='right' textAlign='right' width='4'>
              <Button circular icon='angle double left' color='black' size='huge' disabled={!is_undo} onClick={() => this.undo(10)} />
              <Button circular icon='angle left' color='black' size='huge' disabled={!is_undo} onClick={() => this.undo(1)} />
              <Button circular icon='angle right' color='black' size='huge' disabled={fight_over} onClick={() => this.battle(1)} />
              <Button circular icon='angle double right' color='black' size='huge' disabled={fight_over} onClick={() => this.battle(10)} />
            </Grid.Column>

          </Grid.Row>
          <Grid.Row columns={1}>
            <Grid.Column>
              {
                this.renderFrontline(Side.Attacker, participant_a.country)
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
                this.renderFrontline(Side.Defender, participant_d.country)
              }
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <br /><br />
        <AccordionToggle title='Setup' identifier='BattleSetup' open>
          <Grid>
            <Grid.Row columns={1}>
              <Grid.Column>
                <TableArmyInfo key='Foo' />
              </Grid.Column>
            </Grid.Row>
            <Grid.Row columns={2}>
              <Grid.Column>
                <TableUnitTypes side={Side.Attacker} country={participant_a.country} onRowClick={this.openUnitDetails} />
              </Grid.Column>
              <Grid.Column>
                <TableUnitTypes side={Side.Defender} country={participant_d.country} onRowClick={this.openUnitDetails} />
              </Grid.Column>
            </Grid.Row>
            {
              settings[Setting.FireAndShock] &&
              <Grid.Row columns={2}>
                <Grid.Column>
                  <TableDamageAttributes side={Side.Attacker} country={participant_a.country} />
                </Grid.Column>
                <Grid.Column>
                  <TableDamageAttributes side={Side.Defender} country={participant_d.country} />
                </Grid.Column>
              </Grid.Row>

            }
            <Grid.Row columns={1}>
              <Grid.Column>
                <TerrainSelector />
              </Grid.Column>
            </Grid.Row>
            {settings[Setting.CustomDeployment] &&
              <Grid.Row columns={1}>
                <Grid.Column>
                  <PreferredUnitTypes />
                </Grid.Column>
              </Grid.Row>
            }
          </Grid>
          <br />
        </AccordionToggle>
        <br />
        <AccordionToggle title='Stats' identifier='BattleStats' open>
          <Grid>
            <Grid.Row columns={1}>
              <Grid.Column>
                <TableStats />
              </Grid.Column>
            </Grid.Row>
          </Grid>
          <br /><br />
        </AccordionToggle>
        <br />
        <AccordionToggle title='Reserve & Defeated' identifier='Reserve'>
          <Grid>
            <Grid.Row columns={1}>
              <Grid.Column>
                {this.renderReserve(Side.Attacker, participant_a.country)}
              </Grid.Column>
            </Grid.Row>
            <Grid.Row columns={1}>
              <Grid.Column>
                {this.renderReserve(Side.Defender, participant_d.country)}
              </Grid.Column>
            </Grid.Row>
            <Grid.Row columns={1}>
              <Grid.Column>
                {this.renderDefeatedArmy(Side.Attacker, participant_a.country)}
              </Grid.Column>
            </Grid.Row>
            <Grid.Row columns={1}>
              <Grid.Column>
                {this.renderDefeatedArmy(Side.Defender, participant_d.country)}
              </Grid.Column>
            </Grid.Row>
          </Grid>
          <br /><br />
        </AccordionToggle>
        <br />
        <Grid>
          <Grid.Row>
            {
              this.renderSeed()
            }
            <Grid.Column floated='right' width='6' textAlign='right'>
              <Button negative onClick={this.clearCohorts}>
                Reset units
              </Button>
              <Button negative onClick={this.props.resetState}>
                Reset all data
              </Button>
            </Grid.Column>
          </Grid.Row>
        </Grid >
      </ >
    )
  }

  roundName = (round: number, phase: CombatPhase): string => {
    if (round < 0)
      return 'Before combat'
    if (!round)
      return 'Deployment'
    if (phase !== CombatPhase.Default)
      return String(round) + ' (' + phase + ')'
    return String(round)
  }

  renderFrontline = (side: Side, country: CountryName) => {
    const combat_width = this.props.settings[Setting.CombatWidth]
    return (
      <TableArmyPart
        color={side === Side.Attacker ? ATTACKER_COLOR : DEFENDER_COLOR}
        side={side}
        onClick={(row, column, id) => this.openCohortModal(side, ArmyType.Frontline, country, row, column, id)}
        row_width={Math.max(30, combat_width)}
        reverse={side === Side.Attacker}
        type={ArmyType.Frontline}
        disable_add={this.props.round > -1}
      />
    )
  }

  renderReserve = (side: Side, country: CountryName) => {
    return (
      <TableArmyPart
        color={side === Side.Attacker ? ATTACKER_COLOR : DEFENDER_COLOR}
        side={side}
        onClick={(row, column, id) => this.openCohortModal(side, ArmyType.Reserve, country, row, column + 30 * row, id)}
        row_width={30}
        reverse={false}
        type={ArmyType.Reserve}
        full_rows
      />
    )
  }

  renderDefeatedArmy = (side: Side, country: CountryName) => {
    return (
      <TableArmyPart
        color={side === Side.Attacker ? ATTACKER_COLOR : DEFENDER_COLOR}
        side={side}
        onClick={(row, column, id) => this.openCohortModal(side, ArmyType.Defeated, country, row, column + 30 * row, id)}
        row_width={30}
        reverse={false}
        type={ArmyType.Defeated}
        full_rows
      />
    )
  }

  renderSeed = () => {
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

  clearCohorts = (): void => {
    const { participant_a, participant_d, clearCohorts, invalidate } = this.props
    clearCohorts(participant_a.country)
    clearCohorts(participant_d.country)
    invalidate()
  }

  undo = (rounds: number) => {
    const { undo, outdated, refreshBattle } = this.props
    undo(rounds)
    if (outdated)
      refreshBattle()
  }

  battle = (rounds: number) => {
    const { battle, outdated, refreshBattle } = this.props
    if (outdated)
      refreshBattle()
    battle(rounds)
  }
}

const mapStateToProps = (state: AppState) => {
  const battle = getBattle(state)
  return {
    participant_a: getParticipant(state, Side.Attacker),
    participant_d: getParticipant(state, Side.Defender),
    is_undo: battle.round > -1,
    round: battle.round,
    seed: battle.seed,
    outdated: battle.outdated,
    timestamp: battle.timestamp,
    fight_over: battle.fight_over,
    settings: getSettings(state)
  }
}

const actions = { changeSiteParameter, battle, undo, toggleRandomRoll: toggleRandomDice, setRoll: setDice, setGeneralBaseStat, invalidate, selectArmy, setSeed, refreshBattle, resetState, selectCulture, clearCohorts }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends S, D { }

export default connect(mapStateToProps, actions)(Battle)
