import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Grid, Button, Table, Header } from 'semantic-ui-react'
import { VictoryChart, VictoryAxis, VictoryTheme, VictoryArea, VictoryVoronoiContainer } from 'victory'

import { AppState } from '../store/'
import { Side } from '../store/battle'
import { getArmyBySide, getCombatSettings, getSelectedTerrains, getUnits, mergeUnitTypes } from '../store/utils'

import { toPercent, toNumber } from '../formatters'
import { calculateWinRate, WinRateProgress, interrupt, CasualtiesProgress } from '../combat/simulation'
import { toArr, mapRange } from '../utils'

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
  rounds_label: string
}

interface Datum {
  count: number
  childName: string
  round: number
}

const CUMULATIVE = 'CUMULATIVE'
const VALUES = 'VALUES'

/**
 * Calculates win rate for the current battle.
 */
class Statistics extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = {
      attacker_win_chance: 0, defender_win_chance: 0, draw_chance: 0, incomplete: 0, is_calculating: false, progress: 1,
      average_rounds: 0, average_rounds_when_attacker_wins: 0, average_rounds_when_defender_wins: 0, rounds: {},
      morale_a: 0, morale_d: 0, strength_a: 0, strength_d: 0, max_morale_a: 1, max_morale_d: 1, max_strength_a: 1, max_strength_d: 1,
      rounds_label: ''
    }
  }

  toPercent = (value: number) => toPercent(value, 1)
  toNumber = (value: number) => toNumber(value, 1)

  render() {
    const {
      attacker_win_chance, defender_win_chance, draw_chance, incomplete, is_calculating, progress,
      average_rounds, average_rounds_when_attacker_wins, average_rounds_when_defender_wins, rounds,
      morale_a, morale_d, strength_a, strength_d, max_morale_a, max_morale_d, max_strength_a, max_strength_d,
      rounds_label
    } = this.state
    const values = toArr(rounds, (count, round) => ({ round: Number(round), count }))
    const cumulative = []
    let count = 0
    for (let i = 0; i < values.length; i++) {
      count += values[i].count
      cumulative.push({ round: values[i].round, count })
    }
    const ticks = mapRange(cumulative.length ? cumulative[cumulative.length - 1].round + 1 : 11, value => value)

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
          </Table.Header>
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
        </Table>
        <Table>
          <Table.Header>
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
          </Table.Header>
          <Table.Row>
            <Table.Cell>
              {this.toNumber(morale_a / progress) + ' (' + this.toPercent(morale_a / max_morale_a / progress) + ')'}
            </Table.Cell>
            <Table.Cell>
              {this.toNumber(strength_a / progress) + ' (' + this.toPercent(strength_a / max_strength_a / progress) + ')'}
            </Table.Cell>
            <Table.Cell>
              {this.toNumber(morale_d / progress) + ' (' + this.toPercent(morale_d / max_morale_d / progress) + ')'}
            </Table.Cell>
            <Table.Cell>
              {this.toNumber(strength_d / progress) + ' (' + this.toPercent(strength_d / max_strength_d / progress) + ')'}
            </Table.Cell>
          </Table.Row>
        </Table>
        <Grid>
          <Grid.Row columns='2'>
            <Grid.Column>
              <Header textAlign='center' size='huge'>Rounds</Header>
              <Header textAlign='center' >{rounds_label}</Header>
              <VictoryChart
                containerComponent={
                  <VictoryVoronoiContainer
                    labels={({ datum }) => `Round ${datum.round}: ${this.toPercent(datum.count)}`}
                    onActivated={this.onActivated}
                  />
                }
                theme={VictoryTheme.material}
                domainPadding={10}
                padding={{ top: 25, left: 50, bottom: 30, right: 50 }}
              >
                <VictoryAxis
                  tickValues={ticks}
                />
                <VictoryAxis
                  dependentAxis
                  tickFormat={(x) => (`${x * 100}%`)}
                />
                <VictoryArea
                  interpolation="natural"
                  data={cumulative}
                  style={{
                    data: { fill: "grey" }
                  }}
                  x="round"
                  y="count"
                  name={CUMULATIVE}
                />
                <VictoryArea
                  interpolation="natural"
                  data={values}
                  style={{
                    data: { fill: "black" }
                  }}
                  x="round"
                  y="count"
                  name={VALUES}
                />
              </VictoryChart>
            </Grid.Column>
            <Grid.Column>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </>
    )
  }

  onActivated = (datums: Datum[]) => {
    if (datums.length) {
      const datum = datums[0]
      const rounds_label = this.getTooltip(datum)
      this.setState({ rounds_label })
    }
  }

  getTooltip = (datum: Datum) => {
    if (datum.childName === VALUES)
      return `${this.toPercent(datum.count)} of battles end at round ${datum.round}`
    if (datum.childName === CUMULATIVE)
      return `${this.toPercent(datum.count)} of battles end during ${datum.round} rounds`
    return ''
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
