import React, { Component } from 'react'
import { Map } from 'immutable'
import { connect } from 'react-redux'
import { UnitType,  ArmyType, UnitDefinition } from '../store/units'
import { AppState } from '../store/'
import { selectUnit} from '../store/land_battle'
import { ModalSelector } from '../components/ModalSelector'
import { TerrainType, TerrainCalc, LocationType, TerrainDefinition } from '../store/terrains';

interface IStateFromProps {
  units: Map<ArmyType, Map<UnitType, UnitDefinition>>
  terrains : Map<LocationType, Map<TerrainType, TerrainDefinition>>
}
interface IDispatchFromProps {
  selectUnit: (army: ArmyType, row: number, column: number, unit: UnitDefinition | null) => void
}
interface IProps extends IStateFromProps, IDispatchFromProps {
  info: ModalInfo | null
  onClose: () => void
 }
export interface ModalInfo {
  army: ArmyType 
  row: number 
  column: number 
}

class ModalTerrainSelector extends Component<IProps> {
  render() {
    if (!this.props.info)
      return null
    return (
      <ModalSelector
        onClose={this.props.onClose}
        onSelection={this.selectTerrain}
        items={this.props.terrains.get(LocationType.Border)!.toList()}
        attributes={[TerrainCalc.Roll]}
        can_remove={false}
      />
    )
  }

  selectTerrain = (terrain: TerrainType | null) => (
    this.props.info && this.props.selectUnit(this.props.info.army, this.props.info.row, this.props.info.column, terrain ? this.props.units.getIn([this.props.info.army, terrain]): null)
  )
}

const mapStateToProps = (state: AppState): IStateFromProps => ({
  units: state.units.units,
  terrains: state.terrains.terrains
})

const mapDispatchToProps = (dispatch: any): IDispatchFromProps => ({
  selectUnit: (army, row, column, unit) => dispatch(selectUnit(army, row, column, unit))
})

export default connect(mapStateToProps, mapDispatchToProps)(ModalTerrainSelector)
