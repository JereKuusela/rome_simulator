import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Modal } from 'semantic-ui-react'
import { UnitType, ArmyType, ValueType, UnitDefinition } from '../store/units'
import { selectUnit, selectDefeatedUnit } from '../store/land_battle'
import { AppState } from '../store/'
import ItemSelector from '../components/ItemSelector'
import UnitDetail from '../components/UnitDetail'

const CUSTOM_VALUE_KEY = 'Unit'

export interface ModalInfo {
  army: ArmyType
  row: number
  column: number
  is_defeated: boolean
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
    this.props.info && (this.props.info.is_defeated ?
      this.props.selectDefeatedUnit(this.props.info.army, this.props.info.row, this.props.info.column, unit ? this.props.units.getIn([this.props.info.army, unit]) : null) :
      this.props.selectUnit(this.props.info.army, this.props.info.row, this.props.info.column, unit ? this.props.units.getIn([this.props.info.army, unit]) : null))
  )

  setBaseValue = (army: ArmyType, _type: UnitType, key: string, attribute: ValueType, value: number) => {
    if (!this.props.info)
      return
    const unit = this.getUnit(this.props.info).add_base_value(key, attribute, value)
    if (this.props.info.is_defeated)
      this.props.selectDefeatedUnit(army, this.props.info.row, this.props.info.column, unit)
    else
      this.props.selectUnit(army, this.props.info.row, this.props.info.column, unit)
  }

  setModifierValue = (army: ArmyType, _type: UnitType, key: string, attribute: ValueType, value: number) => {
    if (!this.props.info)
      return
    const unit = this.getUnit(this.props.info).add_modifier_value(key, attribute, value)
    if (this.props.info.is_defeated)
      this.props.selectDefeatedUnit(army, this.props.info.row, this.props.info.column, unit)
    else
      this.props.selectUnit(army, this.props.info.row, this.props.info.column, unit)
  }

  setLossValue = (army: ArmyType, _type: UnitType, key: string, attribute: ValueType, value: number) => {
    if (!this.props.info)
      return
    const unit = this.getUnit(this.props.info).add_loss_value(key, attribute, value)
    if (this.props.info.is_defeated)
      this.props.selectDefeatedUnit(army, this.props.info.row, this.props.info.column, unit)
    else
      this.props.selectUnit(army, this.props.info.row, this.props.info.column, unit)
  }

  getUnit = (info: ModalInfo): UnitDefinition => {
    if (info.is_defeated) {
      if (info.army === ArmyType.Attacker)
      return this.props.attacker.defeated_army.getIn([info.row, info.column])
    else
      return this.props.defender.defeated_army.getIn([info.row, info.column])
    }
    else {
      if (info.army === ArmyType.Attacker)
      return this.props.attacker.army.getIn([info.row, info.column])
    else
      return this.props.defender.army.getIn([info.row, info.column])
    }
  }
}

const mapStateToProps = (state: AppState) => ({
  attacker: state.land.attacker,
  defender: state.land.defender,
  units: state.units.units
})

const mapDispatchToProps = (dispatch: any) => ({
  selectUnit: (army: ArmyType, row: number, column: number, unit: UnitDefinition | null) => (
    dispatch(selectUnit(army, row, column, unit))
  ),
  selectDefeatedUnit: (army: ArmyType, row: number, column: number, unit: UnitDefinition | null) => (
    dispatch(selectDefeatedUnit(army, row, column, unit))
  )
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
  info: ModalInfo | null
  onClose: () => void
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalArmyUnitDetail)
