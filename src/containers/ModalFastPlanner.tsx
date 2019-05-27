import React, { Component } from 'react'
import { List, Map } from 'immutable'
import { connect } from 'react-redux'
import { Modal } from 'semantic-ui-react'
import { AppState } from '../store/'
import FastPlanner from '../components/FastPlanner'
import { ArmyName, UnitType, UnitDefinition } from '../store/units'
import { removeReserveUnits, addReserveUnits } from '../store/land_battle'
import { mapRange } from '../utils';

class ModalFastPlanner extends Component<IProps> {
  readonly units = Object.keys(UnitType).map(k => UnitType[k as any]).sort() as UnitType[]

  changes_a = Map<UnitType, number>()
  changes_d = Map<UnitType, number>()

  originals_a = Map<UnitType, number>()
  originals_d = Map<UnitType, number>()

  render() {
    if (!this.props.open)
      return null
    this.originals_a = this.units.reduce((map, value) => map.set(value, this.countUnits(this.props.reserve_a, value)), Map<UnitType, number>())
    this.originals_d = this.units.reduce((map, value) => map.set(value, this.countUnits(this.props.reserve_b, value)), Map<UnitType, number>())
    return (
      <Modal basic onClose={this.onClose} open centered={false}>
        <Modal.Content>
          <FastPlanner
            reserve_a={this.originals_a}
            reserve_b={this.originals_d}
            onValueChange={this.onValueChange}
          />
        </Modal.Content>
      </Modal>
    )
  }

  onValueChange = (name: ArmyName, unit: UnitType, value: number) => {
    if (name === ArmyName.Attacker)
      this.changes_a = this.changes_a.set(unit, value)
    if (name === ArmyName.Defender)
      this.changes_d = this.changes_d.set(unit, value)
  }

  updateReserve = (army: ArmyName, changes: Map<UnitType, number>, originals: Map<UnitType, number>) => {
    let units: UnitDefinition[] = []
    let types: UnitType[] = []
    changes.forEach((value, key) => {
      const original = originals.get(key, 0)
      if (value > original)
        units = units.concat(mapRange(value - original, _ => this.props.units.get(ArmyName.Attacker)!.get(key)!))
      else
        types = types.concat(mapRange(original - value, _ => key))
    })
    units.length > 0 && this.props.addReserveUnits(army, units)
    types.length > 0 && this.props.removeReserveUnits(army, types)
  }

  onClose = () => {
    this.updateReserve(ArmyName.Attacker, this.changes_a, this.originals_a)
    this.updateReserve(ArmyName.Defender, this.changes_d, this.originals_d)
    this.changes_a.clear()
    this.changes_d.clear()
    this.props.onClose()
  }

  countUnits = (reserve: List<UnitDefinition>, unit: UnitType) => reserve.reduce((previous, current) => previous + (current && current.type === unit ? 1 : 0), 0)
}

const mapStateToProps = (state: AppState) => ({
  reserve_a: state.land.attacker.reserve,
  reserve_b: state.land.defender.reserve,
  units: state.units.units
})

const mapDispatchToProps = (dispatch: any) => ({
  addReserveUnits: (army: ArmyName, units: UnitDefinition[]) => dispatch(addReserveUnits(army, units)),
  removeReserveUnits: (army: ArmyName, types: UnitType[]) => dispatch(removeReserveUnits(army, types))
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
  open: boolean
  onClose: () => void
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalFastPlanner)
