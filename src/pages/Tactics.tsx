import React, { Component } from 'react'
import { Container, Modal } from 'semantic-ui-react'
import { connect } from 'react-redux'
import ModalTacticDetail from '../containers/ModalTacticDetail'
import { AppState } from '../store/index'
import TacticDefinitions from '../components/TacticDefinitions'
import ItemRemover from '../components/ItemRemover'
import { TacticType, deleteTactic, addTactic, changeType } from '../store/tactics'
import { OrderedSet } from 'immutable'
import { UnitType } from '../store/units' 
import { DefinitionType } from '../base_definition'

interface IState {
  modal_tactic: TacticType | null
}

class Tactics extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props)
    this.state = { modal_tactic: null };
  }

  closeModal = (): void => this.setState({ modal_tactic: null })

  openModal = (tactic: TacticType): void => this.setState({ modal_tactic: tactic })

  render(): JSX.Element {
    const unit_types = this.props.unit_types.reduce((previous, current) => previous.merge(current.toOrderedSet()), OrderedSet<UnitType>())
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
            tactics={this.props.tactics.filter(tactic => tactic.mode === this.props.mode || tactic.mode === DefinitionType.Any)}
            tactic_types={this.props.tactic_types}
            unit_types={unit_types}
            units={this.props.units}
            onRowClick={tactic => this.openModal(tactic)}
            onCreateNew={type => this.props.addTactic(type, this.props.mode)}
          />
        }
      </Container>
    )
  }
  
  onRemove = (): void => this.state.modal_tactic && this.props.deleteTactic(this.state.modal_tactic)

  onChangeType = (old_type: TacticType, new_type: TacticType): void => {
    this.props.changeType(old_type, new_type)
    this.setState({ modal_tactic: new_type })
  }
}

const mapStateToProps = (state: AppState) => ({
  tactics: state.tactics.definitions,
  tactic_types: state.tactics.types.toOrderedSet(),
  units: state.units.definitions,
  unit_types: state.units.types,
  mode: state.settings.mode
})

const mapDispatchToProps = (dispatch: any) => ({
  deleteTactic: (type: TacticType) => dispatch(deleteTactic(type)),
  addTactic: (type: TacticType, mode: DefinitionType) => dispatch(addTactic(type, mode)),
  changeType: (old_type: TacticType, new_type: TacticType) => dispatch(changeType(old_type, new_type))
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> { }

export default connect(mapStateToProps, mapDispatchToProps)(Tactics)
