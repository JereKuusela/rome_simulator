import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Grid, Button } from 'semantic-ui-react'

import StyledNumber from '../components/Utils/StyledNumber'

import { AppState } from '../store/'
import { Side } from '../store/battle'
import { getCombatSettings, getSelectedTerrains, mergeUnitTypes, getArmyForCombat } from '../store/utils'

import { toPercent, toFlooredPercent } from '../formatters'
import { calculateWinRate, WinRateProgress, interrupt, doConversion } from '../combat/simulation'
import { showProgress } from '../utils'

interface Props { }

interface IState {
  attacker: number
  defender: number
  calculating: boolean
  progress: number
  updates: number
}

const DOTS = 6
const ATTACKER_COLOR = 'color-attacker'
const DEFENDER_COLOR = 'color-defender'
/**
 * Calculates win rate for the current battle.
 */
class WinRate extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = { attacker: 0, defender: 0, calculating: false, progress: 0, updates: 0 }
  }

  toPercent = (value: number) => toPercent(value, 0)

  willUnmount = false
  componentWillUnmount() {
    this.willUnmount = true
    interrupt()
  }

  render() {
    const { attacker, defender, calculating, progress, updates } = this.state
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
              {calculating || progress ? showProgress(toFlooredPercent(progress, 0), updates, DOTS) : 'Win rate'}
            </Button>
          </Grid.Column>
          <Grid.Column width='7'>
            <Grid style={{ fontSize: '1.25em' }} columns='1' >
              <Grid.Row verticalAlign='middle'>
                <Grid.Column textAlign='center'>
                  <b>Win rate</b>
                  <br />
                  <StyledNumber value={this.scale(attacker)} positive_color={ATTACKER_COLOR} neutral_color={ATTACKER_COLOR} formatter={this.toPercent} />
                  {' / '}
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
    const { attacker, defender, progress, calculating } = update
    this.setState({ attacker, defender, progress, calculating, updates: calculating ? (this.state.updates + 1) % DOTS : 0 })
  }

  calculate = () => {
    const { attacker, defender, combatSettings, terrains, simulationSettings, unit_types } = this.props
    const [ combat_a, combat_d ] = doConversion(attacker, defender, terrains, unit_types, combatSettings)
    calculateWinRate(false, simulationSettings, this.update, combat_a, combat_d, combatSettings)
  }

  scale = (value: number) => this.state.progress ? value / this.state.progress : 0
}

const mapStateToProps = (state: AppState) => ({
  attacker: getArmyForCombat(state, Side.Attacker),
  defender: getArmyForCombat(state, Side.Defender),
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
