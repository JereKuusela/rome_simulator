import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Grid, Button } from 'semantic-ui-react'

import StyledNumber from '../components/Utils/StyledNumber'

import { AppState } from '../store/'
import { Side } from '../store/battle'
import { getArmyBySide, getCombatSettings, getSelectedTerrains, getUnits, mergeUnitTypes } from '../store/utils'

import { toPercent } from '../formatters'
import { calculateWinRate, WinRateProgress, interrupt } from '../combat/simulation'
import { showProgress } from '../utils'

interface Props { }

interface IState {
  attacker: number
  defender: number
  draws: number
  calculating: boolean
  progress: number
  updates: number
}

const DOTS = 6
const ATTACKER_COLOR = 'color-attacker'
const DEFENDER_COLOR = 'color-defender'
const DRAW_COLOR = 'color-draw'
/**
 * Calculates win rate for the current battle.
 */
class WinRate extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = { attacker: 0, defender: 0, draws: 0, calculating: false, progress: 0, updates: 0 }
  }

  toPercent = (value: number) => toPercent(value, 0)

  willUnmount = false
  componentWillUnmount() {
    this.willUnmount = true
    interrupt()
  }

  render() {
    const { attacker, defender, draws, calculating, progress, updates } = this.state
    return (
      <Grid>
        <Grid.Row verticalAlign='middle'>
          <Grid.Column width='9'>
            <Button
              primary
              size='large'
              style={{ width: '120px' }}
              onClick={() => calculating ? interrupt() : this.calculate()}
            >
              {calculating || progress ? showProgress(this.toPercent(progress), updates, DOTS) : 'Win rate'}
            </Button>
          </Grid.Column>
          <Grid.Column width='7'>
            <Grid style={{ fontSize: '1.25em' }} columns='3'>
              <Grid.Row verticalAlign='middle'>
                <Grid.Column>
                  <StyledNumber value={this.scale(attacker)} positive_color={ATTACKER_COLOR} neutral_color={ATTACKER_COLOR} formatter={this.toPercent} />
                </Grid.Column>
                <Grid.Column>
                  <StyledNumber value={this.scale(draws)} positive_color={DRAW_COLOR} neutral_color={DRAW_COLOR} formatter={this.toPercent} />
                </Grid.Column>
                <Grid.Column>
                  <StyledNumber value={this.scale(defender)} positive_color={DEFENDER_COLOR} neutral_color={DEFENDER_COLOR} formatter={this.toPercent} />
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }

  update = (update: WinRateProgress) => {
    if (this.willUnmount)
      return
    const { attacker, defender, draws, incomplete, progress, calculating } = update
    this.setState({ attacker, defender, draws: draws + incomplete, progress, calculating, updates: calculating ? (this.state.updates + 1) % DOTS : 0 })
  }

  calculate = () => {
    const { units, attacker, defender, units_a, units_d, tactics, combatSettings: settings, terrains, simulationSettings, unit_types } = this.props
    calculateWinRate(simulationSettings, this.update, units, { ...attacker, ...units_a, tactic: tactics[attacker.tactic], country: attacker.name, general: attacker.general.total, roll: 0 }, { ...defender, ...units_d, tactic: tactics[defender.tactic], country: defender.name, general: defender.general.total, roll: 0 }, terrains, unit_types, settings)
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

export default connect(mapStateToProps, actions)(WinRate)
