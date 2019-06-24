import React, { Component } from 'react'
import { List, Map } from 'immutable'
import { connect } from 'react-redux'
import { Modal, Button, Grid } from 'semantic-ui-react'
import { AppState } from '../store/'
import FastPlanner from '../components/FastPlanner'
import ArmyCosts from '../components/ArmyCosts'
import { ArmyName, UnitType, Unit, UnitDefinition } from '../store/units'
import { clearUnits, removeReserveUnits, addReserveUnits, doAddReserveUnits, doRemoveReserveUnits } from '../store/battle'
import { mapRange, getBattle } from '../utils'
import { mergeValues, DefinitionType } from '../base_definition'

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

  originals_a?= Map<UnitType, number>()
  originals_d?= Map<UnitType, number>()

  render(): JSX.Element | null {
    if (!this.props.open)
      return null
    const types_a = this.filterTypes(this.props.attacker)
    const types_d = this.filterTypes(this.props.defender)
    const attacker = this.props.armies.get(this.props.attacker)
    const defender = this.props.armies.get(this.props.defender)
    this.originals_a = attacker && types_a && types_a.reduce((map, value) => map.set(value, this.countUnits(attacker.reserve, value)), Map<UnitType, number>())
    this.originals_d = defender && types_d && types_d.reduce((map, value) => map.set(value, this.countUnits(defender.reserve, value)), Map<UnitType, number>())
    return (
      <Modal basic onClose={this.onClose} open centered={false}>
        <Modal.Content>
          <FastPlanner
            changes_a={this.state.changes_a}
            reserve_a={this.originals_a}
            units={this.props.units}
            types_a={types_a}
            changes_d={this.state.changes_d}
            reserve_d={this.originals_d}
            types_d={types_d}
            onValueChange={this.onValueChange}
            attached
          />
          <ArmyCosts
            army_a={attacker && this.mergeAllValues(this.props.attacker, attacker.frontline)}
            army_d={defender && this.mergeAllValues(this.props.defender, defender.frontline)}
            reserve_a={attacker && this.mergeAllValues(this.props.attacker, this.editReserve(attacker.reserve, this.state.changes_a, this.originals_a))}
            reserve_d={defender && this.mergeAllValues(this.props.defender, this.editReserve(defender.reserve, this.state.changes_d, this.originals_d))}
            defeated_a={attacker && this.mergeAllValues(this.props.attacker, attacker.defeated)}
            defeated_d={defender && this.mergeAllValues(this.props.defender, defender.defeated)}
            attached
          />
          <br />
          <Grid>
            <Grid.Row columns='2'>
              <Grid.Column>
                <Button primary size='large' onClick={this.onClose} style={{ width: '100%' }}>
                  Close
                </Button>
              </Grid.Column>
              <Grid.Column>
                <Button negative size='large' onClick={this.clearUnits} style={{ width: '100%' }}>
                  Clear all units
                </Button>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Modal.Content>
      </Modal>
    )
  }

  filterTypes = (name: ArmyName) => {
    return this.props.types.get(name)!.filter(type => {
      const unit = this.props.units.getIn([name, type]) as UnitDefinition | undefined
      if (!unit)
        return false
      return unit.mode === this.props.mode || unit.mode === DefinitionType.Any
    })
  }

  mergeAllValues = (name: ArmyName, army: List<Unit | undefined>): List<any> => {
    return army.map(value => value && mergeValues(mergeValues(this.props.units.getIn([name, value.type]), value), this.props.global_stats.getIn([name, this.props.mode])))
  }

  editReserve = (reserve: List<Unit>, changes: Units, originals?: Units): List<Unit> => {
    const units = this.getUnitsToAdd(changes, originals)
    const types = this.getTypesToRemove(changes, originals)
    return doRemoveReserveUnits(doAddReserveUnits(reserve, units), types)
  }

  onValueChange = (name: ArmyName, unit: UnitType, value: number): void => {
    if (name === ArmyName.Attacker)
      this.setState({ changes_a: this.state.changes_a.set(unit, value) })
    if (name === ArmyName.Defender)
      this.setState({ changes_d: this.state.changes_d.set(unit, value) })
  }

  getUnitsToAdd = (changes: Units, originals?: Units): Unit[] => {
    let units: Unit[] = []
    changes.forEach((value, key) => {
      const original = originals ? originals.get(key, 0) : 0
      if (value > original)
        units = units.concat(mapRange(value - original, _ => ({ type: key })))
    })
    return units
  }

  getTypesToRemove = (changes: Units, originals?: Units): UnitType[] => {
    let types: UnitType[] = []
    changes.forEach((value, key) => {
      const original = originals ? originals.get(key, 0) : 0
      if (value < original)
        types = types.concat(mapRange(original - value, _ => key))
    })
    return types
  }

  updateReserve = (name: ArmyName, changes: Units, originals?: Units): void => {
    const units = this.getUnitsToAdd(changes, originals)
    const types = this.getTypesToRemove(changes, originals)
    units.length > 0 && this.props.addReserveUnits(this.props.mode, name, units)
    types.length > 0 && this.props.removeReserveUnits(this.props.mode, name, types)
  }

  onClose = (): void => {
    this.updateReserve(this.props.attacker, this.state.changes_a, this.originals_a)
    this.updateReserve(this.props.defender, this.state.changes_d, this.originals_d)
    this.setState({ changes_a: Map<UnitType, number>(), changes_d: Map<UnitType, number>() })
    this.props.onClose()
  }

  countUnits = (reserve: List<Unit>, unit: UnitType): number => reserve.reduce((previous, current) => previous + (current && current.type === unit ? 1 : 0), 0)

  clearUnits = (): void => {
    this.setState({ changes_a: Map<UnitType, number>(), changes_d: Map<UnitType, number>() })
    this.props.clearUnits(this.props.mode)
  }
}

const mapStateToProps = (state: AppState) => ({
  attacker: getBattle(state).attacker,
  defender: getBattle(state).defender,
  armies: getBattle(state).armies,
  units: state.units.definitions,
  types: state.units.types,
  global_stats: state.global_stats,
  mode: state.settings.mode
})

const mapDispatchToProps = (dispatch: any) => ({
  addReserveUnits: (mode: DefinitionType, name: ArmyName, units: Unit[]) => dispatch(addReserveUnits(mode, name, units)),
  removeReserveUnits: (mode: DefinitionType, name: ArmyName, types: UnitType[]) => dispatch(removeReserveUnits(mode, name, types)),
  clearUnits: (mode: DefinitionType) => dispatch(clearUnits(mode))
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
  open: boolean
  onClose: () => void
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalFastPlanner)
