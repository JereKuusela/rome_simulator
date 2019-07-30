import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Modal } from 'semantic-ui-react'
import { UnitType, ValueType, Unit, UnitDefinition } from '../store/units'
import { ArmyType, selectUnit } from '../store/battle'
import { AppState } from '../store/'
import { getAttacker, getDefender, filterTerrainTypes, mergeUnitTypes } from '../store/utils'
import { addValues, mergeValues, ValuesType, DefinitionType } from '../base_definition'
import ItemRemover from '../components/ItemRemover'
import UnitDetail from '../components/UnitDetail'
import { invalidateCountry } from '../store/battle'
import { CountryName } from '../store/countries'

const CUSTOM_VALUE_KEY = 'Unit'

export interface ModalInfo {
  country: CountryName
  index: number
  type: ArmyType
}

class ModalArmyUnitDetail extends Component<IProps> {

  unit: Unit = undefined!

  render(): JSX.Element | null {
    if (!this.props.info)
      return null
    const country = this.props.info.country
    this.unit = this.getUnit(this.props.info)
    return (
      <Modal basic onClose={this.props.onClose} open>
        <Modal.Content>
          <ItemRemover
            onClose={this.props.onClose}
            onRemove={() => this.selectUnit(undefined)}
          />
          <UnitDetail
            mode={this.props.mode}
            name={country}
            terrain_types={this.props.terrain_types}
            custom_value_key={CUSTOM_VALUE_KEY}
            unit={this.getUnitDefinition(this.props.info)}
            units={this.props.units}
            unit_types={this.props.unit_types}
            unit_types_as_dropdown={true}
            onTypeChange={this.changeType}
            onCustomBaseValueChange={this.setBaseValue}
            onCustomModifierValueChange={this.setModifierValue}
            onCustomLossValueChange={this.setLossValue}
            show_statistics={true}
          />
        </Modal.Content>
      </Modal>
    )
  }

  selectUnit = (unit: UnitType | undefined): void => (
    this.props.info &&
    this.props.selectUnit(this.props.mode, this.props.info.country, this.props.info.type, this.props.info.index, unit ? this.props.units.getIn([this.props.info.country, unit]) : undefined)
  )

  setBaseValue = (country: CountryName, _type: UnitType, key: string, attribute: ValueType, value: number): void => {
    if (!this.props.info)
      return
    const unit = addValues(this.unit, ValuesType.Base, key, [[attribute, value]])
    this.props.selectUnit(this.props.mode, country, this.props.info.type, this.props.info.index, unit)
  }

  setModifierValue = (country: CountryName, _type: UnitType, key: string, attribute: ValueType, value: number): void => {
    if (!this.props.info)
      return
    const unit = addValues(this.unit, ValuesType.Modifier, key, [[attribute, value]])
    this.props.selectUnit(this.props.mode, country, this.props.info.type, this.props.info.index, unit)
  }

  setLossValue = (country: CountryName, _type: UnitType, key: string, attribute: ValueType, value: number): void => {
    if (!this.props.info)
      return
    const unit = addValues(this.unit, ValuesType.Loss, key, [[attribute, value]])
    this.props.selectUnit(this.props.mode, country, this.props.info.type, this.props.info.index, unit)
  }

  changeType = (country: CountryName, _old_type: UnitType, new_type: UnitType): void => {
    if (!this.props.info)
      return
    const unit = { ...this.unit, type: new_type }
    this.props.selectUnit(this.props.mode, country, this.props.info.type, this.props.info.index, unit)
  }

  getUnitDefinition = (info: ModalInfo): UnitDefinition => (this.mergeAllValues(info.country, this.getUnit(info)))

  mergeAllValues = (name: CountryName, unit: Unit): UnitDefinition => {
    return mergeValues(mergeValues(this.props.units.getIn([name, unit.type]), unit), this.props.global_stats.getIn([name, this.props.mode]))
  }

  getUnit = (info: ModalInfo): Unit => {
    const army = info.country === this.props.attacker.name ? this.props.attacker : this.props.defender
    if (info.type === ArmyType.Frontline)
      return army.frontline.get(info.index)!
    else if (info.type === ArmyType.Reserve)
      return army.reserve.get(info.index)!
    else
      return army.defeated.get(info.index)!
  }
}

const mapStateToProps = (state: AppState) => ({
  attacker: getAttacker(state),
  defender: getDefender(state),
  units: state.units,
  unit_types: mergeUnitTypes(state),
  global_stats: state.global_stats,
  terrain_types: filterTerrainTypes(state),
  mode: state.settings.mode
})

const mapDispatchToProps = (dispatch: any) => ({
  selectUnit: (mode: DefinitionType, country: CountryName, type: ArmyType, column: number, unit: Unit | undefined) => (
    dispatch(selectUnit(mode, country, type, column, unit)) && dispatch(invalidateCountry(country))
  )
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
  info: ModalInfo | null
  onClose: () => void
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalArmyUnitDetail)
