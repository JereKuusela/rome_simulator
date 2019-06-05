import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Modal } from 'semantic-ui-react'
import { UnitType, ArmyName } from '../store/units'
import { AppState } from '../store/'
import { setRowType, RowType } from '../store/land_battle'
import ItemSelector from '../components/ItemSelector'

export interface ModalInfo {
  army: ArmyName
  type: RowType
}

class ModalRowTypeSelector extends Component<IProps> {
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
            can_remove={false}
            can_select={true}
          />
        </Modal.Content>
      </Modal>
    )
  }

  selectUnit = (unit: UnitType | undefined) => (
    this.props.info && unit && 
    this.props.setRowType(this.props.info.army, this.props.info.type, unit)
  )
}

const mapStateToProps = (state: AppState) => ({
  units: state.units.definitions
})

const mapDispatchToProps = (dispatch: any) => ({
  setRowType: (army: ArmyName, type: RowType, unit: UnitType) => (
    dispatch(setRowType(army, type, unit))
  )
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
  info: ModalInfo | null
  onClose: () => void
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalRowTypeSelector)
