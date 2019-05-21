import React, { Component } from 'react'
import { Container } from 'semantic-ui-react'
import { connect } from 'react-redux'
import ModalTacticDetail from '../containers/ModalTacticDetail'
import { AppState } from '../store/index'
import { TableTacticDefinitions } from '../components/TableTacticDefinitions'
import { TacticType } from '../store/tactics'

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

const mapStateToProps = (state: AppState) => ({
  tactics: state.tactics.tactics
})

const mapDispatchToProps = (dispatch: any) => ({
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> { }

export default connect(mapStateToProps, mapDispatchToProps)(Tactics)
