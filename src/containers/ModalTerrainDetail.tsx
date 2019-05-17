import React, { Component } from 'react'
import { Map } from 'immutable'
import { connect } from 'react-redux'
import { setBaseValue, ValueType, TerrainType, TerrainDefinition, LocationType } from '../store/terrains'
import { AppState } from '../store/'
import { ModalTerrainDetail as DisplayComponent } from '../components/ModalTerrainDetail'

interface IStateFromProps {
  readonly terrains: Map<LocationType, Map<TerrainType, TerrainDefinition>>
}
interface IDispatchFromProps {
  setBaseValue: (location: LocationType, terrain: TerrainType, key: string, attribute: ValueType, value: number) => void
}
interface IProps extends IStateFromProps, IDispatchFromProps {
  location: LocationType | null
  terrain: TerrainType | null
  onClose: () => void
 }

const CUSTOM_VALUE_KEY = 'Custom'

class ModalTerrainDetail extends Component<IProps> {
  render() {
    if (this.props.terrain === null || this.props.location === null)
      return null
    return (
      <DisplayComponent
        location={this.props.location}
        custom_value_key={CUSTOM_VALUE_KEY}
        terrain={this.props.terrains.getIn([this.props.location, this.props.terrain])}
        onClose={this.props.onClose}
        onCustomBaseValueChange={this.props.setBaseValue}
      />
    )
  }
}

const mapStateToProps = (state: AppState): IStateFromProps => ({
  terrains: state.terrains.terrains
})

const mapDispatchToProps = (dispatch: any): IDispatchFromProps => ({
  setBaseValue: (location, type, key, attribute, value) => (
    !Number.isNaN(value) && dispatch(setBaseValue(location, type, key, attribute, value))
  )
})

export default connect(mapStateToProps, mapDispatchToProps)(ModalTerrainDetail)
