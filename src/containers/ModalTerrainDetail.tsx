import React, { Component } from 'react'
import { connect } from 'react-redux'
import { setBaseValue, ValueType, TerrainType, LocationType, changeLocation, changeImage, changeMode } from '../store/terrains'
import { AppState } from '../store/'
import { invalidate } from '../store/battle'
import { DefinitionType } from '../base_definition'
import TerrainDetail from '../components/TerrainDetail'


const CUSTOM_VALUE_KEY = 'Custom'

class ModalTerrainDetail extends Component<IProps> {
  render(): JSX.Element | null {
    if (this.props.terrain === null)
      return null
    const terrain = this.props.terrains.get(this.props.terrain)
    if (!terrain)
      return null
    return (
      <TerrainDetail
        custom_value_key={CUSTOM_VALUE_KEY}
        terrain={terrain}
        onCustomBaseValueChange={(type, key, attribute, value) => this.props.setBaseValue(this.props.mode, type, key, attribute, value)}
        onTypeChange={this.props.changeType}
        onLocationChange={this.props.changeLocation}
        onImageChange={this.props.changeImage}
        onModeChange={this.props.changeMode}
      />
    )
  }
}

const mapStateToProps = (state: AppState) => ({
  terrains: state.terrains,
  mode: state.settings.mode
})

const mapDispatchToProps = (dispatch: any) => ({
  setBaseValue: (mode: DefinitionType, type: TerrainType, key: string, attribute: ValueType, value: number) => (
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
