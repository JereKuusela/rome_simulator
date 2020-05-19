import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Grid, Button, List } from 'semantic-ui-react'

import StyledNumber from 'components/Utils/StyledNumber'

import { AppState, getSettings, initializeCombatParticipants } from 'state'
import { toPercent, toFlooredPercent, toNumber, toSignedPercent } from 'formatters'
import { interrupt, calculateWinRate } from 'combat'
import { showProgress } from 'utils'
import { Setting, WinRateProgress, CasualtiesProgress } from 'types'
import Tooltip from 'components/Tooltip'

interface Props { }

type IState = {
  attacker: number
  defender: number
  draws: number
  incomplete: number
  calculating: boolean
  progress: number
  updates: number
  battles: number
  avgStrengthA: number
  maxStrengthA: number
  avgStrengthD: number
  maxStrengthD: number
  winRateA: number
  winRateD: number
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
    this.state = {
      attacker: 0, defender: 0, calculating: false, progress: 0, updates: 0, draws: 0, incomplete: 0, battles: 0,
      avgStrengthA: 0, maxStrengthA: 0, avgStrengthD: 0, maxStrengthD: 0, winRateA: 0, winRateD: 0
    }
  }

  toPercent = (value: number) => toPercent(value, 0)
  toTooltipPercent = (value: number) => toPercent(value, 1)
  toSignedTooltipPercent = (value: number) => toSignedPercent(value, 1)
  toTooltipNumber = (value: number) => toNumber(value, 3)

  willUnmount = false
  componentWillUnmount() {
    this.willUnmount = true
    interrupt()
  }

  render() {
    const {
      attacker, defender, calculating, progress, updates, draws, incomplete,
      avgStrengthA, maxStrengthA, avgStrengthD, maxStrengthD
    } = this.state
    return (
      <Grid>
        <Grid.Row verticalAlign='middle'>
          <Grid.Column width='5'>
            <Tooltip getContent={this.getInfoTooltip}>
              <Button
                primary
                size='large'
                style={{ width: '120px' }}
                onClick={() => calculating ? interrupt() : this.calculate()}
              >
                {calculating ? showProgress(toFlooredPercent(progress, 0), updates, DOTS) : 'Analyze'}
              </Button>
            </Tooltip>
          </Grid.Column>
          <Grid.Column width='11'>
            <Grid style={{ fontSize: '1.25em' }}>
              <Grid.Row verticalAlign='middle' columns='2'>
                <Grid.Column textAlign='center'>
                  <Tooltip getContent={this.getWinChanceTooltip}>
                    <span>
                      <b>Win rate</b>
                      <br />
                      <StyledNumber value={this.scale(attacker + draws / 2 + incomplete / 2)} positiveColor={ATTACKER_COLOR} neutralColor={ATTACKER_COLOR} formatter={this.toPercent} />
                      {' / '}
                      <StyledNumber value={this.scale(defender + draws / 2 + incomplete / 2)} positiveColor={DEFENDER_COLOR} neutralColor={DEFENDER_COLOR} formatter={this.toPercent} />
                    </span>
                  </Tooltip>
                </Grid.Column>
                <Grid.Column textAlign='center'>
                  <Tooltip getContent={this.getCasualtiesTooltip}>
                    <span>
                      <b>Losses</b>
                      <br />
                      <StyledNumber value={this.scale(avgStrengthA / maxStrengthA)} positiveColor={ATTACKER_COLOR} neutralColor={ATTACKER_COLOR} formatter={this.toPercent} />
                      {' / '}
                      <StyledNumber value={this.scale(avgStrengthD / maxStrengthD)} positiveColor={DEFENDER_COLOR} neutralColor={DEFENDER_COLOR} formatter={this.toPercent} />
                    </span>
                  </Tooltip>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }

  getInfoTooltip = () => {
    return (
      <div>
        <p>The win rate is calculated by doing thousands of battles with different dice rolls.</p>
        <p>Check Analyze page for more stats or to change speed/accuracy of calculations.</p>
        <p>For larges battles it's recommended to manually reduce combat width from Settings page while reducing amount of units.</p>
      </div>
    )
  }

  getWinChanceTooltip = () => {
    const { attacker, defender, draws, incomplete, battles } = this.state
    return (
      <div>
        <List>
          <List.Item>
            Attacker: {<StyledNumber value={this.scale(attacker)} positiveColor={ATTACKER_COLOR} neutralColor={ATTACKER_COLOR} formatter={this.toTooltipPercent} />}
          </List.Item>
          <List.Item>
            Defender: {<StyledNumber value={this.scale(defender)} positiveColor={DEFENDER_COLOR} neutralColor={DEFENDER_COLOR} formatter={this.toTooltipPercent} />}
          </List.Item>
          {
            this.scale(draws) > 0.0005 ?
              <List.Item>
                Draws: {this.toTooltipPercent(this.scale(draws))}
              </List.Item>
              : null
          }
          {
            this.scale(incomplete) > 0.0005 ?
              <List.Item>
                Incomplete: {this.toTooltipPercent(this.scale(incomplete))}
              </List.Item>
              : null
          }
        </List>
        <List.Item>
          Battles: {battles}
        </List.Item>
      </div>
    )
  }

  getCasualtiesTooltip = () => {
    const { winRateA, winRateD, battles, avgStrengthA, maxStrengthA, avgStrengthD, maxStrengthD } = this.state
    return (
      <div>
        <List>
          <List.Item>
            Attacker:{' '}
            {<StyledNumber value={this.scale(avgStrengthA / maxStrengthA)} positiveColor={ATTACKER_COLOR} neutralColor={ATTACKER_COLOR} formatter={this.toTooltipPercent} />}
            {' ('}
            {<StyledNumber value={this.scale(avgStrengthA)} positiveColor={ATTACKER_COLOR} neutralColor={ATTACKER_COLOR} formatter={this.toTooltipNumber} />}
            {')'}
          </List.Item>
          <List.Item>
            Defender:{' '}
            {<StyledNumber value={this.scale(avgStrengthD / maxStrengthD)} positiveColor={DEFENDER_COLOR} neutralColor={DEFENDER_COLOR} formatter={this.toTooltipPercent} />}
            {' ('}
            {<StyledNumber value={this.scale(avgStrengthD)} positiveColor={DEFENDER_COLOR} neutralColor={DEFENDER_COLOR} formatter={this.toTooltipNumber} />}
            {')'}
          </List.Item>
          <List.Item>
            Casualties win rate:{' '}
            {<StyledNumber value={this.scale(winRateA)} positiveColor={ATTACKER_COLOR} neutralColor={ATTACKER_COLOR} formatter={this.toTooltipPercent} />}
            {' / '}
            {<StyledNumber value={this.scale(winRateD)} positiveColor={DEFENDER_COLOR} neutralColor={DEFENDER_COLOR} formatter={this.toTooltipPercent} />}
          </List.Item>
          <List.Item>
            Casualties balance:{' '}
            {<StyledNumber reverse value={avgStrengthA / avgStrengthD - 1} formatter={this.toSignedTooltipPercent} />}
            {' / '}
            {<StyledNumber reverse value={avgStrengthD / avgStrengthA - 1} formatter={this.toSignedTooltipPercent} />}
          </List.Item>
        </List>
        <List.Item>
          Battles: {battles}
        </List.Item>
      </div>
    )
  }

  update = (update: WinRateProgress, casualties: CasualtiesProgress) => {
    if (this.willUnmount)
      return
    const { attacker, defender, progress, calculating, draws, incomplete, battles } = update
    this.setState({
      attacker, defender, progress, calculating, draws, incomplete, updates: calculating ? (this.state.updates + 1) % DOTS : 0, battles,
      ...casualties
    })
  }

  calculate = () => {
    const { state } = this.props
    // Initialization done here to prevent it happening on every render.
    const [attacker, defender] = initializeCombatParticipants(state)
    const settings = getSettings(state)
    const modifiedSettings = { ...settings, [Setting.CalculateWinChance]: true, [Setting.CalculateCasualties]: true, [Setting.CalculateResourceLosses]: false }
    calculateWinRate(modifiedSettings, this.update, attacker, defender)
  }

  scale = (value: number) => this.state.progress ? value / this.state.progress : 0
}

const mapStateToProps = (state: AppState) => ({ state })

const actions = {}

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends React.PropsWithChildren<Props>, S, D { }

export default connect(mapStateToProps, actions)(WinRate)
