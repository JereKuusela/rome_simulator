import React, { Component } from 'react'
import { Button, Header, Segment } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { AppState } from 'state'
import { saveToFile, exportState } from 'managers/transfer_manager'
import { reset } from 'reducers'

type State = {
  hasError: boolean
}

type Props = {}

/**
 * Global error page to deal with crashes from corrupted data. Also hides bugs.
 */
class Error extends Component<IProps, State> {
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
      <>
        <br/><br/>
        <Segment>
          <Header size='huge'>Something went wrong</Header>
          <Button primary onClick={() => this.download()}>Click here to download current data</Button>
          <Button primary onClick={() => this.reset()}>Click here to reset the simulator</Button>
          <br/><br/>
          <p>If that doesn't help please clear the cache and then force refresh the site.</p>
        </Segment>
      </>
    )
  }

  reset = () => {
    this.props.reset()
    this.setState({ hasError: false })
  }

  download = () => saveToFile(exportState(this.props.state))
}

const mapStateToProps = (state: AppState) => ({
  state
})

const actions = { reset }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends Props, S, D { }

export default connect(mapStateToProps, actions)(Error)
