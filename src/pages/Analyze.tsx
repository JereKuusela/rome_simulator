import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Grid, Button, Table, Header, Checkbox } from 'semantic-ui-react'

import { AppState, getSettings, getMode, getCombatParticipant } from 'state'
import { CasualtiesProgress, ResourceLosses, interrupt, WinRateProgress, ResourceLossesProgress, calculateWinRate, initResourceLosses } from 'combat'
import { values, showProgress } from 'utils'
import { SimulationSpeed, Setting, Side, Mode } from 'types'
import { toPercent, toNumber, toFlooredPercent } from 'formatters'
import SimpleRange from 'components/SimpleRange'
import RoundChart from 'components/Charts/RoundChart'
import CumulativePercentChart from 'components/Charts/CumulativePercentChart'
import { changeSiteParameter, refreshBattle } from 'reducers'
import HelpTooltip from 'components/HelpTooltip'

interface Props { }

interface IState extends CasualtiesProgress {
  attacker_win_chance: number
  defender_win_chance: number
  draw_chance: number
  incomplete: number
  calculating: boolean
  iterations: number
  updates: number
  progress: number
  average_rounds: number
  rounds: { [key: number]: number }
  losses_a: ResourceLosses
  losses_d: ResourceLosses
}

const DOTS = 6

const simulationSpeeds = values(SimulationSpeed)

/**
 * Calculates win rate for the current battle.
 */
