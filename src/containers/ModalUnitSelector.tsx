import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Modal } from 'semantic-ui-react'
import { UnitType, ArmyName, Unit, ArmyType } from '../store/units'
import { AppState } from '../store/'
import { selectUnit, ParticipantType } from '../store/land_battle'
import ItemSelector from '../components/ItemSelector'

export interface ModalInfo {
  participant: ParticipantType
  name: ArmyName
  index: number
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
            items={this.props.units.get(this.props.info.name)!.toList()}
            attributes={[]}
          />
        </Modal.Content>
      </Modal>
    )
  }

  selectUnit = (unit: UnitType | undefined) => (
    this.props.info &&
    this.props.selectUnit(this.props.info.participant, this.props.info.type, this.props.info.index, unit ? { type: this.props.units.getIn([this.props.info.name, unit]).type } : undefined)
  )
}

const mapStateToProps = (state: AppState) => ({
  units: state.units.definitions
})

const mapDispatchToProps = (dispatch: any) => ({
  selectUnit: (participant: ParticipantType, type: ArmyType, column: number, unit: Unit | undefined) => (
    dispatch(selectUnit(participant, type, column, unit))
  )
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
  info: ModalInfo | null
  onClose: () => void
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalUnitSelector)
