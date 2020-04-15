import React, { Component } from 'react'
import { connect } from 'react-redux'
import { ModalType, Side } from 'types'
import { AppState, getParticipant } from 'state'
import { setPhaseDice } from 'reducers'
import { Table } from 'semantic-ui-react'
import BaseModal from './BaseModal'
import DelayedNumericInput from 'components/Detail/DelayedNumericInput'
import { mapRange } from 'utils'

class ModalDiceRolls extends Component<IProps> {
  render() {
    const { side, rolls, setPhaseDice } = this.props
    const rows = Math.ceil((rolls.length - 1) / 4)
    return (
      <BaseModal type={ModalType.DiceRolls}>
        <Table celled fixed>
          <Table.Body>
            {
              mapRange(rows, row => (
                <Table.Row key={row}>
                  {
                    mapRange(4, column => {
                      const phase = row * 4 + column + 1
                      if (phase >= rolls.length)
                        return (<Table.Cell key={phase}></Table.Cell>)
                      return (
                        <Table.Cell key={phase}>
                          Phase {phase}
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
      </BaseModal >
    )
  }
}

const mapStateToProps = (state: AppState) => {
  const data = state.ui.modals[ModalType.DiceRolls]
  if (data) {
    return {
      side: data.side,
      rolls: getParticipant(state, data.side).rolls.concat(0)
    }
  }
  return {
    rolls: [],
    side: Side.Attacker
  }
}

const actions = { setPhaseDice }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends S, D { }

export default connect(mapStateToProps, actions)(ModalDiceRolls)
