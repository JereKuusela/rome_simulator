import React, { Component } from 'react'
import { connect } from 'react-redux'
import { AppState } from 'state'
import TerrainDetail from 'components/TerrainDetail'
import { Mode, TerrainType, LocationType, TerrainValueType, ModalType } from 'types'
import { setTerrainLocation, setTerrainImage, setTerrainType, setTerrainMode, setTerrainValue, deleteTerrain, closeModal } from 'reducers'
import BaseModal from './BaseModal'
import ItemRemover from 'components/ItemRemover'

const CUSTOM_VALUE_KEY = 'Custom'

class ModalTerrainDetail extends Component<IProps> {
  render() {
    const { terrains, type } = this.props
    const terrain = terrains[type]
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
          onModeChange={this.setMode}
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
  setMode = (mode: Mode) => {
    const { type, setTerrainMode } = this.props
    setTerrainMode(type, mode)
  }
}

const mapStateToProps = (state: AppState) => ({
  type: state.ui.modals[ModalType.TerrainDetail]?.type ?? TerrainType.None,
  terrains: state.terrains,
  mode: state.settings.mode
})

const actions = { setTerrainLocation, setTerrainImage, setTerrainType, setTerrainMode, setTerrainValue, deleteTerrain, closeModal }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends S, D { }

export default connect(mapStateToProps, actions)(ModalTerrainDetail)
