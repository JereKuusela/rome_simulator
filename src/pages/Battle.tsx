
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
import { AppState, getBattle, getSettings, getFirstParticipant } from 'state'
import { ArmyPart, CountryName, Setting, SideType, CombatPhase, UnitType, ModalType, ArmyName } from 'types'
import TableUnitTypes from 'containers/TableUnitTypes'
import TableArmyInfo from 'containers/TableArmyInfo'
import TableSideInfo from 'containers/TableSideInfo'
import TableDamageAttributes from 'containers/TableDamageAttributes'
import AccordionToggle from 'containers/AccordionToggle'
import { getDay, getRound } from 'managers/battle'

const ATTACKER_COLOR = '#FFAA00AA'
const DEFENDER_COLOR = '#00AAFFAA'

class Battle extends Component<IProps> {

  componentDidMount() {
    // Ensures that the setup is not outdated.
    this.props.refreshBattle()
  }

  openCohortModal = (side: SideType, participantIndex: number, index: number, country: CountryName, army: ArmyName): void => {
    this.props.openModal(ModalType.CohortDetail, { side, country, army, index, participantIndex })
  }

  openUnitDetails = (countryName: CountryName, armyName: ArmyName, type: UnitType): void => {
    this.props.openModal(ModalType.UnitDetail, { country: countryName, army: armyName, type })
  }

  componentDidUpdate() {
    const { outdated, refreshBattle, settings, round } = this.props
    if (outdated && (settings[Setting.AutoRefresh] || round < 0))
      refreshBattle()
  }

  render() {
    const { participantA, participantD, round, isUndoAvailable, fightOver, settings, timestamp, day, changeSiteParameter } = this.props
    if (!timestamp)
      return null
    return (
      <>
        <Grid verticalAlign='middle'>
          <Grid.Row>
            <Grid.Column floated='left' width='3'>
              <Header>{this.roundName(day, round, getCombatPhase(round, settings))}</Header>
            </Grid.Column>
            <Grid.Column textAlign='center' width='3'>
              <Checkbox
                label={Setting.AutoRefresh}
                checked={settings[Setting.AutoRefresh]}
                onChange={(_, { checked }) => changeSiteParameter(Setting.AutoRefresh, !!checked)}
              />
            </Grid.Column>
            <Grid.Column width='6'>
              <WinRate />
            </Grid.Column>
            <Grid.Column floated='right' textAlign='right' width='4'>
              <Button circular icon='angle double left' color='black' size='huge' disabled={!isUndoAvailable} onClick={() => this.undo(10)} />
              <Button circular icon='angle left' color='black' size='huge' disabled={!isUndoAvailable} onClick={() => this.undo(1)} />
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
                type={ArmyPart.Frontline}
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
                <TableUnitTypes side={SideType.Attacker} countryName={participantA.countryName} armyName={participantA.armyName} onRowClick={this.openUnitDetails} />
              </Grid.Column>
              <Grid.Column>
                <TableUnitTypes side={SideType.Defender} countryName={participantD.countryName} armyName={participantD.armyName} onRowClick={this.openUnitDetails} />
              </Grid.Column>
            </Grid.Row>
            {
              settings[Setting.FireAndShock] &&
              <Grid.Row columns={2}>
                <Grid.Column>
                  <TableDamageAttributes side={SideType.Attacker} country={participantA.countryName} army={participantA.armyName} />
                </Grid.Column>
                <Grid.Column>
                  <TableDamageAttributes side={SideType.Defender} country={participantD.countryName} army={participantD.armyName} />
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

  roundName = (day: number, round: number, phase: CombatPhase): string => {
    const dayStr = day === round ? '' : ', Day ' + day
    let roundStr = ''
    if (round === -1)
      roundStr = 'Waiting for enemies'
    else if (!round)
      roundStr = 'Deployment'
    else if (phase !== CombatPhase.Default)
      roundStr = 'Round ' + String(round) + ' (' + phase + ')'
    else
      roundStr = 'Round ' + String(round)
    return roundStr + dayStr
  }

  renderFrontline = (side: SideType) => {
    const combatWidth = this.props.settings[Setting.CombatWidth]
    return (
      <TableArmyPart
        color={side === SideType.Attacker ? ATTACKER_COLOR : DEFENDER_COLOR}
        side={side}
        onClick={this.openCohortModal}
        rowWidth={Math.max(30, combatWidth)}
        reverse={side === SideType.Attacker}
        part={ArmyPart.Frontline}
        markDefeated
      />
    )
  }

  renderReserve = (side: SideType) => {
    return (
      <TableArmyPart
        color={side === SideType.Attacker ? ATTACKER_COLOR : DEFENDER_COLOR}
        side={side}
        onClick={this.openCohortModal}
        rowWidth={30}
        reverse={false}
        part={ArmyPart.Reserve}
        fullRows
      />
    )
  }

  renderDefeatedArmy = (side: SideType) => {
    return (
      <TableArmyPart
        color={side === SideType.Attacker ? ATTACKER_COLOR : DEFENDER_COLOR}
        side={side}
        onClick={this.openCohortModal}
        rowWidth={30}
        reverse={false}
        part={ArmyPart.Defeated}
        fullRows
      />
    )
  }

  clearCohorts = (): void => {
    const { participantA, participantD, clearCohorts } = this.props
    clearCohorts(participantA.countryName, participantA.armyName)
    clearCohorts(participantD.countryName, participantD.armyName)
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
  const day = getDay(battle)
  const round = getRound(battle)
  return {
    participantA: getFirstParticipant(state, SideType.Attacker),
    participantD: getFirstParticipant(state, SideType.Defender),
    isUndoAvailable: day > 0,
    round,
    day,
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
