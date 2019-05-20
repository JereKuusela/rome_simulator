import React, { Component } from 'react'
import { Map } from 'immutable'
import { connect } from 'react-redux'
import { setBaseValue, ValueType, TerrainType, TerrainDefinition } from '../store/terrains'
import { AppState } from '../store/'
import { ModalTerrainDetail as DisplayComponent } from '../components/ModalTerrainDetail'

interface IStateFromProps {
  readonly terrains: Map<TerrainType, TerrainDefinition>
}
interface IDispatchFromProps {
  setBaseValue: (terrain: TerrainType, key: string, attribute: ValueType, value: number) => void
}
interface IProps extends IStateFromProps, IDispatchFromProps {
  terrain: TerrainType | null
  onClose: () => void
 }

const CUSTOM_VALUE_KEY = 'Custom'

class ModalTerrainDetail extends Component<IProps> {
  render() {
    if (this.props.terrain === null)
      return null
    return (
      <DisplayComponent
        custom_value_key={CUSTOM_VALUE_KEY}
        terrain={this.props.terrains.get(this.props.terrain)!}
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
  setBaseValue: (type, key, attribute, value) => (
    !Number.isNaN(value) && dispatch(setBaseValue(type, key, attribute, value))
  )
})

export default connect(mapStateToProps, mapDispatchToProps)(ModalTerrainDetail)
