import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Grid, Button } from 'semantic-ui-react'

import StyledNumber from '../components/Utils/StyledNumber'

import { AppState } from '../store/'
import { Side } from '../store/battle'
import { getArmyBySide, getCombatSettings, getSelectedTerrains, getUnits } from '../store/utils'

import { toPercent } from '../formatters'
import { calculateWinRate, WinRateProgress, interrupt } from '../combat/simulation'

interface Props { }

interface IState {
  attacker: number
  defender: number
  draws: number
  calculating: boolean
  progress: number
}
const ATTACKER_COLOR = 'color-attacker'
const DEFENDER_COLOR = 'color-defender'
const DRAW_COLOR = 'color-draw'
/**
 * Calculates win rate for the current battle.
 */
class WinRate extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = { attacker: 0, defender: 0, draws: 0, calculating: false, progress: 0 }
  }

  toPercent = (value: number) => toPercent(value, 0)

  render() {
    const { attacker, defender, draws, calculating, progress } = this.state
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
              {calculating ? this.toPercent(progress) : 'Win rate'}
            </Button>
          </Grid.Column>
          <Grid.Column width='7'>
            <Grid style={{ fontSize: '1.25em' }} columns='3'>
              <Grid.Row verticalAlign='middle'>
                <Grid.Column>
                  <StyledNumber value={attacker} positive_color={ATTACKER_COLOR} neutral_color={ATTACKER_COLOR} formatter={this.toPercent} />
                </Grid.Column>
                <Grid.Column>
                  <StyledNumber value={draws} positive_color={DRAW_COLOR} neutral_color={DRAW_COLOR} formatter={this.toPercent} />
                </Grid.Column>
                <Grid.Column>
                  <StyledNumber value={defender} positive_color={DEFENDER_COLOR} neutral_color={DEFENDER_COLOR} formatter={this.toPercent} />
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }

  update = (update: WinRateProgress) => {
    const { attacker, defender, draws, incomplete, progress } = update
    this.setState({ attacker: attacker, defender: defender, draws: draws + incomplete, progress: progress, calculating: progress !== 1 })
  }

  calculate = () => {
    const { units, attacker, defender, units_a, units_d, tactics, combatSettings: settings, terrains, simulationSettings } = this.props
    calculateWinRate(simulationSettings, this.update, units, { ...attacker, ...units_a, tactic: tactics[attacker.tactic], country: attacker.name, general: attacker.general.total, roll: 0 }, { ...defender, ...units_d, tactic: tactics[defender.tactic], country: defender.name, general: defender.general.total, roll: 0 }, terrains, settings)
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
  terrains: getSelectedTerrains(state)
})

const actions = {}

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends React.PropsWithChildren<Props>, S, D { }

export default connect(mapStateToProps, actions)(WinRate)