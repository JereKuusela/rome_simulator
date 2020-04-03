import React, { Component } from 'react'
import { connect } from 'react-redux'
import { AppState } from 'state'
import TerrainDetail from 'components/TerrainDetail'
import { Mode, TerrainType, LocationType, TerrainValueType, ModalType } from 'types'
import { setTerrainLocation, setTerrainImage, setTerrainType, setTerrainMode, setTerrainValue, invalidate, deleteTerrain, closeModal } from 'reducers'
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
          custom_value_key={CUSTOM_VALUE_KEY}
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
    const { type, deleteTerrain, invalidate, closeModal } = this.props
    deleteTerrain(type)
    invalidate()
    closeModal()
  }
  setValue = (key: string, attribute: TerrainValueType, value: number) => {
    const { type, setTerrainValue, invalidate } = this.props
    setTerrainValue(type, key, attribute, value)
    invalidate()
  }
  setType = (new_type: TerrainType) => {
    const { type, setTerrainType, invalidate } = this.props
    setTerrainType(type, new_type)
    invalidate()
  }
  setLocation = (location: LocationType) => {
    const { type, setTerrainLocation, invalidate } = this.props
    setTerrainLocation(type, location)
    invalidate()
  }
  setImage = (image: string) => {
    const { type, setTerrainImage, invalidate } = this.props
    setTerrainImage(type, image)
    invalidate()
  }
  setMode = (mode: Mode) => {
    const { type, setTerrainMode, invalidate } = this.props
    setTerrainMode(type, mode)
    invalidate()
  }
}

const mapStateToProps = (state: AppState) => ({
  type: state.ui[ModalType.TerrainDetail]?.type ?? TerrainType.None,
  terrains: state.terrains,
  mode: state.settings.mode
})

const actions = { setTerrainLocation, setTerrainImage, setTerrainType, setTerrainMode, setTerrainValue, invalidate, deleteTerrain, closeModal }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends S, D { }

export default connect(mapStateToProps, actions)(ModalTerrainDetail)
