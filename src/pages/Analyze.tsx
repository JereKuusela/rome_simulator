import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Grid, Button, Table, Header, Checkbox } from 'semantic-ui-react'

import type { AppState } from 'reducers'
import { interrupt, calculateWinRate, initResourceLosses } from 'combat'
import { values, showProgress, filterKeys } from 'utils'
import {
  SimulationSpeed,
  Setting,
  Mode,
  CasualtiesProgress,
  ResourceLosses,
  WinRateProgress,
  ResourceLossesProgress,
  CombatSharedSettings
} from 'types'
import { toPercent, toNumber, toFlooredPercent } from 'formatters'
import SimpleRange from 'components/SimpleRange'
import RoundChart from 'components/Charts/RoundChart'
import CumulativePercentChart from 'components/Charts/CumulativePercentChart'
import { changeSiteParameter, refreshBattle } from 'reducers'
import HelpTooltip from 'components/HelpTooltip'
import AccordionToggle from 'containers/AccordionToggle'
import GridSettings from 'components/GridSettings'
import { getMode, getCombatSettings, getInitialSides, getCombatEnvironment } from 'selectors'

interface IState extends CasualtiesProgress {
  attackerWinChance: number
  defenderWinChance: number
  incomplete: number
  draws: number
  calculating: boolean
  battles: number
  updates: number
  progress: number
  averageRounds: number
  stackWipes: number
  rounds: { [key: number]: number }
  lossesA: ResourceLosses
  lossesB: ResourceLosses
}

const DOTS = 6

const simulationSpeeds = values(SimulationSpeed)

const attributes = [Setting.PhasesPerRoll, Setting.ReduceRolls, Setting.MaxPhases, Setting.ChunkSize]
/**
 * Calculates win rate for the current battle.
 */
