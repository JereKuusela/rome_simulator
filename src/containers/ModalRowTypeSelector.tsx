import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Modal } from 'semantic-ui-react'
import { UnitType } from '../store/units'
import { AppState } from '../store/'
import { setRowType, RowType } from '../store/battle'
import { Mode } from '../base_definition'
import ItemSelector from '../components/ItemSelector'
import ItemRemover from '../components/ItemRemover'
import { CountryName } from '../store/countries'
import { filterUnitDefinitions } from '../army_utils'
import { toArr } from '../utils'

export interface ModalInfo {
  country: CountryName
  type: RowType
}

class ModalRowTypeSelector extends Component<IProps> {
  render(): JSX.Element | null {
    if (!this.props.info)
      return null
    const units = filterUnitDefinitions(this.props.mode, this.props.units[this.props.info.country])
    return (
      <Modal basic onClose={this.props.onClose} open centered={false}>
        <Modal.Content>
          <ItemRemover
            onClose={this.props.onClose}
            onRemove={() => this.selectUnit(undefined)}
          />
          <ItemSelector
            onClose={this.props.onClose}
            onSelection={this.selectUnit}
            items={toArr(units)}
          />
        </Modal.Content>
      </Modal>
    )
  }

  selectUnit = (unit: UnitType | undefined): void => (
    this.props.info && 
    this.props.setRowType(this.props.mode, this.props.info.country, this.props.info.type, unit)
  )
}

const mapStateToProps = (state: AppState) => ({
  units: state.units,
  mode: state.settings.mode
})

const mapDispatchToProps = (dispatch: any) => ({
  setRowType: (mode: Mode, name: CountryName, type: RowType, unit: UnitType | undefined) => (
    dispatch(setRowType(mode, name, type, unit))
  )
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
  info: ModalInfo | null
  onClose: () => void
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalRowTypeSelector)
