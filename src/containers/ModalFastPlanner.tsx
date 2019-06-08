import React, { Component } from 'react'
import { List, Map } from 'immutable'
import { connect } from 'react-redux'
import { Modal } from 'semantic-ui-react'
import { AppState } from '../store/'
import FastPlanner from '../components/FastPlanner'
import ArmyCosts from '../components/ArmyCosts'
import { ArmyName, UnitType, Unit } from '../store/units'
import { removeReserveUnits, addReserveUnits, doAddReserveUnits, doRemoveReserveUnits } from '../store/land_battle'
import { mapRange } from '../utils'
import { mergeValues } from '../base_definition'

type Units = Map<UnitType, number>

interface IState {
  changes_a: Units
  changes_d: Units
}

class ModalFastPlanner extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props)
    this.state = { changes_a: Map<UnitType, number>(), changes_d: Map<UnitType, number>() }
  }

  originals_a = Map<UnitType, number>()
  originals_d = Map<UnitType, number>()

  render() {
    if (!this.props.open)
      return null
    this.originals_a = this.props.types.get(ArmyName.Attacker)!.reduce((map, value) => map.set(value, this.countUnits(this.props.attacker.reserve, value)), Map<UnitType, number>())
    this.originals_d = this.props.types.get(ArmyName.Defender)!.reduce((map, value) => map.set(value, this.countUnits(this.props.defender.reserve, value)), Map<UnitType, number>())
    return (
      <Modal basic onClose={this.onClose} open centered={false}>
        <Modal.Content>
          <FastPlanner
            reserve_a={this.originals_a}
            units={this.props.units}
            types_a={this.props.types.get(ArmyName.Attacker)!}
            reserve_d={this.originals_d}
            types_d={this.props.types.get(ArmyName.Defender)!}
            onValueChange={this.onValueChange}
            attached
          />
          <ArmyCosts
            army_a={this.mergeAllValues(ArmyName.Attacker, this.props.attacker.army)}
            army_d={this.mergeAllValues(ArmyName.Defender, this.props.defender.army)}
            reserve_a={this.mergeAllValues(ArmyName.Attacker, this.editReserve(this.props.attacker.reserve, this.originals_a, this.state.changes_a))}
            reserve_d={this.mergeAllValues(ArmyName.Defender, this.editReserve(this.props.defender.reserve, this.originals_d, this.state.changes_d))}
            defeated_a={this.mergeAllValues(ArmyName.Attacker, this.props.attacker.defeated)}
            defeated_d={this.mergeAllValues(ArmyName.Defender, this.props.defender.defeated)}
            attached
           />
        </Modal.Content>
      </Modal>
    )
  }

  mergeAllValues = (name: ArmyName, army: List<Unit | undefined>) => {
    return army.map(value => value && mergeValues(mergeValues(this.props.units.getIn([name, value.type]), value), this.props.global_stats.get(name)!))
  }

  editReserve = (reserve: List<Unit>, originals: Units, changes: Units) => {
    const units = this.getUnitsToAdd(changes, originals)
    const types = this.getTypesToRemove(changes, originals)
    return doRemoveReserveUnits(doAddReserveUnits(reserve, units), types)
  }

  onValueChange = (name: ArmyName, unit: UnitType, value: number) => {
    if (name === ArmyName.Attacker)
      this.setState({changes_a: this.state.changes_a.set(unit, value)})
    if (name === ArmyName.Defender)
      this.setState({changes_d: this.state.changes_d.set(unit, value)})
  }

  getUnitsToAdd = (changes: Units, originals: Units) => {
    let units: Unit[] = []
    changes.forEach((value, key) => {
      const original = originals.get(key, 0)
      if (value > original)
        units = units.concat(mapRange(value - original, _ => ({ type: key, image: '' })))
    })
    return units
  }

  getTypesToRemove = (changes: Units, originals: Units) => {
    let types: UnitType[] = []
    changes.forEach((value, key) => {
      const original = originals.get(key, 0)
      if (value < original)
        types = types.concat(mapRange(original - value, _ => key))
    })
    return types
  }

  updateReserve = (army: ArmyName, changes: Units, originals: Units) => {
    const units = this.getUnitsToAdd(changes, originals)
    const types = this.getTypesToRemove(changes, originals)
    units.length > 0 && this.props.addReserveUnits(army, units)
    types.length > 0 && this.props.removeReserveUnits(army, types)
  }

  onClose = () => {
    this.updateReserve(ArmyName.Attacker, this.state.changes_a, this.originals_a)
    this.updateReserve(ArmyName.Defender, this.state.changes_d, this.originals_d)
    this.setState({ changes_a: Map<UnitType, number>(), changes_d: Map<UnitType, number>() })
    this.props.onClose()
  }

  countUnits = (reserve: List<Unit>, unit: UnitType) => reserve.reduce((previous, current) => previous + (current && current.type === unit ? 1 : 0), 0)
}

const mapStateToProps = (state: AppState) => ({
  attacker: state.land.attacker,
  defender: state.land.defender,
  units: state.units.definitions,
  types: state.units.types,
  global_stats: state.global_stats
})

const mapDispatchToProps = (dispatch: any) => ({
  addReserveUnits: (army: ArmyName, units: Unit[]) => dispatch(addReserveUnits(army, units)),
  removeReserveUnits: (army: ArmyName, types: UnitType[]) => dispatch(removeReserveUnits(army, types))
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
  open: boolean
  onClose: () => void
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalFastPlanner)
