import React, { Component } from 'react'
import { Container, Button, Header, Segment } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { AppState } from '../store/index'
import { reset } from '../store/transfer'

interface IState {
  hasError: boolean
}

/**
 * Global error page to deal with crashes from corrupted data. Also hides bugs.
 */
class Error extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = { hasError: false }
  }

  componentDidCatch() {
    this.setState({ hasError: true })
  }

  render() {
    if (!this.state.hasError)
      return this.props.children
    if (process.env.NODE_ENV === 'development')
      return this.props.children
    return (
      <Container>
        <br/><br/>
        <Segment>
          <Header size='huge'>Something went wrong</Header>
          <Button primary onClick={() => this.reset()}>Click here to reset the simulator</Button>
          <br/><br/>
          <p>If that doesn't help please clear the cache and then force refresh the site.</p>
        </Segment>
      </Container>
    )
  }

  reset() {
    this.props.reset()
    this.setState({ hasError: false })
  }
}

const mapStateToProps = (state: AppState) => ({
})

const mapDispatchToProps = (dispatch: any) => ({
  reset: () => dispatch(reset())
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> { }

export default connect(mapStateToProps, mapDispatchToProps)(Error)
