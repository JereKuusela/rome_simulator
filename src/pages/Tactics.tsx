import React, { Component } from 'react'
import { Container, Modal } from 'semantic-ui-react'
import { connect } from 'react-redux'
import ModalTacticDetail from '../containers/ModalTacticDetail'
import { AppState } from '../store/index'
import TacticDefinitions from '../components/TacticDefinitions'
import ItemRemover from '../components/ItemRemover'
import { TacticType, deleteTactic, addTactic, changeType } from '../store/tactics'

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
          <ItemRemover
              onClose={this.closeModal}
              onRemove={this.onRemove}
              confirm_remove={true}
              item={'tactic definition ' + String(this.state.modal_tactic)}
            />
            <ModalTacticDetail
              tactic={this.state.modal_tactic}
              changeType={this.onChangeType}
            />
          </Modal.Content>
        </Modal>
        {
          <TacticDefinitions
            tactics={this.props.tactics}
            types={this.props.types}
            onRowClick={tactic => this.openModal(tactic)}
            onCreateNew={this.props.addTactic}
          />
        }
      </Container>
    )
  }
  
  onRemove = () => this.state.modal_tactic && this.props.deleteTactic(this.state.modal_tactic)

  onChangeType = (old_type: TacticType, new_type: TacticType) => {
    this.props.changeType(old_type, new_type)
    this.setState({ modal_tactic: new_type })
  }
}

const mapStateToProps = (state: AppState) => ({
  tactics: state.tactics.definitions,
  types: state.tactics.types
})

const mapDispatchToProps = (dispatch: any) => ({
  deleteTactic: (type: TacticType) => dispatch(deleteTactic(type)),
  addTactic: (type: TacticType) => dispatch(addTactic(type)),
  changeType: (old_type: TacticType, new_type: TacticType) => dispatch(changeType(old_type, new_type))
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> { }

export default connect(mapStateToProps, mapDispatchToProps)(Tactics)
