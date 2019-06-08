import React, { Component } from 'react'
import { connect } from 'react-redux'
import { setBaseValue, ValueType, TerrainType, LocationType, changeLocation } from '../store/terrains'
import { AppState } from '../store/'
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
        onCustomBaseValueChange={this.props.setBaseValue}
        onTypeChange={this.props.changeType}
        onLocationChange={this.props.changeLocation}
      />
    )
  }
}

const mapStateToProps = (state: AppState) => ({
  terrains: state.terrains.definitions
})

const mapDispatchToProps = (dispatch: any) => ({
  setBaseValue: (type: TerrainType, key: string, attribute: ValueType, value: number) => (
    !Number.isNaN(value) && dispatch(setBaseValue(type, key, attribute, value))
  ),
  changeLocation: (type: TerrainType, location: LocationType) => dispatch(changeLocation(type, location))
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
  terrain: TerrainType | null
  changeType: (old_type: TerrainType, new_type: TerrainType) => void
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalTerrainDetail)
