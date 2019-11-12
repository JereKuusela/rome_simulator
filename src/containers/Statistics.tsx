import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Grid, Button, Table } from 'semantic-ui-react'

import { AppState } from '../store/'
import { Side } from '../store/battle'
import { getArmyBySide, getCombatSettings, getSelectedTerrains, getUnits, mergeUnitTypes } from '../store/utils'

import { toPercent, toNumber } from '../formatters'
import { calculateWinRate, WinRateProgress, interrupt, CasualtiesProgress } from '../combat/simulation'
import RoundChart from '../components/Charts/RoundChart'
import CumulativePercentChart from '../components/Charts/CumulativePercentChart'
import { showProgress } from '../utils'

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
}

const DOTS = 6

/**
 * Calculates win rate for the current battle.
 */
class Statistics extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = {
      attacker_win_chance: 0, defender_win_chance: 0, draw_chance: 0, incomplete: 0, calculating: false, progress: 0, updates: 0,
      average_rounds: 0, rounds: {}, iterations: 0,
      avg_morale_a: 0, avg_morale_d: 0, avg_strength_a: 0, avg_strength_d: 0, max_morale_a: 1, max_morale_d: 1, max_strength_a: 1, max_strength_d: 1,
      morale_a: {}, morale_d: {}, strength_a: {}, strength_d: {}
    }
  }

  toPercent = (value: number) => toPercent(value, 1)
  toNumber = (value: number) => toNumber(value, 1)

  willUnmount = false
  componentWillUnmount() {
    this.willUnmount = true
    interrupt()
  }

  render() {
    const {
      attacker_win_chance, defender_win_chance, draw_chance, incomplete, calculating, progress, updates,
      average_rounds, rounds, iterations,
      avg_morale_a, avg_morale_d, avg_strength_a, avg_strength_d, max_morale_a, max_morale_d, max_strength_a, max_strength_d,
      morale_a, morale_d, strength_a, strength_d
    } = this.state
    return (
      <>
        <Grid>
          <Grid.Row verticalAlign='middle'>
            <Grid.Column width='9' >
              <Button
                primary
                size='large'
                style={{ width: '120px' }}
                onClick={() => calculating ? interrupt() : this.calculate()}
              >
                {calculating || progress ? showProgress(this.toPercent(progress), updates, DOTS) : 'Analyze'}
              </Button>
            </Grid.Column>
            <Grid.Column width='2' floated='right'>
              Iterations {iterations}
            </Grid.Column>
          </Grid.Row>
        </Grid>
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
      </>
    )
  }

  update = (update: WinRateProgress, casualties: CasualtiesProgress) => {
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
      ...casualties
    })
  }

  calculate = () => {
    const { units, attacker, defender, units_a, units_d, tactics, combatSettings, terrains, simulationSettings, unit_types } = this.props
    calculateWinRate(simulationSettings, this.update, units, { ...attacker, ...units_a, tactic: tactics[attacker.tactic], country: attacker.name, general: attacker.general.total, roll: 0 }, { ...defender, ...units_d, tactic: tactics[defender.tactic], country: defender.name, general: defender.general.total, roll: 0 }, terrains, unit_types, combatSettings)
  }

  scale = (value: number) => this.state.progress ? value / this.state.progress : 0
}

const mapStateToProps = (state: AppState) => ({
  units: state.units,
  tactics: state.tactics,
  attacker: getArmyBySide(state, Side.Attacker),
  defender: getArmyBySide(state, Side.Defender),
  units_a: getUnits(state, Side.Attacker),
  units_d: getUnits(state, Side.Defender),
  combatSettings: getCombatSettings(state),
  simulationSettings: state.settings.simulation,
  terrains: getSelectedTerrains(state),
  unit_types: mergeUnitTypes(state)
})

const actions = {}

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends React.PropsWithChildren<Props>, S, D { }

export default connect(mapStateToProps, actions)(Statistics)