class Analyze extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = {
      attackerWinChance: 0,
      defenderWinChance: 0,
      incomplete: 0,
      calculating: false,
      progress: 0,
      updates: 0,
      averageRounds: 0,
      rounds: {},
      battles: 0,
      draws: 0,
      stackWipes: 0,
      avgMoraleA: 0,
      avgMoraleB: 0,
      avgStrengthA: 0,
      avgStrengthB: 0,
      maxMoraleA: 1,
      maxMoraleB: 1,
      maxStrengthA: 1,
      maxStrengthB: 1,
      moraleA: {},
      moraleB: {},
      strengthA: {},
      strengthB: {},
      lossesA: initResourceLosses(),
      lossesB: initResourceLosses(),
      winRateA: 0,
      winRateB: 0
    }
  }

  toPercent = (value: number) => toPercent(value, 1)
  toNumber = (value: number) => toNumber(value, 1)

  componentDidMount() {
    // Ensures that the setup is not outdated.
    this.props.refreshBattle()
  }

  willUnmount = false
  componentWillUnmount() {
    this.willUnmount = true
    interrupt()
  }

  render() {
    const { battles, calculating, progress, updates } = this.state
    const { settings, changeSiteParameter, mode } = this.props
    return (
      <>
        <Grid>
          <Grid.Row verticalAlign='middle'>
            <Grid.Column width='4'>
              <Button
                primary
                size='large'
                style={{ width: '120px' }}
                onClick={() => (calculating ? interrupt() : this.calculate())}
              >
                {calculating || progress ? showProgress(toFlooredPercent(progress, 0), updates, DOTS) : 'Analyze'}
              </Button>
            </Grid.Column>
            <Grid.Column width='4'></Grid.Column>
            <Grid.Column width='4'>
              <Header textAlign='center'>Performance: {settings[Setting.Performance] || 'Custom'}</Header>
              <SimpleRange
                min={1}
                max={5}
                step={1}
                value={simulationSpeeds.indexOf(settings[Setting.Performance]) || 3}
                onChange={value => changeSiteParameter(Setting.Performance, simulationSpeeds[value])}
              />
            </Grid.Column>
            <Grid.Column width='2' floated='right'>
              Battles: {battles}
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns='4'>
            <Grid.Column width='4'>
              <Checkbox
                checked={settings[Setting.CalculateWinChance]}
                onChange={(_, { checked }) => changeSiteParameter(Setting.CalculateWinChance, !!checked)}
                label='Win chance'
              />
            </Grid.Column>
            <Grid.Column width='4'>
              <Checkbox
                checked={settings[Setting.CalculateResourceLosses]}
                onChange={(_, { checked }) => changeSiteParameter(Setting.CalculateResourceLosses, !!checked)}
                label='Naval gold losses'
              />
            </Grid.Column>
            <Grid.Column width='4'>
              <Checkbox
                checked={settings[Setting.CalculateCasualties]}
                onChange={(_, { checked }) => changeSiteParameter(Setting.CalculateCasualties, !!checked)}
                label='Casualties'
              />
            </Grid.Column>
            <Grid.Column width='4'>
              <Checkbox
                checked={settings[Setting.ShowGraphs]}
                onChange={(_, { checked }) => changeSiteParameter(Setting.ShowGraphs, !!checked)}
                label='Show graphs'
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
        {settings[Setting.CalculateWinChance] && this.renderWinChance()}
        {settings[Setting.CalculateResourceLosses] && mode === Mode.Naval && this.renderResourceLosses()}
        {settings[Setting.CalculateCasualties] && this.renderCasualties()}
        {settings[Setting.ShowGraphs] && this.renderGraphs()}
        <br />
        <AccordionToggle title='Settings' identifier='AnalyzeSettings' open>
          <GridSettings
            key={settings[Setting.Performance]}
            settings={filterKeys(settings, setting => attributes.includes(setting))}
            onChange={this.changeAnalyzeParameter}
          />
          <br />
          <br />
        </AccordionToggle>
      </>
    )
  }

  changeAnalyzeParameter = (key: keyof CombatSharedSettings, value: string | number | boolean) => {
    const { changeSiteParameter } = this.props
    changeSiteParameter(Setting.Performance, SimulationSpeed.Custom)
    changeSiteParameter(key, value)
  }

  renderWinChance = () => {
    const { attackerWinChance, defenderWinChance, incomplete, draws, averageRounds, stackWipes } = this.state
    return (
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Attacker win chance</Table.HeaderCell>
            <Table.HeaderCell>Defender win chance</Table.HeaderCell>
            <Table.HeaderCell>Draws</Table.HeaderCell>
            <Table.HeaderCell>Incomplete</Table.HeaderCell>
            <Table.HeaderCell>Average rounds</Table.HeaderCell>
            <Table.HeaderCell>Stack wipes</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>{this.toPercent(this.scale(attackerWinChance))}</Table.Cell>
            <Table.Cell>{this.toPercent(this.scale(defenderWinChance))}</Table.Cell>
            <Table.Cell>{this.toPercent(this.scale(draws))}</Table.Cell>
            <Table.Cell>{this.toPercent(this.scale(incomplete))}</Table.Cell>
            <Table.Cell>{this.toNumber(this.scale(averageRounds))}</Table.Cell>
            <Table.Cell>{this.toPercent(this.scale(stackWipes))}</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    )
  }

  renderCasualties = () => {
    const {
      avgMoraleA,
      avgMoraleB,
      avgStrengthA,
      avgStrengthB,
      maxMoraleA,
      maxMoraleB,
      maxStrengthA,
      maxStrengthB
    } = this.state
    return (
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Attacker morale losses</Table.HeaderCell>
            <Table.HeaderCell>Attacker strength losses</Table.HeaderCell>
            <Table.HeaderCell>Defender morale losses</Table.HeaderCell>
            <Table.HeaderCell>Defender strength losses</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>
              {this.toNumber(this.scale(avgMoraleA)) + ' (' + this.toPercent(this.scale(avgMoraleA / maxMoraleA)) + ')'}
            </Table.Cell>
            <Table.Cell>
              {this.toNumber(this.scale(avgStrengthA)) +
                ' (' +
                this.toPercent(this.scale(avgStrengthA / maxStrengthA)) +
                ')'}
            </Table.Cell>
            <Table.Cell>
              {this.toNumber(this.scale(avgMoraleB)) + ' (' + this.toPercent(this.scale(avgMoraleB / maxMoraleB)) + ')'}
            </Table.Cell>
            <Table.Cell>
              {this.toNumber(this.scale(avgStrengthB)) +
                ' (' +
                this.toPercent(this.scale(avgStrengthB / maxStrengthB)) +
                ')'}
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    )
  }

  renderResourceLosses = () => {
    const { lossesA, lossesB: lossesD } = this.state
    const resource = ' gold'
    return (
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Average gold losses</Table.HeaderCell>
            <Table.HeaderCell>Attacker</Table.HeaderCell>
            <Table.HeaderCell>Defender</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>
              Destroyed costs
              <HelpTooltip value='Cost of destroyed units' formula='sum(cost)' />
            </Table.Cell>
            <Table.Cell>
              {this.toNumber(this.scale(lossesA.destroyedCost))}
              {resource}
            </Table.Cell>
            <Table.Cell>
              {this.toNumber(this.scale(lossesD.destroyedCost))}
              {resource}
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>
              Repair costs
              <HelpTooltip
                value='Maintenance cost of repairs for non-captured units'
                formula='sum((1 - capture%) * maintenance * damage / 10%)'
              />
            </Table.Cell>
            <Table.Cell>
              {this.toNumber(this.scale(lossesA.repairMaintenance))}
              {resource}
            </Table.Cell>
            <Table.Cell>
              {this.toNumber(this.scale(lossesD.repairMaintenance))}
              {resource}
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>
              Captured costs
              <HelpTooltip value='Cost of captured units' formula='sum(capture% * cost)' />
            </Table.Cell>
            <Table.Cell>
              {this.toNumber(this.scale(lossesA.capturedCost))}
              {resource}
            </Table.Cell>
            <Table.Cell>
              {this.toNumber(this.scale(lossesD.capturedCost))}
              {resource}
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>
              Enemies captured
              <HelpTooltip value='Cost of captured enemy units' formula='sum(capture% * -cost)' />
            </Table.Cell>
            <Table.Cell>
              {this.toNumber(this.scale(lossesA.seizedCost))}
              {resource}
            </Table.Cell>
            <Table.Cell>
              {this.toNumber(this.scale(lossesD.seizedCost))}
              {resource}
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>
              Repair cost of captured
              <HelpTooltip
                value='Repair cost of captured enemy units'
                formula='sum(capture% * maintenance * damage / 10%)'
              />
            </Table.Cell>
            <Table.Cell>
              {this.toNumber(this.scale(lossesA.seizedRepairMaintenance))}
              {resource}
            </Table.Cell>
            <Table.Cell>
              {this.toNumber(this.scale(lossesD.seizedRepairMaintenance))}
              {resource}
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>
              Total costs
              <HelpTooltip value='Total cost of all gains and losses' />
            </Table.Cell>
            <Table.Cell>
              {this.toNumber(
                this.scale(
                  lossesA.destroyedCost +
                    lossesA.repairMaintenance +
                    lossesA.capturedCost +
                    lossesA.seizedCost +
                    lossesA.seizedRepairMaintenance
                )
              )}
              {resource}
            </Table.Cell>
            <Table.Cell>
              {this.toNumber(
                this.scale(
                  lossesD.destroyedCost +
                    lossesD.repairMaintenance +
                    lossesD.capturedCost +
                    lossesD.seizedCost +
                    lossesD.seizedRepairMaintenance
                )
              )}
              {resource}
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    )
  }

  renderGraphs = () => {
    const {
      progress,
      rounds,
      moraleA,
      moraleB,
      maxMoraleA,
      maxMoraleB,
      strengthA,
      strengthB,
      maxStrengthA,
      maxStrengthB
    } = this.state
    return (
      <Grid>
        <Grid.Row columns='2'>
          <Grid.Column>
            <RoundChart progress={progress} rounds={rounds} />
          </Grid.Column>
          <Grid.Column></Grid.Column>
        </Grid.Row>
        <Grid.Row columns='2'>
          <Grid.Column>
            <CumulativePercentChart
              progress={progress}
              type='morale'
              a={moraleA}
              b={moraleB}
              maxA={maxMoraleA}
              maxB={maxMoraleB}
            />
          </Grid.Column>
          <Grid.Column>
            <CumulativePercentChart
              progress={progress}
              type='strength'
              a={strengthA}
              b={strengthB}
              maxA={maxStrengthA}
              maxB={maxStrengthB}
            />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }

  update = (update: WinRateProgress, casualties: CasualtiesProgress, resources: ResourceLossesProgress) => {
    if (this.willUnmount) return
    const {
      attacker,
      defender,
      incomplete,
      progress,
      averageDays: averageRounds,
      days: rounds,
      battles,
      calculating,
      draws,
      stackWipes
    } = update
    this.setState({
      attackerWinChance: attacker,
      defenderWinChance: defender,
      incomplete,
      draws,
      averageRounds,
      progress,
      calculating,
      rounds,
      stackWipes,
      battles,
      updates: calculating ? (this.state.updates + 1) % DOTS : 0,
      ...casualties,
      ...resources
    })
  }

  calculate = () => {
    const { state } = this.props
    // Initialization done here to reset status.
    const field = getCombatEnvironment(state)
    const [attacker, defender] = getInitialSides(state)
    calculateWinRate(this.update, field, attacker, defender)
  }

  scale = (value: number) => (this.state.progress ? value / this.state.progress : 0)
}

const mapStateToProps = (state: AppState) => {
  return {
    state,
    settings: getCombatSettings(state),
    mode: getMode(state)
  }
}

const actions = { changeSiteParameter, refreshBattle }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends S, D {}

export default connect(mapStateToProps, actions)(Analyze)
