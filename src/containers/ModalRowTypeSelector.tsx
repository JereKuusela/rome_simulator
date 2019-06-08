import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Modal } from 'semantic-ui-react'
import { UnitType, ArmyName } from '../store/units'
import { AppState } from '../store/'
import { setRowType, RowType, ParticipantType } from '../store/land_battle'
import ItemSelector from '../components/ItemSelector'

export interface ModalInfo {
  participant: ParticipantType
  name: ArmyName
  type: RowType
}

class ModalRowTypeSelector extends Component<IProps> {
  render() {
    if (!this.props.info)
      return null
    const name = this.props.info.name
    const types = this.props.types.get(name)
    const units = this.props.units.get(this.props.info.name)
    if (!types || !units)
      return null
    return (
      <Modal basic onClose={this.props.onClose} open centered={false}>
        <Modal.Content>
          <ItemSelector
            onClose={this.props.onClose}
            onSelection={this.selectUnit}
            items={types.map(value => units.get(value)).toList()}
            attributes={[]}
          />
        </Modal.Content>
      </Modal>
    )
  }

  selectUnit = (unit: UnitType | undefined) => (
    this.props.info && unit && 
    this.props.setRowType(this.props.info.participant, this.props.info.type, unit)
  )
}

const mapStateToProps = (state: AppState) => ({
  units: state.units.definitions,
  types: state.units.types
})

const mapDispatchToProps = (dispatch: any) => ({
  setRowType: (participant: ParticipantType, type: RowType, unit: UnitType) => (
    dispatch(setRowType(participant, type, unit))
  )
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
  info: ModalInfo | null
  onClose: () => void
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalRowTypeSelector)
