import React, { Component } from 'react'
import { Container, Modal } from 'semantic-ui-react'
import { connect } from 'react-redux'
import ModalTacticDetail from '../containers/ModalTacticDetail'
import { AppState } from '../store/index'
import TacticDefinitions from '../components/TacticDefinitions'
import { TacticType } from '../store/tactics'

interface IState {
  modal_tactic: TacticType | null
}

class Tactics extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props)
    this.state = { modal_tactic: null };
  }

  closeModal = () => this.setState({ modal_tactic: null })

  openModal = (tactic: TacticType) => this.setState({ modal_tactic: tactic })

  render() {
    return (
      <Container>
        <Modal basic onClose={this.closeModal} open={this.state.modal_tactic !== null}>
          <Modal.Content>
            <ModalTacticDetail
              tactic={this.state.modal_tactic}
            />
          </Modal.Content>
        </Modal>
        {
          <TacticDefinitions
            tactics={this.props.tactics.toList()}
            onRowClick={tactic => this.openModal(tactic)}
          />
        }
      </Container>
    )
  }
}

const mapStateToProps = (state: AppState) => ({
  tactics: state.tactics
})

const mapDispatchToProps = (dispatch: any) => ({
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> { }

export default connect(mapStateToProps, mapDispatchToProps)(Tactics)
