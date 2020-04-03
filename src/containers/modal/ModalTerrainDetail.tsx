import React, { Component } from 'react'
import { connect } from 'react-redux'
import { AppState } from 'state'
import TerrainDetail from 'components/TerrainDetail'
import { Mode, TerrainType, LocationType, TerrainValueType, ValuesType } from 'types'
import { setTerrainLocation, setTerrainImage, setTerrainMode, setTerrainValue, invalidate } from 'reducers'

const CUSTOM_VALUE_KEY = 'Custom'

class ModalTerrainDetail extends Component<IProps> {
  render() {
    if (this.props.terrain === null)
      return null
    const terrain = this.props.terrains[this.props.terrain]
    return (
      <TerrainDetail
        custom_value_key={CUSTOM_VALUE_KEY}
        terrain={terrain}
        onCustomValueChange={(key, attribute, value) => this.props.setTerrainValue(terrain.type, key, attribute, value)}
        onTypeChange={type => this.props.changeType(terrain.type, type)}
        onLocationChange={location => this.props.setLocation(terrain.type, location)}
        onImageChange={image => this.props.setImage(terrain.type, image)}
        onModeChange={mode => this.props.setMode(terrain.type, mode)}
      />
    )
  }
}

const mapStateToProps = (state: AppState) => ({
  terrains: state.terrains,
  mode: state.settings.mode
})

const mapDispatchToProps = (dispatch: any) => ({
  setTerrainValue: (type: TerrainType, key: string, attribute: TerrainValueType, value: number) => (
    !Number.isNaN(value) && dispatch(setTerrainValue(type, ValuesType.Base, key, attribute, value)) && dispatch(invalidate())
  ),
  setLocation: (type: TerrainType, location: LocationType) => dispatch(setTerrainLocation(type, location)),
  setImage: (type: TerrainType, image: string) => dispatch(setTerrainImage(type, image)),
  setMode: (type: TerrainType, mode: Mode) => dispatch(setTerrainMode(type, mode))
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
  terrain: TerrainType | null
  changeType: (old_type: TerrainType, new_type: TerrainType) => void
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalTerrainDetail)
