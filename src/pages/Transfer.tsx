import React, { Component } from 'react'
import { Container, Grid, TextArea } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { AppState } from '../store/index'

class Transfer extends Component<IProps> {

  render() {
    const json = JSON.stringify(this.props.state, undefined, 2)
    return (
      <Container>
        <Grid>
          <Grid.Row columns='2'>
            <Grid.Column>
              
            </Grid.Column>
            <Grid.Column >
            <TextArea value={json} rows='30' style={{width: '100%'}}/>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container >
    )
  }
}

const mapStateToProps = (state: AppState) => ({
  state: state
})

const mapDispatchToProps = (dispatch: any) => ({
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> { }

export default connect(mapStateToProps, mapDispatchToProps)(Transfer)
