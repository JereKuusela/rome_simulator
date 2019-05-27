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
  row: number
  column: number
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

  selectUnit = (unit: UnitType | null) => (
    this.props.info &&
    this.props.selectUnit(this.props.info.army, this.props.info.type, this.props.info.row, this.props.info.column, unit ? this.props.units.getIn([this.props.info.army, unit]) : null)
  )

  setBaseValue = (army: ArmyName, _type: UnitType, key: string, attribute: ValueType, value: number) => {
    if (!this.props.info)
      return
    const unit = this.getUnit(this.props.info).add_base_value(key, attribute, value)
    this.props.selectUnit(army, this.props.info.type, this.props.info.row, this.props.info.column, unit)
  }

  setModifierValue = (army: ArmyName, _type: UnitType, key: string, attribute: ValueType, value: number) => {
    if (!this.props.info)
      return
    const unit = this.getUnit(this.props.info).add_modifier_value(key, attribute, value)
    this.props.selectUnit(army, this.props.info.type, this.props.info.row, this.props.info.column, unit)
  }

  setLossValue = (army: ArmyName, _type: UnitType, key: string, attribute: ValueType, value: number) => {
    if (!this.props.info)
      return
    const unit = this.getUnit(this.props.info).add_loss_value(key, attribute, value)
    this.props.selectUnit(army, this.props.info.type, this.props.info.row, this.props.info.column, unit)
  }

  getUnit = (info: ModalInfo): UnitDefinition => {
    if (info.type === ArmyType.Main) {
      if (info.army === ArmyName.Attacker)
        return this.props.attacker.army.getIn([info.row, info.column])
      else
        return this.props.defender.army.getIn([info.row, info.column])
    }
    else if (info.type === ArmyType.Reserve) {
      if (info.army === ArmyName.Attacker)
        return this.props.attacker.reserve.getIn([info.row, info.column])
      else
        return this.props.defender.reserve.getIn([info.row, info.column])
    }
    else {
      if (info.army === ArmyName.Attacker)
        return this.props.attacker.defeated.getIn([info.row, info.column])
      else
        return this.props.defender.defeated.getIn([info.row, info.column])
    }
  }
}

const mapStateToProps = (state: AppState) => ({
  attacker: state.land.attacker,
  defender: state.land.defender,
  units: state.units.units
})

const mapDispatchToProps = (dispatch: any) => ({
  selectUnit: (army: ArmyName, type: ArmyType, row: number, column: number, unit: UnitDefinition | null) => (
    dispatch(selectUnit(army, type, row, column, unit))
  )
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
  info: ModalInfo | null
  onClose: () => void
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalArmyUnitDetail)
