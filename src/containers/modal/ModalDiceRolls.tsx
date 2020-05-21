import React, { Component } from 'react'
import { connect } from 'react-redux'
import { ModalType, SideType } from 'types'
import { AppState, getSide, getBattle } from 'state'
import { setPhaseDice, toggleRandomDice, setSeed } from 'reducers'
import { Table, Grid, Checkbox, Input, Header } from 'semantic-ui-react'
import BaseModal from './BaseModal'
import DelayedNumericInput from 'components/Detail/DelayedNumericInput'
import { mapRange } from 'utils'

class ModalDiceRolls extends Component<IProps> {
  render() {
    return (
      <BaseModal type={ModalType.DiceRolls}>
        <Grid>
          <Grid.Row columns='2'>
            <Grid.Column>
              {this.renderIsRollRandom()}
            </Grid.Column>
            <Grid.Column>
              {this.renderSeed()}
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Header>Custom rolls (overrides randomization)</Header>
            {this.renderCustomRolls()}
          </Grid.Row>
        </Grid>
      </BaseModal >
    )
  }

  renderIsRollRandom = () => {
    const { side, isRandom, toggleRandomDice } = this.props
    return (
      <Checkbox label={'Randomize rolls'} toggle checked={isRandom} onClick={() => toggleRandomDice(side)} />
    )
  }

  renderCustomRolls = () => {
    const { side, rolls, setPhaseDice } = this.props
    const rows = Math.ceil((rolls.length - 1) / 4)
    return (
      <Table celled fixed>
        <Table.Body>
          {
            mapRange(rows, row => (
              <Table.Row key={row}>
                {
                  mapRange(4, column => {
                    const phase = row * 4 + column
                    if (phase >= rolls.length)
                      return (<Table.Cell key={phase}></Table.Cell>)
                    return (
                      <Table.Cell key={phase}>
                        Phase {phase + 1}
                        <span style={{ paddingLeft: '1em' }}>
                          <DelayedNumericInput delay={0} value={rolls[phase]}
                            onChange={value => setPhaseDice(side, phase, value)}
                          />
                        </span>
                      </Table.Cell>
                    )
                  })
                }
              </Table.Row>
            ))
          }
        </Table.Body>
      </Table>
    )
  }

  renderSeed = () => {
    return (
      <Input type='number' value={this.props.seed} label='Seed for random generator' onChange={(_, { value }) => this.setSeed(value)} />
    )
  }

  setSeed = (value: string): void => {
    if (!isNaN(Number(value)))
      this.props.setSeed(Number(value))
  }

}

const mapStateToProps = (state: AppState) => {
  const data = state.ui.modals[ModalType.DiceRolls]
  const battle = getBattle(state)
  if (data) {
    const side = getSide(state, data.side)
    return {
      side: data.side,
      rolls: side.rolls.concat(0),
      isRandom: side.randomizeDice,
      seed: battle.seed
    }
  }
  return {
    rolls: [],
    side: SideType.A,
    isRandom: false,
    seed: battle.seed
  }
}

const actions = { setPhaseDice, toggleRandomDice, setSeed }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends S, D { }

export default connect(mapStateToProps, actions)(ModalDiceRolls)
