import React, { Component } from 'react'
import { connect } from 'react-redux'
import { UnitType, UnitDefinition, setBaseValue, setModifierValue, setLossValue, ArmyType, ValueType } from '../store/units'
import { AppState } from '../store/'
import { setUnitModal } from '../store/layout'
import { selectUnit} from '../store/land_battle'
import { ModalUnitSelector as DisplayComponent } from '../components/ModalUnitSelector'

interface IStateFromProps {
  army: ArmyType
  row: number
  column: number
}
interface IDispatchFromProps {
  close: () => void
  selectUnit: (army: ArmyType, row: number, column: number, unit: UnitType) => void
}
interface IProps extends IStateFromProps, IDispatchFromProps { }

class ModalUnitSelector extends Component<IProps> {
  render() {
    if (this.props.army === null)
      return null
    return (
      <DisplayComponent
        onClose={this.props.close}
        onUnitSelection={this.selectUnit}
      />
    )
  }

  selectUnit = (unit: UnitType) => this.props.selectUnit(this.props.army, this.props.row, this.props.column, unit)
}

const mapStateToProps = (state: AppState): any => ({
  unit: state.layout.unit_modal
})

const mapDispatchToProps = (dispatch: any): IDispatchFromProps => ({
  close: () => dispatch(setUnitModal(null, null)),
  selectUnit: (army, row, column, unit) => dispatch(selectUnit(army, row, column, unit))
})

export default connect(mapStateToProps, mapDispatchToProps)(ModalUnitSelector)
