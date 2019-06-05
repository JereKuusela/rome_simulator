import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Modal } from 'semantic-ui-react'
import { UnitType, ArmyName, ArmyType, ValueType, Unit, UnitDefinition } from '../store/units'
import { selectUnit } from '../store/land_battle'
import { AppState } from '../store/'
import { add_base_value, add_modifier_value, add_loss_value, merge_values } from '../base_definition'
import ItemSelector from '../components/ItemSelector'
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
          <ItemSelector
            onClose={this.props.onClose}
            onSelection={this.selectUnit}
            items={this.props.units.get(this.props.info.army)!.toList()}
            attributes={[]}
            can_remove={true}
            can_select={false}
          />
          <UnitDetail
            army={this.props.info.army}
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
    const unit = add_base_value(this.getUnit(this.props.info), key, attribute, value)
    this.props.selectUnit(army, this.props.info.type, this.props.info.index, unit)
  }

  setModifierValue = (army: ArmyName, _type: UnitType, key: string, attribute: ValueType, value: number) => {
    if (!this.props.info)
      return
    const unit = add_modifier_value(this.getUnit(this.props.info), key, attribute, value)
    this.props.selectUnit(army, this.props.info.type, this.props.info.index, unit)
  }

  setLossValue = (army: ArmyName, _type: UnitType, key: string, attribute: ValueType, value: number) => {
    if (!this.props.info)
      return
    const unit = add_loss_value(this.getUnit(this.props.info), key, attribute, value)
    this.props.selectUnit(army, this.props.info.type, this.props.info.index, unit)
  }

  getUnitDefinition = (info: ModalInfo): UnitDefinition => (this.mergeAllValues(info.army, this.getUnit(info)))

  mergeAllValues = (name: ArmyName, unit: Unit): UnitDefinition => {
    return merge_values(merge_values(this.props.units.getIn([name, unit.type]), unit), this.props.global_stats.get(name)!)
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
  global_stats: state.global_stats
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
