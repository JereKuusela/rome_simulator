
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button, Grid, Header, Checkbox } from 'semantic-ui-react'
import { getCombatPhase } from 'combat'
import PreferredUnitTypes from 'containers/PreferredUnitTypes'
import TableStats from 'containers/TableStats'
import TableArmyPart from 'containers/TableArmyPart'
import TargetArrows from 'containers/TargetArrows'
import TerrainSelector from 'containers/TerrainSelector'
import WinRate from 'containers/WinRate'
import {
  selectParticipantCountry, setDice, toggleRandomDice, clearCohorts, changeSiteParameter,
  undo, battle, refreshBattle, resetState, selectCulture, openModal
} from 'reducers'
import { AppState, getBattle, getParticipant, getSettings } from 'state'
import { ArmyType, CountryName, Setting, SideType, CombatPhase, UnitType, ModalType, ArmyName } from 'types'
import TableUnitTypes from 'containers/TableUnitTypes'
import TableArmyInfo from 'containers/TableArmyInfo'
import TableSideInfo from 'containers/TableSideInfo'
import TableDamageAttributes from 'containers/TableDamageAttributes'
import AccordionToggle from 'containers/AccordionToggle'

const ATTACKER_COLOR = '#FFAA00AA'
const DEFENDER_COLOR = '#00AAFFAA'

class Battle extends Component<IProps> {

  componentDidMount() {
    // Ensures that the setup is not outdated.
    this.props.refreshBattle()
  }

  openCohortModal = (side: SideType, type: ArmyType, row: number, column: number, id: number | undefined): void => {
    if (id)
      this.props.openModal(ModalType.CohortDetail, { side, id })
    else
      this.props.openModal(ModalType.CohortSelector, { side, type, row, column })
  }

  openUnitDetails = (country: CountryName, army: ArmyName, type: UnitType): void => {
    this.props.openModal(ModalType.UnitDetail, { country, army, type })
  }

  componentDidUpdate() {
    const { outdated, refreshBattle, settings, round } = this.props
    if (outdated && (settings[Setting.AutoRefresh] || round < 0))
      refreshBattle()
  }

