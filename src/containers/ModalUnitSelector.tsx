import React, { Component } from 'react'
import { connect } from 'react-redux'
import { UnitType,  ArmyType, UnitDefinition } from '../store/units'
import { AppState } from '../store/'
import { selectUnit} from '../store/land_battle'
import { ModalSelector } from '../components/ModalSelector'

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
      <ModalSelector
        onClose={this.props.onClose}
        onSelection={this.selectUnit}
        items={this.props.units.get(this.props.info.army)!.toList()}
        attributes={[]}
        can_remove={true}
      />
    )
  }

  selectUnit = (unit: UnitType | null) => (
    this.props.info && this.props.selectUnit(this.props.info.army, this.props.info.row, this.props.info.column, unit ? this.props.units.getIn([this.props.info.army, unit]): null)
  )
}

const mapStateToProps = (state: AppState) => ({
  units: state.units.units
})

const mapDispatchToProps = (dispatch: any) => ({
  selectUnit: (army: ArmyType, row: number, column: number, unit: UnitDefinition | null) => (
    dispatch(selectUnit(army, row, column, unit))
  )
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
  info: ModalInfo | null
  onClose: () => void
 }

export default connect(mapStateToProps, mapDispatchToProps)(ModalUnitSelector)
