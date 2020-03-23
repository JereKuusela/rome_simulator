
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button, Divider, Grid, Header, Input } from 'semantic-ui-react'
import { getCombatPhase } from 'combat'
import ConfirmationButton from 'components/ConfirmationButton'
import ModalCohortDetail from 'containers/modal/ModalCohortDetail'
import ModalFastPlanner from 'containers/modal/ModalFastPlanner'
import ModalUnitSelector, { ModalInfo as ModalUnitInfo } from 'containers/modal/ModalUnitSelector'
import PreferredUnitTypes from 'containers/PreferredUnitTypes'
import TableStats from 'containers/TableStats'
import TableArmyPart from 'containers/TableArmyPart'
import TargetArrows from 'containers/TargetArrows'
import TerrainSelector from 'containers/TerrainSelector'
import WinRate from 'containers/WinRate'
import {
  invalidate, selectArmy, setRoll, toggleRandomRoll,
  undo, battle, refreshBattle, setSeed, setGeneralBaseStat, resetState, selectCulture
} from 'reducers'
import { AppState, getBattle, getCountryName, getParticipant, getSettings, getCountries, getGeneral, getSelectedTerrains, getCountry } from 'state'
import { ArmyType, CountryName, Setting, Side, CombatPhase } from 'types'
import TableArchetypes from 'containers/TableArchetypes'
import TableArmyInfo from 'containers/TableArmyInfo'
import TableDamageAttributes from 'containers/TableDamageAttributes'

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
    const { outdated, refreshBattle } = props
    if (outdated)
      refreshBattle()
  }

  isModalOpen = () => this.state.modal_unit_info || this.state.modal_army_unit_info || this.state.modal_fast_planner_open

  closeModal = (): void => this.setState({ modal_unit_info: null, modal_army_unit_info: null, modal_fast_planner_open: false })

  openUnitModal = (side: Side, type: ArmyType, country: CountryName, row: number, column: number, id: number | undefined): void => {
    if (id)
      this.openArmyUnitModal(side, country, id)
    else
      this.openUnitSelector(type, country, row, column)
  }

  openUnitSelector = (type: ArmyType, country: CountryName, row: number, column: number): void => this.setState({ modal_unit_info: { type, country, row, column } })

  openArmyUnitModal = (side: Side, country: CountryName, id: number): void => {
    this.setState({ modal_army_unit_info: { country, id, side } })
  }

  openFastPlanner = (): void => this.setState({ modal_fast_planner_open: true })

  componentDidUpdate() {
    const { outdated, refreshBattle } = this.props
    if (outdated)
      refreshBattle()
  }

  render() {
    const { participant_a, participant_d, round, is_undo, fight_over, settings } = this.props
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
            <Grid.Column floated='left' width='3'>
              <Header>{'Round: ' + this.roundName(round, getCombatPhase(round - 1, settings))}</Header>
            </Grid.Column>
            <Grid.Column textAlign='center' width='5'>
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
          <Divider />
          <Grid.Row columns={1}>
            <Grid.Column>
              <TableArmyInfo />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={2}>
            <Grid.Column>
              <TableArchetypes side={Side.Attacker} country={participant_a.country} />
            </Grid.Column>
            <Grid.Column>
              <TableArchetypes side={Side.Defender} country={participant_d.country} />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={2}>
            <Grid.Column>
              <TableDamageAttributes side={Side.Attacker} country={participant_a.country} />
            </Grid.Column>
            <Grid.Column>
              <TableDamageAttributes side={Side.Defender} country={participant_d.country} />
            </Grid.Column>
          </Grid.Row>
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
          <Divider />
          <Grid.Row columns={1}>
            <Grid.Column>
              <TableStats />
            </Grid.Column>
          </Grid.Row>
          <Divider />
          <Grid.Row columns={1}>
            <Grid.Column>
              {
                this.renderReserve(Side.Attacker, participant_a.country)
              }
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={1}>
            <Grid.Column>
              {
                this.renderReserve(Side.Defender, participant_d.country)
              }
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={1}>
            <Grid.Column>
              {
                this.renderDefeatedArmy(Side.Attacker, participant_a.country)
              }
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={1}>
            <Grid.Column>
              {
                this.renderDefeatedArmy(Side.Defender, participant_d.country)
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
      <div key={side}>
        {side === Side.Attacker && <Header>{side + '\'s frontline'}</Header>}
        <TableArmyPart
          color={side === Side.Attacker ? ATTACKER_COLOR : DEFENDER_COLOR}
          side={side}
          onClick={(row, column, id) => this.openUnitModal(side, ArmyType.Frontline, country, row, column, id)}
          row_width={Math.max(30, combat_width)}
          reverse={side === Side.Attacker}
          type={ArmyType.Frontline}
          disable_add={this.props.round > -1}
        />
        {side === Side.Defender && <Header>{side + '\'s frontline'}</Header>}
      </div>
    )
  }

  renderReserve = (side: Side, country: CountryName) => {
    return (
      <div key={side}>
        <Header>{side + '\'s reserve'}</Header>
        <TableArmyPart
          color={side === Side.Attacker ? ATTACKER_COLOR : DEFENDER_COLOR}
          side={side}
          onClick={(row, column, id) => this.openUnitModal(side, ArmyType.Reserve, country, row, column + 30 * row, id)}
          row_width={30}
          reverse={false}
          type={ArmyType.Reserve}
          full_rows
        />
      </div>
    )
  }

  renderDefeatedArmy = (side: Side, country: CountryName) => {
    return (
      <div key={side}>
        <Header>{side + '\'s defeated units'}</Header>
        <TableArmyPart
          color={side === Side.Attacker ? ATTACKER_COLOR : DEFENDER_COLOR}
          side={side}
          onClick={(row, column, id) => this.openUnitModal(side, ArmyType.Defeated, country, row, column + 30 * row, id)}
          row_width={30}
          reverse={false}
          type={ArmyType.Defeated}
          full_rows
        />
      </div>
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
}

const mapStateToProps = (state: AppState) => ({
  participant_a: getParticipant(state, Side.Attacker),
  participant_d: getParticipant(state, Side.Defender),
  general_a: getGeneral(state, getCountryName(state, Side.Attacker)),
  general_d: getGeneral(state, getCountryName(state, Side.Defender)),
  country_a: getCountry(state, Side.Attacker),
  country_d: getCountry(state, Side.Defender),
  countries: getCountries(state),
  is_undo: getBattle(state).round > -1,
  round: getBattle(state).round,
  seed: getBattle(state).seed,
  outdated: getBattle(state).outdated,
  terrains: getSelectedTerrains(state),
  tactics: state.tactics,
  fight_over: getBattle(state).fight_over,
  settings: getSettings(state)
})

const actions = { battle, undo, toggleRandomRoll, setRoll, setGeneralBaseStat, invalidate, selectArmy, setSeed, refreshBattle, resetState, selectCulture }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends S, D { }

export default connect(mapStateToProps, actions)(Battle)
