import React, { Component } from 'react'
import { Container, Grid, Input, Table } from 'semantic-ui-react'
import { changeParamater, CombatParameter, parameterToDescription } from '../store/settings'
import { connect } from 'react-redux'
import { AppState } from '../store/index'

class Settings extends Component<IProps> {
  render(): JSX.Element {
    return (
      <Container>
        <Grid padded celled>
          <Grid.Row columns='2'>
            {
              this.props.combat.map((value, key) => {
                return (
                  <Grid.Column key={key}>
                    <Table basic='very'>
                      <Table.Row>
                        <Table.Cell key={key + '_input'} collapsing >
                          <Input
                            size='mini'
                            style={{ width: 50 }}
                            defaultValue={value}
                            onChange={(_, data) => Number(data.value) && this.props.changeParamater(key, Number(data.value))}
                          />
                        </Table.Cell>
                        <Table.Cell key={key + '_description'} style={{ whiteSpace: 'pre-line' }} >
                          {parameterToDescription(key)}
                        </Table.Cell>
                      </Table.Row>
                    </Table>
                  </Grid.Column>
                )
              }).toList()
            }
          </Grid.Row>
        </Grid>
      </Container>
    )
  }
}

const mapStateToProps = (state: AppState) => ({
  combat: state.settings.combat
})

const mapDispatchToProps = (dispatch: any) => ({
  changeParamater: (key: CombatParameter, value: number) => dispatch(changeParamater(key, value))
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> { }

export default connect(mapStateToProps, mapDispatchToProps)(Settings)
