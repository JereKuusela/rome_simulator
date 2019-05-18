import React, { Component } from 'react'
import { Map } from 'immutable'
import { connect } from 'react-redux'
import { UnitType,  ArmyType, UnitDefinition } from '../store/units'
import { AppState } from '../store/'
import { selectUnit} from '../store/land_battle'
import { ModalUnitSelector as DisplayComponent } from '../components/ModalUnitSelector'

interface IStateFromProps {
  units: Map<ArmyType, Map<UnitType, UnitDefinition>>
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

class ModalUnitSelector extends Component<IProps> {
  render() {
    if (!this.props.info)
      return null
    return (
      <DisplayComponent
        onClose={this.props.onClose}
        onUnitSelection={this.selectUnit}
      />
    )
  }

  selectUnit = (unit: UnitType | null) => (
    this.props.info && this.props.selectUnit(this.props.info.army, this.props.info.row, this.props.info.column, unit ? this.props.units.getIn([this.props.info.army, unit]): null)
  )
}

const mapStateToProps = (state: AppState): IStateFromProps => ({
  units: state.units.units
})

const mapDispatchToProps = (dispatch: any): IDispatchFromProps => ({
  selectUnit: (army, row, column, unit) => dispatch(selectUnit(army, row, column, unit))
})

export default connect(mapStateToProps, mapDispatchToProps)(ModalUnitSelector)
