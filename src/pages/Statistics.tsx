import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Grid, Button, Table, Header, Checkbox } from 'semantic-ui-react'

import { AppState } from '../store/'
import { Side } from '../store/battle'
import { getCombatSettings, getSelectedTerrains, mergeUnitTypes, getArmyForCombat } from '../store/utils'
import { changeSimulationParameter } from '../store/settings'

import { toPercent, toNumber, toFlooredPercent } from '../formatters'
import { calculateWinRate, WinRateProgress, interrupt, CasualtiesProgress, doConversion } from '../combat/simulation'
import RoundChart from '../components/Charts/RoundChart'
import CumulativePercentChart from '../components/Charts/CumulativePercentChart'
import { showProgress } from '../utils'
import SimpleRange from '../components/SimpleRange'
import { SimulationParameter } from '../store/settings'

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
    const { simulation_settings, changeSimulationParameter } = this.props
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
              <Checkbox
                value={simulation_settings[SimulationParameter.UpdateCasualties]}
                onChange={(_, { value }) => changeSimulationParameter(SimulationParameter.UpdateCasualties, value ? 0 : 1)}
                label='Update casualties'
              />
            </Grid.Column>
            <Grid.Column width='4'>
              <Header textAlign='center'>Speed: {simulation_settings[SimulationParameter.Speed] || 'Custom'}</Header>
              <SimpleRange
                min={1} max={5} step={1}
                value={simulation_settings[SimulationParameter.Speed] || 1}
                onChange={value => changeSimulationParameter(SimulationParameter.Speed, value)}
              />
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
        {simulation_settings[SimulationParameter.UpdateCasualties] ?
          <>
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
          </> : null}
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
    const { attacker, defender, combat_settings: combatSettings, terrains, simulation_settings, unit_types } = this.props
    const [combat_a, combat_d] = doConversion(attacker, defender, terrains, unit_types, combatSettings)
    calculateWinRate(!!simulation_settings[SimulationParameter.UpdateCasualties], simulation_settings, this.update, combat_a, combat_d, combatSettings)
  }

  scale = (value: number) => this.state.progress ? value / this.state.progress : 0
}

const mapStateToProps = (state: AppState) => ({
  attacker: getArmyForCombat(state, Side.Attacker),
  defender: getArmyForCombat(state, Side.Defender),
  combat_settings: getCombatSettings(state),
  simulation_settings: state.settings.simulation,
  terrains: getSelectedTerrains(state),
  unit_types: mergeUnitTypes(state)
})

const actions = { changeSimulationParameter }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends React.PropsWithChildren<Props>, S, D { }

export default connect(mapStateToProps, actions)(Statistics)
