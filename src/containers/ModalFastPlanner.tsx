import React, { Component } from 'react'
import { Map } from 'immutable'
import { connect } from 'react-redux'
import { Modal, Button, Grid } from 'semantic-ui-react'
import { AppState } from '../store/'
import FastPlanner from '../components/FastPlanner'
import ArmyCosts from '../components/ArmyCosts'
import { UnitType, BaseUnit } from '../store/units'
import { clearUnits, removeReserveUnits, addReserveUnits, doAddReserveUnits, doRemoveReserveUnits, invalidate, Side, BaseReserve } from '../store/battle'
import { getBaseUnits, filterUnitTypes, getParticipant, getUnitDefinitions } from '../store/utils'
import { mapRange } from '../utils'
import { getNextId, mergeBaseUnitsWithDefinitions } from '../army_utils'
import { CountryName } from '../store/countries'
import { Mode } from '../base_definition'

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

  originals_a? = Map<UnitType, number>()
  originals_d? = Map<UnitType, number>()

  render(): JSX.Element | null {
    if (!this.props.open)
      return null
    //// The logic is bit tricky here.
    //Base units are needed because there might be custom changes.
    let base_units_a = { ...this.props.base_units_a }
    let base_units_d = { ...this.props.base_units_d }
    const types_a = this.props.types_a
    const types_d = this.props.types_d
    this.originals_a = Array.from(types_a).reduce((map, value) => map.set(value, this.countUnits(base_units_a.reserve, value)), Map<UnitType, number>())
    this.originals_d = Array.from(types_d).reduce((map, value) => map.set(value, this.countUnits(base_units_d.reserve, value)), Map<UnitType, number>())
    // Current changes to the reserve must alse be applied.
    base_units_a = { ...base_units_a, reserve: this.editReserve(base_units_a.reserve, this.state.changes_a, this.originals_a) }
    base_units_d = { ...base_units_d, reserve: this.editReserve(base_units_d.reserve, this.state.changes_d, this.originals_d) }
    // And finally both merged with definitions to get real values.
    const units_a = mergeBaseUnitsWithDefinitions(base_units_a, this.props.definitions_a)
    const units_d = mergeBaseUnitsWithDefinitions(base_units_d, this.props.definitions_d)
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
            mode={this.props.mode}
            frontline_a={units_a.frontline}
            frontline_d={units_d.frontline}
            reserve_a={units_a.reserve}
            reserve_d={units_d.reserve}
            defeated_a={units_a.defeated}
            defeated_d={units_d.defeated}
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

  editReserve = (reserve: BaseReserve, changes: Units, originals?: Units): BaseReserve => {
    const units = this.getUnitsToAdd(changes, originals)
    const types = this.getTypesToRemove(changes, originals)
    return doRemoveReserveUnits(doAddReserveUnits(reserve, units), types)
  }

  onValueChange = (side: Side, unit: UnitType, value: number): void => {
    if (side === Side.Attacker)
      this.setState({ changes_a: this.state.changes_a.set(unit, value) })
    if (side === Side.Defender)
      this.setState({ changes_d: this.state.changes_d.set(unit, value) })
  }

  getUnitsToAdd = (changes: Units, originals?: Units): BaseReserve => {
    let units: BaseReserve = []
    changes.forEach((value, key) => {
      const original = originals ? originals.get(key, 0) : 0
      if (value > original)
        units = units.concat(mapRange(value - original, _ => ({ id: getNextId(), type: key  })))
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
    this.updateReserve(this.props.attacker, this.state.changes_a, this.originals_a)
    this.updateReserve(this.props.defender, this.state.changes_d, this.originals_d)
    this.setState({ changes_a: Map<UnitType, number>(), changes_d: Map<UnitType, number>() })
    this.props.onClose()
  }

  countUnits = (reserve: BaseUnit[], unit: UnitType): number => reserve.reduce((previous, current) => previous + (current && current.type === unit ? 1 : 0), 0)

  clearUnits = (): void => {
    this.setState({ changes_a: Map<UnitType, number>(), changes_d: Map<UnitType, number>() })
    this.props.clearUnits(this.props.mode)
  }
}

const mapStateToProps = (state: AppState) => ({
  attacker: getParticipant(state, Side.Attacker).name,
  defender: getParticipant(state, Side.Defender).name,
  base_units_a: getBaseUnits(state, Side.Attacker),
  base_units_d: getBaseUnits(state, Side.Defender),
  types_a: filterUnitTypes(state, Side.Attacker),
  types_d: filterUnitTypes(state, Side.Defender),
  definitions_a: getUnitDefinitions(state, Side.Attacker),
  definitions_d: getUnitDefinitions(state, Side.Defender),
  units: state.units,
  global_stats: state.global_stats,
  mode: state.settings.mode
})

const mapDispatchToProps = (dispatch: any) => ({
  addReserveUnits: (mode: Mode, name: CountryName, units: BaseUnit[]) => dispatch(addReserveUnits(mode, name, units)) && dispatch(invalidate(mode)),
  removeReserveUnits: (mode: Mode, name: CountryName, types: UnitType[]) => dispatch(removeReserveUnits(mode, name, types)) && dispatch(invalidate(mode)),
  clearUnits: (mode: Mode) => dispatch(clearUnits(mode))
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
  open: boolean
  onClose: () => void
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalFastPlanner)
