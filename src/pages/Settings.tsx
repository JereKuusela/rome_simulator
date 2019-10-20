import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Container, Grid, Input, Table } from 'semantic-ui-react'

import { changeParameter, CombatParameter, parameterToDescription } from '../store/settings'
import { invalidate } from '../store/battle'
import { AppState } from '../store/index'
import { getSettings } from '../store/utils'

import { toArr } from '../utils'

interface Props { }

class Settings extends Component<IProps> {

  render() {
    const { mode, settings } = this.props
    return (
      <Container>
        <Grid padded celled>
          <Grid.Row columns='2'>
            {
              toArr(settings, (value, key) => {
                return (
                  <Grid.Column key={mode + '_' + key}>
                    <Table basic='very'>
                      <Table.Row>
                        <Table.Cell collapsing >
                          <Input
                            size='mini'
                            style={{ width: 50 }}
                            defaultValue={value}
                            onChange={(_, { value }) => this.onChange(key, value)}
                          />
                        </Table.Cell>
                        <Table.Cell key={key + '_description'} style={{ whiteSpace: 'pre-line' }} >
                          {parameterToDescription(key)}
                        </Table.Cell>
                      </Table.Row>
                    </Table>
                  </Grid.Column>
                )
              })
            }
          </Grid.Row>
        </Grid>
      </Container>
    )
  }

  onChange = (key: CombatParameter, str: string) => {
    const value = +str
    if (isNaN(value))
      return
    const { mode, changeParameter, invalidate } = this.props
    changeParameter(mode, key, value)
    invalidate(mode)
  }
}

const mapStateToProps = (state: AppState) => ({
  settings: getSettings(state),
  mode: state.settings.mode
})

const actions = { changeParameter, invalidate }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends React.PropsWithChildren<Props>, S, D { }

export default connect(mapStateToProps, actions)(Settings)
