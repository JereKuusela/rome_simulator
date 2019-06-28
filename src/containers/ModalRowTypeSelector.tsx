import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Modal } from 'semantic-ui-react'
import { UnitType, UnitDefinition } from '../store/units'
import { AppState } from '../store/'
import { setRowType, RowType, ArmyName } from '../store/battle'
import { DefinitionType } from '../base_definition'
import ItemSelector from '../components/ItemSelector'
import ItemRemover from '../components/ItemRemover'
import { CountryName } from '../store/countries'

export interface ModalInfo {
  name: ArmyName
  country: CountryName
  type: RowType
}

class ModalRowTypeSelector extends Component<IProps> {
  render(): JSX.Element | null {
    if (!this.props.info)
      return null
    const country = this.props.info.country
    const types = this.props.types.get(country)!.filter(type => {
      const unit = this.props.units.getIn([country, type]) as UnitDefinition | undefined
      if (!unit)
        return false
      return unit.mode === this.props.mode || unit.mode === DefinitionType.Global
    })
    const units = this.props.units.get(country)
    if (!types || !units)
      return null
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
            items={types.map(value => units.get(value)).toList()}
            attributes={[]}
          />
        </Modal.Content>
      </Modal>
    )
  }

  selectUnit = (unit: UnitType | undefined): void => (
    this.props.info && 
    this.props.setRowType(this.props.mode, this.props.info.name, this.props.info.type, unit)
  )
}

const mapStateToProps = (state: AppState) => ({
  units: state.units.definitions,
  types: state.units.types,
  mode: state.settings.mode
})

const mapDispatchToProps = (dispatch: any) => ({
  setRowType: (mode: DefinitionType, name: ArmyName, type: RowType, unit: UnitType | undefined) => (
    dispatch(setRowType(mode, name, type, unit))
  )
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
  info: ModalInfo | null
  onClose: () => void
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalRowTypeSelector)