class Analyze extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = {
      attacker_win_chance: 0, defender_win_chance: 0, draw_chance: 0, incomplete: 0, calculating: false, progress: 0, updates: 0,
      average_rounds: 0, rounds: {}, iterations: 0,
      avg_morale_a: 0, avg_morale_d: 0, avg_strength_a: 0, avg_strength_d: 0, max_morale_a: 1, max_morale_d: 1, max_strength_a: 1, max_strength_d: 1,
      morale_a: {}, morale_d: {}, strength_a: {}, strength_d: {}, losses_a: initResourceLosses(), losses_d: initResourceLosses()
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
    const { iterations, calculating, progress, updates } = this.state
    const { settings, changeSiteParameter, mode } = this.props
    return (
      <>
        <Grid>
          <Grid.Row verticalAlign='middle'>
            <Grid.Column width='4' >
              <Button
                primary
                size='large'
                style={{ width: '120px' }}
                onClick={() => calculating ? interrupt() : this.calculate()}
              >
                {calculating || progress ? showProgress(toFlooredPercent(progress, 0), updates, DOTS) : 'Analyze'}
              </Button>
            </Grid.Column>
            <Grid.Column width='4'>
            </Grid.Column>
            <Grid.Column width='4'>
              <Header textAlign='center'>Performance: {settings[Setting.Performance] || 'Custom'}</Header>
              <SimpleRange
                min={1} max={5} step={1}
                value={simulationSpeeds.indexOf(settings[Setting.Performance]) || 3}
                onChange={value => changeSiteParameter(Setting.Performance, simulationSpeeds[value])}
              />
            </Grid.Column>
            <Grid.Column width='2' floated='right'>
              Iterations {iterations}
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
        {settings[Setting.CalculateWinChance] && this.renderWinchance()}
        {settings[Setting.CalculateResourceLosses] && mode === Mode.Naval && this.renderResourceLosses()}
        {settings[Setting.CalculateCasualties] && this.renderCasualties()}
        {settings[Setting.ShowGraphs] && this.renderGraphs()}
      </>
    )
  }

  renderWinchance = () => {
    const { attacker_win_chance, defender_win_chance, draw_chance, incomplete, average_rounds } = this.state
    return (
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>
              Attacker win chance
            </Table.HeaderCell>
            <Table.HeaderCell>
              Defender win chance
            </Table.HeaderCell>
            <Table.HeaderCell>
              Draw chance
            </Table.HeaderCell>
            <Table.HeaderCell>
              Incomplete
            </Table.HeaderCell>
            <Table.HeaderCell>
              Average rounds
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>
              {this.toPercent(this.scale(attacker_win_chance))}
            </Table.Cell>
            <Table.Cell>
              {this.toPercent(this.scale(defender_win_chance))}
            </Table.Cell>
            <Table.Cell>
              {this.toPercent(this.scale(draw_chance))}
            </Table.Cell>
            <Table.Cell>
              {this.toPercent(this.scale(incomplete))}
            </Table.Cell>
            <Table.Cell>
              {this.toNumber(this.scale(average_rounds))}
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    )
  }

  renderCasualties = () => {
    const { avg_morale_a, avg_morale_d, avg_strength_a, avg_strength_d, max_morale_a, max_morale_d, max_strength_a, max_strength_d } = this.state
    return (
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>
              Attacker morale losses
           </Table.HeaderCell>
            <Table.HeaderCell>
              Attacker strength losses
           </Table.HeaderCell>
            <Table.HeaderCell>
              Defender morale losses
           </Table.HeaderCell>
            <Table.HeaderCell>
              Defender strength losses
           </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>
              {this.toNumber(this.scale(avg_morale_a)) + ' (' + this.toPercent(this.scale(avg_morale_a / max_morale_a)) + ')'}
            </Table.Cell>
            <Table.Cell>
              {this.toNumber(this.scale(avg_strength_a)) + ' (' + this.toPercent(this.scale(avg_strength_a / max_strength_a)) + ')'}
            </Table.Cell>
            <Table.Cell>
              {this.toNumber(this.scale(avg_morale_d)) + ' (' + this.toPercent(this.scale(avg_morale_d / max_morale_d)) + ')'}
            </Table.Cell>
            <Table.Cell>
              {this.toNumber(this.scale(avg_strength_d)) + ' (' + this.toPercent(this.scale(avg_strength_d / max_strength_d)) + ')'}
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    )
  }

  renderResourceLosses = () => {
    const { losses_a, losses_d } = this.state
    const resource = ' gold'
    return (
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>
              Average gold losses
            </Table.HeaderCell>
            <Table.HeaderCell>
              Attacker
            </Table.HeaderCell>
            <Table.HeaderCell>
              Defender
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>
              Destroyed costs
              <HelpTooltip value='Cost of destroyed units' formula='sum(cost)' />
            </Table.Cell>
            <Table.Cell>
              {this.toNumber(this.scale(losses_a.destroyed_cost))}{resource}
            </Table.Cell>
            <Table.Cell>
              {this.toNumber(this.scale(losses_d.destroyed_cost))}{resource}
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>
              Repair costs
              <HelpTooltip value='Maintenance cost of repairs for non-captured units' formula='sum((1 - capture%) * maintenance * damage / 10%)' />
            </Table.Cell>
            <Table.Cell>
              {this.toNumber(this.scale(losses_a.repair_maintenance))}{resource}
            </Table.Cell>
            <Table.Cell>
              {this.toNumber(this.scale(losses_d.repair_maintenance))}{resource}
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>
              Captured costs
              <HelpTooltip value='Cost of captured units' formula='sum(capture% * cost)' />
            </Table.Cell>
            <Table.Cell>
              {this.toNumber(this.scale(losses_a.captured_cost))}{resource}
            </Table.Cell>
            <Table.Cell>
              {this.toNumber(this.scale(losses_d.captured_cost))}{resource}
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>
              Enemies captured
              <HelpTooltip value='Cost of captured enemy units' formula='sum(capture% * -cost)' />
            </Table.Cell>
            <Table.Cell>
              {this.toNumber(this.scale(losses_a.seized_cost))}{resource}
            </Table.Cell>
            <Table.Cell>
              {this.toNumber(this.scale(losses_d.seized_cost))}{resource}
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>
              Repair cost of captured
              <HelpTooltip value='Repair cost of captured enemy units' formula='sum(capture% * maintenance * damage / 10%)' />
            </Table.Cell>
            <Table.Cell>
              {this.toNumber(this.scale(losses_a.seized_repair_maintenance))}{resource}
            </Table.Cell>
            <Table.Cell>
              {this.toNumber(this.scale(losses_d.seized_repair_maintenance))}{resource}
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>
              Total costs
              <HelpTooltip value='Total cost of all gains and losses' />
            </Table.Cell>
            <Table.Cell>
              {this.toNumber(this.scale(losses_a.destroyed_cost + losses_a.repair_maintenance + losses_a.captured_cost + losses_a.seized_cost + losses_a.seized_repair_maintenance))}{resource}
            </Table.Cell>
            <Table.Cell>
              {this.toNumber(this.scale(losses_d.destroyed_cost + losses_d.repair_maintenance + losses_d.captured_cost + losses_d.seized_cost + losses_d.seized_repair_maintenance))}{resource}
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    )
  }

  renderGraphs = () => {
    const { progress, rounds, morale_a, morale_d, max_morale_a, max_morale_d, strength_a, strength_d, max_strength_a, max_strength_d } = this.state
    return (
      <Grid>
        <Grid.Row columns='2'>
          <Grid.Column>
            <RoundChart progress={progress} rounds={rounds} />
          </Grid.Column>
          <Grid.Column>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row columns='2'>
          <Grid.Column>
            <CumulativePercentChart
              progress={progress} type='morale'
              a={morale_a} d={morale_d} max_a={max_morale_a} max_d={max_morale_d}
            />
          </Grid.Column>
          <Grid.Column>
            <CumulativePercentChart
              progress={progress} type='strength'
              a={strength_a} d={strength_d} max_a={max_strength_a} max_d={max_strength_d}
            />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }

  update = (update: WinRateProgress, casualties: CasualtiesProgress, resources: ResourceLossesProgress) => {
    if (this.willUnmount)
      return
    const { attacker, defender, draws, incomplete, progress, average_rounds, rounds, iterations, calculating } = update
    this.setState({
      attacker_win_chance: attacker,
      defender_win_chance: defender,
      draw_chance: draws,
      incomplete,
      average_rounds,
      progress: progress,
      calculating,
      rounds,
      iterations,
      updates: calculating ? (this.state.updates + 1) % DOTS : 0,
      ...casualties,
      ...resources
    })
  }

  calculate = () => {
    const { attacker, defender, settings } = this.props
    calculateWinRate(settings, this.update, attacker, defender)
  }

  scale = (value: number) => this.state.progress ? value / this.state.progress : 0
}

const mapStateToProps = (state: AppState) => ({
  attacker: getCombatParticipant(state, Side.Attacker, 0),
  defender: getCombatParticipant(state, Side.Defender, 0),
  settings: getSettings(state),
  mode: getMode(state)
})

const actions = { changeSiteParameter, refreshBattle }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends React.PropsWithChildren<Props>, S, D { }

export default connect(mapStateToProps, actions)(Analyze)
