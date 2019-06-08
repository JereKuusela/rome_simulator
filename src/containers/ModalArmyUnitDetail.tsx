import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Modal } from 'semantic-ui-react'
import { UnitType, ArmyName, ArmyType, ValueType, Unit, UnitDefinition } from '../store/units'
import { selectUnit } from '../store/land_battle'
import { AppState } from '../store/'
import { addBaseValues, addModifierValue, addLossValue, mergeValues } from '../base_definition'
import ItemRemover from '../components/ItemRemover'
import UnitDetail from '../components/UnitDetail'

const CUSTOM_VALUE_KEY = 'Unit'

export interface ModalInfo {
  army: ArmyName
  index: number
  type: ArmyType
}

class ModalArmyUnitDetail extends Component<IProps> {
  render() {
    if (!this.props.info)
      return null
    return (
      <Modal basic onClose={this.props.onClose} open>
        <Modal.Content>
          <ItemRemover
            onClose={this.props.onClose}
            onRemove={() => this.selectUnit(undefined)}
          />
          <UnitDetail
            army={this.props.info.army}
            terrains={this.props.terrains}
            custom_value_key={CUSTOM_VALUE_KEY}
            unit={this.getUnitDefinition(this.props.info)}
            onCustomBaseValueChange={this.setBaseValue}
            onCustomModifierValueChange={this.setModifierValue}
            onCustomLossValueChange={this.setLossValue}
            show_statistics={true}
          />
        </Modal.Content>
      </Modal>
    )
  }

  selectUnit = (unit: UnitType | undefined) => (
    this.props.info &&
    this.props.selectUnit(this.props.info.army, this.props.info.type, this.props.info.index, unit ? this.props.units.getIn([this.props.info.army, unit]) : undefined)
  )

  setBaseValue = (army: ArmyName, _type: UnitType, key: string, attribute: ValueType, value: number) => {
    if (!this.props.info)
      return
    const unit = addBaseValues(this.getUnit(this.props.info), key, attribute, value)
    this.props.selectUnit(army, this.props.info.type, this.props.info.index, unit)
  }

  setModifierValue = (army: ArmyName, _type: UnitType, key: string, attribute: ValueType, value: number) => {
    if (!this.props.info)
      return
    const unit = addModifierValue(this.getUnit(this.props.info), key, attribute, value)
    this.props.selectUnit(army, this.props.info.type, this.props.info.index, unit)
  }

  setLossValue = (army: ArmyName, _type: UnitType, key: string, attribute: ValueType, value: number) => {
    if (!this.props.info)
      return
    const unit = addLossValue(this.getUnit(this.props.info), key, attribute, value)
    this.props.selectUnit(army, this.props.info.type, this.props.info.index, unit)
  }

  getUnitDefinition = (info: ModalInfo): UnitDefinition => (this.mergeAllValues(info.army, this.getUnit(info)))

  mergeAllValues = (name: ArmyName, unit: Unit): UnitDefinition => {
    return mergeValues(mergeValues(this.props.units.getIn([name, unit.type]), unit), this.props.global_stats.get(name)!)
  }

  getUnit = (info: ModalInfo): Unit => {
    if (info.type === ArmyType.Main) {
      if (info.army === ArmyName.Attacker)
        return this.props.attacker.army.get(info.index)!
      else
        return this.props.defender.army.get(info.index)!
    }
    else if (info.type === ArmyType.Reserve) {
      if (info.army === ArmyName.Attacker)
        return this.props.attacker.reserve.get(info.index)!
      else
        return this.props.defender.reserve.get(info.index)!
    }
    else {
      if (info.army === ArmyName.Attacker)
        return this.props.attacker.defeated.get(info.index)!
      else
        return this.props.defender.defeated.get(info.index)!
    }
  }
}

const mapStateToProps = (state: AppState) => ({
  attacker: state.land.attacker,
  defender: state.land.defender,
  units: state.units.definitions,
  global_stats: state.global_stats,
  terrains: state.terrains.types
})

const mapDispatchToProps = (dispatch: any) => ({
  selectUnit: (army: ArmyName, type: ArmyType, column: number, unit: Unit | undefined) => (
    dispatch(selectUnit(army, type, column, unit))
  )
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
  info: ModalInfo | null
  onClose: () => void
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalArmyUnitDetail)
