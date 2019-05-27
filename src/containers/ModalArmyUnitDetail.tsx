import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Modal } from 'semantic-ui-react'
import { UnitType, ArmyName, ArmyType, ValueType, UnitDefinition } from '../store/units'
import { selectUnit } from '../store/land_battle'
import { AppState } from '../store/'
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
            unit={this.getUnit(this.props.info)}
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
    this.props.selectUnit(this.props.info.army, this.props.info.type, this.props.info.index, unit ? this.props.units.getIn([this.props.info.army, unit]) : null)
  )

  setBaseValue = (army: ArmyName, _type: UnitType, key: string, attribute: ValueType, value: number) => {
    if (!this.props.info)
      return
    const unit = this.getUnit(this.props.info).add_base_value(key, attribute, value)
    this.props.selectUnit(army, this.props.info.type, this.props.info.index, unit)
  }

  setModifierValue = (army: ArmyName, _type: UnitType, key: string, attribute: ValueType, value: number) => {
    if (!this.props.info)
      return
    const unit = this.getUnit(this.props.info).add_modifier_value(key, attribute, value)
    this.props.selectUnit(army, this.props.info.type, this.props.info.index, unit)
  }

  setLossValue = (army: ArmyName, _type: UnitType, key: string, attribute: ValueType, value: number) => {
    if (!this.props.info)
      return
    const unit = this.getUnit(this.props.info).add_loss_value(key, attribute, value)
    this.props.selectUnit(army, this.props.info.type, this.props.info.index, unit)
  }

  getUnit = (info: ModalInfo): UnitDefinition => {
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
  units: state.units.units
})

const mapDispatchToProps = (dispatch: any) => ({
  selectUnit: (army: ArmyName, type: ArmyType, column: number, unit: UnitDefinition | undefined) => (
    dispatch(selectUnit(army, type, column, unit))
  )
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
  info: ModalInfo | null
  onClose: () => void
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalArmyUnitDetail)
