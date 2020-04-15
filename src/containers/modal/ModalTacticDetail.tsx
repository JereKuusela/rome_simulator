import React, { Component } from 'react'
import { connect } from 'react-redux'
import { AppState, filterTactics, filterTacticTypes, getUnitImages, mergeUnitTypes } from 'state'
import TacticDetail from 'components/TacticDetail'
import { Mode, TacticType, TacticValueType, ModalType } from 'types'
import { setTacticValue, setTacticImage, setTacticMode, deleteTactic, closeModal, setTacticType } from 'reducers'
import BaseModal from './BaseModal'
import ItemRemover from 'components/ItemRemover'

const CUSTOM_VALUE_KEY = 'Custom'

class ModalTacticDetail extends Component<IProps> {
  render() {
    const { type, images, tactics, tactic_types, unit_types } = this.props
    return (
      <BaseModal basic type={ModalType.TacticDetail}>
        <ItemRemover onRemove={this.delete} />
        <TacticDetail
          tactics={tactics}
          tactic_types={tactic_types}
          unit_types={unit_types}
          images={images}
          custom_value_key={CUSTOM_VALUE_KEY}
          tactic={tactics[type]}
          onCustomValueChange={this.setValue}
          onTypeChange={this.setType}
          onImageChange={this.setImage}
          onModeChange={this.setMode}
        />
      </BaseModal>
    )
  }

  delete = () => {
    const { type, deleteTactic, closeModal } = this.props
    deleteTactic(type)
    closeModal()
  }
  setValue = (key: string, attribute: TacticValueType, value: number) => {
    const { type, setTacticValue } = this.props
    setTacticValue(type, key, attribute, value)
  }
  setType = (new_type: TacticType) => {
    const { type, setTacticType } = this.props
    setTacticType(type, new_type)
  }
  setImage = (image: string) => {
    const { type, setTacticImage } = this.props
    setTacticImage(type, image)
  }
  setMode = (mode: Mode) => {
    const { type, setTacticMode } = this.props
    setTacticMode(type, mode)
  }
}

const mapStateToProps = (state: AppState) => ({
  type: state.ui.modals[ModalType.TacticDetail]?.type ?? TacticType.Bottleneck,
  tactics: filterTactics(state),
  tactic_types: filterTacticTypes(state),
  images: getUnitImages(state),
  unit_types: mergeUnitTypes(state)
})

const actions = { setTacticValue, setTacticImage, setTacticMode, deleteTactic, closeModal, setTacticType }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends S, D { }

export default connect(mapStateToProps, actions)(ModalTacticDetail)
