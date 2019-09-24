import React, { Component } from 'react'
import { Container, Grid, Input, Table } from 'semantic-ui-react'
import { changeParameter, CombatParameter, parameterToDescription } from '../store/settings'
import { connect } from 'react-redux'
import { AppState } from '../store/index'
import { DefinitionType } from '../base_definition'
import { getSettings } from '../store/utils'
import { toArr } from '../utils'

class Settings extends Component<IProps> {

  render(): JSX.Element {
    return (
      <Container>
        <Grid padded celled>
          <Grid.Row columns='2'>
            {
              toArr(this.props.combat, (value, key) => {
                return (
                  <Grid.Column key={this.props.mode + '_' + key}>
                    <Table basic='very'>
                      <Table.Row>
                        <Table.Cell collapsing >
                          <Input
                            size='mini'
                            style={{ width: 50 }}
                            defaultValue={value}
                            onChange={(_, data) => this.onChange(key, data.value)}
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

  onChange = (key: CombatParameter, value: string) => Number(value) && this.props.changeParameter(this.props.mode, key, Number(value))
}

const mapStateToProps = (state: AppState) => ({
  combat: getSettings(state),
  mode: state.settings.mode
})

const mapDispatchToProps = (dispatch: any) => ({
  changeParameter: (mode: DefinitionType.Land | DefinitionType.Naval, key: CombatParameter, value: number) => dispatch(changeParameter(mode, key, value))
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> { }

export default connect(mapStateToProps, mapDispatchToProps)(Settings)
