import React, { Component } from 'react'
import { connect } from 'react-redux'
import { setBaseValue, ValueType, TerrainType, TerrainDefinition, LocationType } from '../store/terrains'
import { AppState } from '../store/'
import { setTerrainModal } from '../store/layout'
import { ModalTerrainDetail as DisplayComponent } from '../components/ModalTerrainDetail'

interface IStateFromProps {
  location: LocationType | null
  terrain: TerrainDefinition | null
}
interface IDispatchFromProps {
  close: () => void
  setBaseValue: (location: LocationType, type: TerrainType, value_type: ValueType, key: string, value: number) => void
}
interface IProps extends IStateFromProps, IDispatchFromProps { }

const CUSTOM_VALUE_KEY = 'custom'

class ModalTerrainDetail extends Component<IProps> {
  render() {
    if (this.props.terrain === null || this.props.location === null)
      return null
    return (
      <DisplayComponent
        location={this.props.location}
        custom_value_key={CUSTOM_VALUE_KEY}
        terrain={this.props.terrain}
        onClose={this.props.close}
        onCustomBaseValueChange={this.props.setBaseValue}
      />
    )
  }
}

const mapStateToProps = (state: AppState): IStateFromProps => ({
  terrain: state.layout.terrain_modal,
  location: state.layout.location
})

const mapDispatchToProps = (dispatch: any): IDispatchFromProps => ({
  close: () => dispatch(setTerrainModal(null, null)),
  setBaseValue: (location: LocationType, type: TerrainType, value_type: ValueType, key: string, value: number) => (
    !Number.isNaN(value) && dispatch(setBaseValue(location, type, value_type, key, value))
  )
})

export default connect(mapStateToProps, mapDispatchToProps)(ModalTerrainDetail)
