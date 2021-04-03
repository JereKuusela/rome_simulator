import React, { Component } from 'react'
import { connect } from 'react-redux'
import type { AppState } from 'reducers'
import TerrainDetail from 'components/TerrainDetail'
import { TerrainType, LocationType, TerrainValueType, ModalType } from 'types'
import {
  setTerrainLocation,
  setTerrainImage,
  setTerrainType,
  setTerrainValue,
  deleteTerrain,
  closeModal
} from 'reducers'
import BaseModal from './BaseModal'
import ItemRemover from 'components/ItemRemover'
import { getMode } from 'selectors'

const CUSTOM_VALUE_KEY = 'Custom'

class ModalTerrainDetail extends Component<IProps> {
  render() {
    const { terrain } = this.props
    return (
      <BaseModal basic type={ModalType.TerrainDetail}>
        <ItemRemover onRemove={this.delete} />
        <TerrainDetail
          customValueKey={CUSTOM_VALUE_KEY}
          terrain={terrain}
          onCustomValueChange={this.setValue}
          onTypeChange={this.setType}
          onLocationChange={this.setLocation}
          onImageChange={this.setImage}
        />
      </BaseModal>
    )
  }

  delete = () => {
    const { type, deleteTerrain, closeModal } = this.props
    deleteTerrain(type)
    closeModal()
  }
  setValue = (key: string, attribute: TerrainValueType, value: number) => {
    const { type, setTerrainValue } = this.props
    setTerrainValue(type, key, attribute, value)
  }
  setType = (newType: TerrainType) => {
    const { type, setTerrainType } = this.props
    setTerrainType(type, newType)
  }
  setLocation = (location: LocationType) => {
    const { type, setTerrainLocation } = this.props
    setTerrainLocation(type, location)
  }
  setImage = (image: string) => {
    const { type, setTerrainImage } = this.props
    setTerrainImage(type, image)
  }
}

const mapStateToProps = (state: AppState) => {
  const type = state.ui.modals[ModalType.TerrainDetail]?.type ?? TerrainType.None
  return {
    type,
    terrain: state.terrains[type],
    mode: getMode(state)
  }
}

const actions = {
  setTerrainLocation,
  setTerrainImage,
  setTerrainType,
  setTerrainValue,
  deleteTerrain,
  closeModal
}

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends S, D {}

export default connect(mapStateToProps, actions)(ModalTerrainDetail)
