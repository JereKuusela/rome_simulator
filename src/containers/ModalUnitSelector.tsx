import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Modal } from 'semantic-ui-react'
import { UnitType, ArmyName, UnitDefinition, ArmyType } from '../store/units'
import { AppState } from '../store/'
import { selectUnit } from '../store/land_battle'
import ItemSelector from '../components/ItemSelector'

export interface ModalInfo {
  army: ArmyName
  row: number
  column: number
  type: ArmyType
}

class ModalUnitSelector extends Component<IProps> {
  render() {
    if (!this.props.info)
      return null
    return (
      <Modal basic onClose={this.props.onClose} open centered={false}>
        <Modal.Content>
          <ItemSelector
            onClose={this.props.onClose}
            onSelection={this.selectUnit}
            items={this.props.units.get(this.props.info.army)!.toList()}
            attributes={[]}
            can_remove={true}
            can_select={true}
          />
        </Modal.Content>
      </Modal>
    )
  }

  selectUnit = (unit: UnitType | null) => (
    this.props.info &&
    this.props.selectUnit(this.props.info.army, this.props.info.type, this.props.info.row, this.props.info.column, unit ? this.props.units.getIn([this.props.info.army, unit]) : null)
  )
}

const mapStateToProps = (state: AppState) => ({
  units: state.units.units
})

const mapDispatchToProps = (dispatch: any) => ({
  selectUnit: (army: ArmyName, type: ArmyType, row: number, column: number, unit: UnitDefinition | null) => (
    dispatch(selectUnit(army, type, row, column, unit))
  )
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
  info: ModalInfo | null
  onClose: () => void
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalUnitSelector)