  render() {
    const { participantA, participantD, round, isUndo, fightOver, settings, timestamp, changeSiteParameter } = this.props
    if (!timestamp)
      return null
    return (
      <>
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
              <Button circular icon='angle double left' color='black' size='huge' disabled={!isUndo} onClick={() => this.undo(10)} />
              <Button circular icon='angle left' color='black' size='huge' disabled={!isUndo} onClick={() => this.undo(1)} />
              <Button circular icon='angle right' color='black' size='huge' disabled={fightOver} onClick={() => this.battle(1)} />
              <Button circular icon='angle double right' color='black' size='huge' disabled={fightOver} onClick={() => this.battle(10)} />
            </Grid.Column>

          </Grid.Row>
          <Grid.Row columns={1}>
            <Grid.Column>
              {
                this.renderFrontline(SideType.Attacker)
              }
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={1} style={{ padding: 0 }}>
            <Grid.Column>
              <TargetArrows
                type={ArmyType.Frontline}
                visible={!fightOver}
                attackerColor={ATTACKER_COLOR}
                defenderColor={DEFENDER_COLOR}
              />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={1}>
            <Grid.Column>
              {
                this.renderFrontline(SideType.Defender)
              }
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={2}>
            <Grid.Column>
              <TableSideInfo type={SideType.Attacker} />
            </Grid.Column>
            <Grid.Column>
              <TableSideInfo type={SideType.Defender} />
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <br /><br />
        <AccordionToggle title='Setup' identifier='BattleSetup' open>
          <Grid>
            <Grid.Row columns={2}>
              <Grid.Column>
                <TableArmyInfo type={SideType.Attacker} />
              </Grid.Column>
              <Grid.Column>
                <TableArmyInfo type={SideType.Defender} />
              </Grid.Column>
            </Grid.Row>
            <Grid.Row columns={2}>
              <Grid.Column>
                <TableUnitTypes side={SideType.Attacker} country={participantA.country} army={participantA.army} onRowClick={this.openUnitDetails} />
              </Grid.Column>
              <Grid.Column>
                <TableUnitTypes side={SideType.Defender} country={participantD.country} army={participantD.army} onRowClick={this.openUnitDetails} />
              </Grid.Column>
            </Grid.Row>
            {
              settings[Setting.FireAndShock] &&
              <Grid.Row columns={2}>
                <Grid.Column>
                  <TableDamageAttributes side={SideType.Attacker} country={participantA.country} army={participantA.army} />
                </Grid.Column>
                <Grid.Column>
                  <TableDamageAttributes side={SideType.Defender} country={participantD.country} army={participantD.army} />
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
                {this.renderReserve(SideType.Attacker)}
              </Grid.Column>
            </Grid.Row>
            <Grid.Row columns={1}>
              <Grid.Column>
                {this.renderReserve(SideType.Defender)}
              </Grid.Column>
            </Grid.Row>
            <Grid.Row columns={1}>
              <Grid.Column>
                {this.renderDefeatedArmy(SideType.Attacker)}
              </Grid.Column>
            </Grid.Row>
            <Grid.Row columns={1}>
              <Grid.Column>
                {this.renderDefeatedArmy(SideType.Defender)}
              </Grid.Column>
            </Grid.Row>
          </Grid>
          <br /><br />
        </AccordionToggle>
        <br />
        <Grid>
          <Grid.Row>
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
      </>
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

  renderFrontline = (side: SideType) => {
    const combatWidth = this.props.settings[Setting.CombatWidth]
    return (
      <TableArmyPart
        color={side === SideType.Attacker ? ATTACKER_COLOR : DEFENDER_COLOR}
        side={side}
        onClick={(row, column, id) => this.openCohortModal(side, ArmyType.Frontline, row, column, id)}
        rowWidth={Math.max(30, combatWidth)}
        reverse={side === SideType.Attacker}
        type={ArmyType.Frontline}
        disableAdd={this.props.round > -1}
      />
    )
  }

  renderReserve = (side: SideType) => {
    return (
      <TableArmyPart
        color={side === SideType.Attacker ? ATTACKER_COLOR : DEFENDER_COLOR}
        side={side}
        onClick={(row, column, id) => this.openCohortModal(side, ArmyType.Reserve, row, column + 30 * row, id)}
        rowWidth={30}
        reverse={false}
        type={ArmyType.Reserve}
        fullRows
      />
    )
  }

  renderDefeatedArmy = (side: SideType) => {
    return (
      <TableArmyPart
        color={side === SideType.Attacker ? ATTACKER_COLOR : DEFENDER_COLOR}
        side={side}
        onClick={(row, column, id) => this.openCohortModal(side, ArmyType.Defeated, row, column + 30 * row, id)}
        rowWidth={30}
        reverse={false}
        type={ArmyType.Defeated}
        fullRows
      />
    )
  }

  clearCohorts = (): void => {
    const { participantA, participantD, clearCohorts } = this.props
    clearCohorts(participantA.country, participantA.army)
    clearCohorts(participantD.country, participantD.army)
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
    participantA: getParticipant(state, SideType.Attacker),
    participantD: getParticipant(state, SideType.Defender),
    isUndo: battle.round > -1,
    round: battle.round,
    outdated: battle.outdated,
    timestamp: battle.timestamp,
    fightOver: battle.fightOver,
    settings: getSettings(state)
  }
}

const actions = { openModal, changeSiteParameter, battle, undo, toggleRandomDice, setDice, selectParticipantCountry, refreshBattle, resetState, selectCulture, clearCohorts }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends S, D { }

export default connect(mapStateToProps, actions)(Battle)
