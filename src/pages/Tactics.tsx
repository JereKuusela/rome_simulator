import React, { Component } from 'react'
import { Modal } from 'semantic-ui-react'
import { connect } from 'react-redux'
import ModalTacticDetail from 'containers/modal/ModalTacticDetail'
import { AppState, filterTactics, getUnitImages, mergeUnitTypes } from 'state'
import TacticDefinitions from 'components/TacticDefinitions'
import ItemRemover from 'components/ItemRemover'
import { TacticType } from 'types'
import { toArr } from 'utils'
import { deleteTactic, createTactic, setTacticType } from 'reducers'

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

  render() {
    return (
      <>
        <Modal basic onClose={this.closeModal} open={this.state.modal_tactic !== null}>
          <Modal.Content>
            <ItemRemover
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
        <TacticDefinitions
          tactics={toArr(this.props.tactics)}
          unit_types={this.props.unit_types}
          images={this.props.images}
          onRowClick={tactic => this.openModal(tactic)}
          onCreateNew={type => this.props.createTactic(type, this.props.mode)}
        />
      </>
    )
  }

  onRemove = (): void => {
    this.state.modal_tactic && this.props.deleteTactic(this.state.modal_tactic)
    this.closeModal()
  }

  onChangeType = (old_type: TacticType, new_type: TacticType): void => {
    this.props.setTacticType(old_type, new_type)
    this.setState({ modal_tactic: new_type })
  }
}

const mapStateToProps = (state: AppState) => ({
  tactics: filterTactics(state),
  images: getUnitImages(state),
  unit_types: mergeUnitTypes(state),
  mode: state.settings.mode
})

const actions = { deleteTactic, createTactic, setTacticType }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
type IProps = S & D

export default connect(mapStateToProps, actions)(Tactics)
