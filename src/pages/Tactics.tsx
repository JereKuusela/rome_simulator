import { Map } from 'immutable'
import React, { Component } from 'react'
import { Container } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { AppState } from '../store/index'
import { setTacticModal } from '../store/layout'
import { TableTacticDefinitions } from '../components/TableTacticDefinitions'
import { TacticDefinition, TacticType } from '../store/tactics'


interface IStateFromProps {
  readonly tactics: Map<TacticType, TacticDefinition>
}
interface IDispatchFromProps {
  editTactic: (tactic: TacticDefinition) => void
}
interface IProps extends IStateFromProps, IDispatchFromProps { }

class Tactics extends Component<IProps> {

  render() {
    return (
      <Container>
        {
          <TableTacticDefinitions
            tactics={this.props.tactics.toList()}
            onRowClick={tactic => this.props.editTactic(tactic)}
          />
        }
      </Container>
    )
  }
}

const mapStateToProps = (state: AppState): IStateFromProps => ({
  tactics: state.tactics.tactics
})

const mapDispatchToProps = (dispatch: any): IDispatchFromProps => ({
  editTactic: tactic => dispatch(setTacticModal(tactic))
})

export default connect(mapStateToProps, mapDispatchToProps)(Tactics)
