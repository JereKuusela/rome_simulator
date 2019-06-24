import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Modal } from 'semantic-ui-react'
import { UnitType, ArmyName, Unit, ArmyType } from '../store/units'
import { AppState } from '../store/'
import { selectUnit } from '../store/battle'
import { DefinitionType } from '../base_definition'
import ItemSelector from '../components/ItemSelector'

export interface ModalInfo {
  name: ArmyName
  index: number
  type: ArmyType
}

class ModalUnitSelector extends Component<IProps> {
  render(): JSX.Element | null {
    if (!this.props.info)
      return null
    const types = this.props.types.get(this.props.info.name)
    const units = this.props.units.get(this.props.info.name)
    if (!types || !units)
      return null
    return (
      <Modal basic onClose={this.props.onClose} open centered={false}>
        <Modal.Content>
          <ItemSelector
            onClose={this.props.onClose}
            onSelection={this.selectUnit}
            items={types.map(value => units.get(value)).filter(unit => unit && (unit.mode === this.props.mode || unit.mode === DefinitionType.Any)).toList()}
            attributes={[]}
          />
        </Modal.Content>
      </Modal>
    )
  }

  selectUnit = (unit: UnitType | undefined): void => (
    this.props.info &&
    this.props.selectUnit(this.props.mode, this.props.info.name, this.props.info.type, this.props.info.index, unit ? { type: this.props.units.getIn([this.props.info.name, unit]).type } : undefined)
  )
}

const mapStateToProps = (state: AppState) => ({
  units: state.units.definitions,
  types: state.units.types,
  mode: state.settings.mode
})

const mapDispatchToProps = (dispatch: any) => ({
  selectUnit: (mode: DefinitionType, name: ArmyName, type: ArmyType, column: number, unit: Unit | undefined) => (
    dispatch(selectUnit(mode, name, type, column, unit))
  )
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
  info: ModalInfo | null
  onClose: () => void
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalUnitSelector)
