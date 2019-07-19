import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Modal } from 'semantic-ui-react'
import { UnitType, Unit } from '../store/units'
import { AppState } from '../store/'
import { selectUnit, ArmyType } from '../store/battle'
import { CountryName } from '../store/countries'
import { DefinitionType } from '../base_definition'
import ItemSelector from '../components/ItemSelector'
import { filterUnits } from '../utils'

export interface ModalInfo {
  name: CountryName
  country: CountryName
  index: number
  type: ArmyType
}

class ModalUnitSelector extends Component<IProps> {
  render(): JSX.Element | null {
    if (!this.props.info)
      return null
    const units = filterUnits(this.props.mode, this.props.units.get(this.props.info.country))
    return (
      <Modal basic onClose={this.props.onClose} open centered={false}>
        <Modal.Content>
          <ItemSelector
            onClose={this.props.onClose}
            onSelection={this.selectUnit}
            items={units.toList()}
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
  units: state.units,
  mode: state.settings.mode
})

const mapDispatchToProps = (dispatch: any) => ({
  selectUnit: (mode: DefinitionType, name: CountryName, type: ArmyType, column: number, unit: Unit | undefined) => (
    dispatch(selectUnit(mode, name, type, column, unit))
  )
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
  info: ModalInfo | null
  onClose: () => void
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalUnitSelector)
