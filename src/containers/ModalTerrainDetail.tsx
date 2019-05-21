import React, { Component } from 'react'
import { connect } from 'react-redux'
import { setBaseValue, ValueType, TerrainType } from '../store/terrains'
import { AppState } from '../store/'
import { ModalTerrainDetail as DisplayComponent } from '../components/ModalTerrainDetail'


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

const mapStateToProps = (state: AppState) => ({
  terrains: state.terrains.terrains
})

const mapDispatchToProps = (dispatch: any) => ({
  setBaseValue: (terrain: TerrainType, key: string, attribute: ValueType, value: number) => (
    !Number.isNaN(value) && dispatch(setBaseValue(terrain, key, attribute, value))
  )
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
  terrain: TerrainType | null
  onClose: () => void
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalTerrainDetail)
