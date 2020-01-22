import React, { Component } from 'react'
import { connect } from 'react-redux'
import { AppState } from '../../store/'
import TerrainDetail from '../../components/TerrainDetail'
import { Mode, DefinitionType } from 'base_definition'
import { TerrainType, LocationType, TerrainValueType } from 'types'
import { invalidate } from 'reducers/battle'
import { changeLocation, changeImage, changeMode, setBaseValue } from 'reducers/terrains'

const CUSTOM_VALUE_KEY = 'Custom'

class ModalTerrainDetail extends Component<IProps> {
  render(): JSX.Element | null {
    if (this.props.terrain === null)
      return null
    const terrain = this.props.terrains[this.props.terrain]
    return (
      <TerrainDetail
        custom_value_key={CUSTOM_VALUE_KEY}
        terrain={terrain}
        onCustomBaseValueChange={(key, attribute, value) => this.props.setBaseValue(this.props.mode, terrain.type, key, attribute, value)}
        onTypeChange={type => this.props.changeType(terrain.type, type)}
        onLocationChange={location => this.props.changeLocation(terrain.type, location)}
        onImageChange={image => this.props.changeImage(terrain.type, image)}
        onModeChange={mode => this.props.changeMode(terrain.type, mode)}
      />
    )
  }
}

const mapStateToProps = (state: AppState) => ({
  terrains: state.terrains,
  mode: state.settings.mode
})

const mapDispatchToProps = (dispatch: any) => ({
  setBaseValue: (mode: Mode, type: TerrainType, key: string, attribute: TerrainValueType, value: number) => (
    !Number.isNaN(value) && dispatch(setBaseValue(type, key, attribute, value)) && dispatch(invalidate(mode))
  ),
  changeLocation: (type: TerrainType, location: LocationType) => dispatch(changeLocation(type, location)),
  changeImage: (type: TerrainType, image: string) => dispatch(changeImage(type, image)),
  changeMode: (type: TerrainType, mode: DefinitionType) => dispatch(changeMode(type, mode))
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
  terrain: TerrainType | null
  changeType: (old_type: TerrainType, new_type: TerrainType) => void
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalTerrainDetail)
