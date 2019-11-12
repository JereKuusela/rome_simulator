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

interface Props { }

interface IState extends CasualtiesProgress {
  attacker_win_chance: number
  defender_win_chance: number
  draw_chance: number
  incomplete: number
  is_calculating: boolean
  progress: number
  average_rounds: number
  average_rounds_when_attacker_wins: number
  average_rounds_when_defender_wins: number
  rounds: { [key: number]: number }
}

/**
 * Calculates win rate for the current battle.
 */
class Statistics extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = {
      attacker_win_chance: 0, defender_win_chance: 0, draw_chance: 0, incomplete: 0, is_calculating: false, progress: 1,
      average_rounds: 0, average_rounds_when_attacker_wins: 0, average_rounds_when_defender_wins: 0, rounds: {},
      avg_morale_a: 0, avg_morale_d: 0, avg_strength_a: 0, avg_strength_d: 0, max_morale_a: 1, max_morale_d: 1, max_strength_a: 1, max_strength_d: 1,
      morale_a: {}, morale_d: {}, strength_a: {}, strength_d: {}
    }
  }

  toPercent = (value: number) => toPercent(value, 1)
  toNumber = (value: number) => toNumber(value, 1)

  render() {
    const {
      attacker_win_chance, defender_win_chance, draw_chance, incomplete, is_calculating, progress,
      average_rounds, average_rounds_when_attacker_wins, average_rounds_when_defender_wins, rounds,
      avg_morale_a, avg_morale_d, avg_strength_a, avg_strength_d, max_morale_a, max_morale_d, max_strength_a, max_strength_d,
      morale_a, morale_d, strength_a, strength_d
    } = this.state
    return (
      <>
        <Grid>
          <Grid.Row verticalAlign='middle'>
            <Grid.Column width='9'>
              <Button
                primary
                size='large'
                style={{ width: '120px' }}
                onClick={() => is_calculating ? interrupt() : this.calculate()}
              >
                {is_calculating ? this.toPercent(progress) : 'Analyze'}
              </Button>
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
              <Table.HeaderCell>
                When attacker wins
            </Table.HeaderCell>
              <Table.HeaderCell>
                When defender wins
            </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>
                {this.toPercent(attacker_win_chance / progress)}
              </Table.Cell>
              <Table.Cell>
                {this.toPercent(defender_win_chance / progress)}
              </Table.Cell>
              <Table.Cell>
                {this.toPercent(draw_chance / progress)}
              </Table.Cell>
              <Table.Cell>
                {this.toPercent(incomplete / progress)}
              </Table.Cell>
              <Table.Cell>
                {this.toNumber(average_rounds / progress)}
              </Table.Cell>
              <Table.Cell>
                {this.toNumber(average_rounds_when_attacker_wins)}
              </Table.Cell>
              <Table.Cell>
                {this.toNumber(average_rounds_when_defender_wins)}
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
                {this.toNumber(avg_morale_a / progress) + ' (' + this.toPercent(avg_morale_a / max_morale_a / progress) + ')'}
              </Table.Cell>
              <Table.Cell>
                {this.toNumber(avg_strength_a / progress) + ' (' + this.toPercent(avg_strength_a / max_strength_a / progress) + ')'}
              </Table.Cell>
              <Table.Cell>
                {this.toNumber(avg_morale_d / progress) + ' (' + this.toPercent(avg_morale_d / max_morale_d / progress) + ')'}
              </Table.Cell>
              <Table.Cell>
                {this.toNumber(avg_strength_d / progress) + ' (' + this.toPercent(avg_strength_d / max_strength_d / progress) + ')'}
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
    const { attacker, defender, draws, incomplete, progress, average_rounds, attacker_rounds, defender_rounds, rounds } = update
    this.setState({
      attacker_win_chance: attacker,
      defender_win_chance: defender,
      draw_chance: draws,
      incomplete,
      average_rounds,
      average_rounds_when_attacker_wins: attacker_rounds / attacker,
      average_rounds_when_defender_wins: defender_rounds / defender,
      progress: progress,
      is_calculating: progress !== 1,
      rounds,
      ...casualties
    })
  }

  calculate = () => {
    const { units, attacker, defender, units_a, units_d, tactics, combatSettings, terrains, simulationSettings, unit_types } = this.props
    calculateWinRate(simulationSettings, this.update, units, { ...attacker, ...units_a, tactic: tactics[attacker.tactic], country: attacker.name, general: attacker.general.total, roll: 0 }, { ...defender, ...units_d, tactic: tactics[defender.tactic], country: defender.name, general: defender.general.total, roll: 0 }, terrains, unit_types, combatSettings)
  }
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
