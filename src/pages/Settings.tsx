import React, { Component } from 'react'
import { Container, Grid, Input } from 'semantic-ui-react'
import { changeParamater, CombatParameter } from '../store/settings'
import { connect } from 'react-redux'
import { AppState } from '../store/index'

class Settings extends Component<IProps> {
  render(): JSX.Element {
    return (
      <Container>
        <Grid padded>
          <Grid.Row columns='3'>
            {
              this.props.combat.map((value, key) => {
                return (
                  <Grid.Column key={key}>
                    {key}
                    <div style={{float:'right'}}>
                    <Input
                      size='mini'
                      style={{ width: 50 }}
                      defaultValue={value}
                      onChange={(_, data) => Number(data.value) && this.props.changeParamater(key, Number(data.value))}
                    />
                    </div>
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
