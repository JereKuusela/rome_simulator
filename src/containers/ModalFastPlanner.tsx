import React, { Component } from 'react'
import { List, Map } from 'immutable'
import { connect } from 'react-redux'
import { Modal, Button, Grid } from 'semantic-ui-react'
import { AppState } from '../store/'
import FastPlanner from '../components/FastPlanner'
import ArmyCosts from '../components/ArmyCosts'
import { UnitType, Unit } from '../store/units'
import { clearUnits, removeReserveUnits, addReserveUnits, doAddReserveUnits, doRemoveReserveUnits, invalidate } from '../store/battle'
import { getAttackerUnits, getDefenderUnits } from '../store/utils'
import { mapRange, mergeArmy } from '../utils'
import { CountryName } from '../store/countries'
import { DefinitionType } from '../base_definition'

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
    const country_a = this.props.attacker.name
    const country_d = this.props.defender.name
    const attacker = this.props.attacker
    const defender = this.props.defender
    const types_a = attacker.units.keySeq().toOrderedSet()
    const types_d = defender.units.keySeq().toOrderedSet()
    this.originals_a = types_a.reduce((map, value) => map.set(value, this.countUnits(attacker.reserve, value)), Map<UnitType, number>())
    this.originals_d = types_d.reduce((map, value) => map.set(value, this.countUnits(defender.reserve, value)), Map<UnitType, number>())
    return (
      <Modal basic onClose={this.onClose} open centered={false}>
        <Modal.Content>
          <FastPlanner
            attacker={country_a}
            defender={country_d}
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
            mode={this.props.mode}
            army_a={mergeArmy(attacker, attacker.frontline)}
            army_d={mergeArmy(defender, defender.frontline)}
            reserve_a={mergeArmy(attacker, this.editReserve(attacker.reserve, this.state.changes_a, this.originals_a))}
            reserve_d={mergeArmy(defender, this.editReserve(defender.reserve, this.state.changes_d, this.originals_d))}
            defeated_a={mergeArmy(attacker, attacker.defeated)}
            defeated_d={mergeArmy(defender, defender.defeated)}
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

  editReserve = (reserve: List<Unit>, changes: Units, originals?: Units): List<Unit> => {
    const units = this.getUnitsToAdd(changes, originals)
    const types = this.getTypesToRemove(changes, originals)
    return doRemoveReserveUnits(doAddReserveUnits(reserve, units), types)
  }

  onValueChange = (country: CountryName, unit: UnitType, value: number): void => {
    if (country === this.props.attacker.name)
      this.setState({ changes_a: this.state.changes_a.set(unit, value) })
    if (country === this.props.defender.name)
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

  updateReserve = (name: CountryName, changes: Units, originals?: Units): void => {
    const units = this.getUnitsToAdd(changes, originals)
    const types = this.getTypesToRemove(changes, originals)
    units.length > 0 && this.props.addReserveUnits(this.props.mode, name, units)
    types.length > 0 && this.props.removeReserveUnits(this.props.mode, name, types)
  }

  onClose = (): void => {
    this.updateReserve(this.props.attacker.name, this.state.changes_a, this.originals_a)
    this.updateReserve(this.props.defender.name, this.state.changes_d, this.originals_d)
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
  attacker: getAttackerUnits(state),
  defender: getDefenderUnits(state),
  units: state.units,
  global_stats: state.global_stats,
  mode: state.settings.mode
})

const mapDispatchToProps = (dispatch: any) => ({
  addReserveUnits: (mode: DefinitionType, name: CountryName, units: Unit[]) => dispatch(addReserveUnits(mode, name, units)) && dispatch(invalidate(mode)),
  removeReserveUnits: (mode: DefinitionType, name: CountryName, types: UnitType[]) => dispatch(removeReserveUnits(mode, name, types)) && dispatch(invalidate(mode)),
  clearUnits: (mode: DefinitionType) => dispatch(clearUnits(mode))
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
  open: boolean
  onClose: () => void
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalFastPlanner)
