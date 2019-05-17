import { Map } from 'immutable'
import React, { Component } from 'react'
import { Container } from 'semantic-ui-react'
import { connect } from 'react-redux'
import ModalTacticDetail from '../containers/ModalTacticDetail'
import { AppState } from '../store/index'
import { TableTacticDefinitions } from '../components/TableTacticDefinitions'
import { TacticDefinition, TacticType } from '../store/tactics'


interface IStateFromProps {
  readonly tactics: Map<TacticType, TacticDefinition>
}
interface IDispatchFromProps {
}
interface IProps extends IStateFromProps, IDispatchFromProps { }

interface IState {
  modal_tactic: TacticType | null
}

class Tactics extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props)
    this.state = { modal_tactic: null };
  }

  closeModal = () => this.setState({modal_tactic: null})
  
  openModal = (tactic: TacticType) => this.setState({modal_tactic: tactic})

  render() {
    return (
      <Container>
        <ModalTacticDetail
          onClose={this.closeModal}
          tactic={this.state.modal_tactic}
        />
        {
          <TableTacticDefinitions
            tactics={this.props.tactics.toList()}
            onRowClick={tactic => this.openModal(tactic)}
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
})

export default connect(mapStateToProps, mapDispatchToProps)(Tactics)
