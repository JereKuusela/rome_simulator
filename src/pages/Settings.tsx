import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Grid, Input, Table } from 'semantic-ui-react'

import { changeCombatParameter, changeSimulationParameter, CombatParameter, parameterToDescription, SimulationParameter } from '../store/settings'
import { invalidate } from '../store/battle'
import { AppState } from '../store/index'
import { getCombatSettings } from '../store/utils'

import { toArr } from '../utils'

interface Props { }

type P = CombatParameter | SimulationParameter

class Settings extends Component<IProps> {

  render() {
    const { combatSettings, simulationSettings } = this.props
    return (
      <Grid padded celled>
        {this.renderRow(combatSettings, this.onCombatChange)}
        {this.renderRow(simulationSettings, this.onSimulationChange)}
      </Grid>
    )
  }

  renderRow = <T extends P>(settings: { [key in T]: number }, onChange: (key: T, str: string) => void) => (
    <Grid.Row columns='2'>
      {
        toArr(settings, (value, key) => {
          return (
            <Grid.Column key={key}>
              <Table basic='very'>
                <Table.Body>
                  <Table.Row>
                    <Table.Cell collapsing >
                      <Input
                        size='mini'
                        style={{ width: 50 }}
                        defaultValue={value}
                        onChange={(_, { value }) => onChange(key, value)}
                      />
                    </Table.Cell>
                    <Table.Cell key={key + '_description'} style={{ whiteSpace: 'pre-line' }} >
                      {parameterToDescription(key)}
                    </Table.Cell>
                  </Table.Row>
                </Table.Body>
              </Table>
            </Grid.Column>
          )
        })
      }
      {
        toArr(settings).length % 2 ? <Grid.Column /> : null
      }
    </Grid.Row>
  )

  onCombatChange = (key: CombatParameter, str: string) => {
    const value = +str
    if (isNaN(value))
      return
    const { mode, changeCombatParameter, invalidate } = this.props
    changeCombatParameter(mode, key, value)
    invalidate(mode)
  }

  onSimulationChange = (key: SimulationParameter, str: string) => {
    const value = +str
    if (isNaN(value))
      return
    const { changeSimulationParameter } = this.props
    changeSimulationParameter(key, value)
  }
}

const mapStateToProps = (state: AppState) => ({
  combatSettings: getCombatSettings(state),
  simulationSettings: state.settings.simulation,
  mode: state.settings.mode
})

const actions = { changeCombatParameter, changeSimulationParameter, invalidate }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends React.PropsWithChildren<Props>, S, D { }

export default connect(mapStateToProps, actions)(Settings)
