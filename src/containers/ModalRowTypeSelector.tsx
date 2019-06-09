import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Modal } from 'semantic-ui-react'
import { UnitType, ArmyName } from '../store/units'
import { AppState } from '../store/'
import { setRowType, RowType, } from '../store/land_battle'
import ItemSelector from '../components/ItemSelector'

export interface ModalInfo {
  name: ArmyName
  type: RowType
}

class ModalRowTypeSelector extends Component<IProps> {
  render(): JSX.Element | null {
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

  selectUnit = (unit: UnitType | undefined): void => (
    this.props.info && unit && 
    this.props.setRowType(this.props.info.name, this.props.info.type, unit)
  )
}

const mapStateToProps = (state: AppState) => ({
  units: state.units.definitions,
  types: state.units.types
})

const mapDispatchToProps = (dispatch: any) => ({
  setRowType: (name: ArmyName, type: RowType, unit: UnitType) => (
    dispatch(setRowType(name, type, unit))
  )
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
  info: ModalInfo | null
  onClose: () => void
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalRowTypeSelector)
