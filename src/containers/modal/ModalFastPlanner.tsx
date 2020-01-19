import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Modal, Button, Grid } from 'semantic-ui-react'
import { AppState } from '../../store/'
import FastPlanner from '../../components/FastPlanner'
import ArmyCosts from '../../components/ArmyCosts'
import { UnitType, BaseUnit } from '../../store/units'
import { clearUnits, removeReserveUnits, addReserveUnits, doAddReserveUnits, doRemoveReserveUnits, invalidate, Side, BaseReserve } from '../../store/battle'
import { getBaseUnits, filterUnitTypesBySide, getParticipant, getUnitDefinitionsBySide, getUnitImages } from '../../store/utils'
import { mapRange, forEach, round, randomWithinRange, toArr } from '../../utils'
import { getNextId, mergeBaseUnitsWithDefinitions } from '../../army_utils'
import { CountryName } from '../../store/countries'
import { changeWeariness } from '../../store/settings'
import WearinessRange, { UnitCalcValues } from '../../components/WearinessRange'
import { ValuesType } from '../../base_definition'
import { addValues } from '../../definition_values'

type Units = { [key in UnitType]: number }

interface Props {
  open: boolean
  onClose: () => void
}

interface IState {
  changes_a: Units
  changes_d: Units
}

class ModalFastPlanner extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props)
    this.state = { changes_a: {} as Units, changes_d: {} as Units }
  }

  originals_a = {} as Units
  originals_d = {} as Units

  render() {
    const { open, types_a, types_d, definitions_a, definitions_d, images } = this.props
    let { base_units_a, base_units_d, weariness } = this.props
    const { changes_a, changes_d } = this.state
    if (!open)
      return null
    //// The logic is a bit tricky here.
    // Base units are needed because there might be unit specific changes.
    this.originals_a = types_a.reduce((map, value) => ({ ...map, [value]: this.countUnits(base_units_a.reserve, value) }), {} as Units)
    this.originals_d = types_d.reduce((map, value) => ({ ...map, [value]: this.countUnits(base_units_d.reserve, value) }), {} as Units)
    // Current changes to the reserve must also be applied.
    base_units_a = { ...base_units_a, reserve: this.editReserve(base_units_a.reserve, changes_a, this.originals_a) }
    base_units_d = { ...base_units_d, reserve: this.editReserve(base_units_d.reserve, changes_d, this.originals_d) }
    // And finally both merged with definitions to get real values.
    const units_a = mergeBaseUnitsWithDefinitions(base_units_a, definitions_a)
    const units_d = mergeBaseUnitsWithDefinitions(base_units_d, definitions_d)
    return (
      <Modal basic onClose={this.onClose} open centered={false}>
        <Modal.Content>
          <FastPlanner
            changes_a={changes_a}
            reserve_a={this.originals_a}
            images={images}
            types_a={new Set(types_a)}
            changes_d={changes_d}
            reserve_d={this.originals_d}
            types_d={new Set(types_d)}
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
          <WearinessRange
            values={weariness}
            onChange={this.props.changeWeariness}
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

  onValueChange = (side: Side, unit: UnitType, value: number) => {
    if (side === Side.Attacker)
      this.setState({ changes_a: { ...this.state.changes_a, [unit]: value } })
    if (side === Side.Defender)
      this.setState({ changes_d: { ...this.state.changes_d, [unit]: value } })
  }

  getUnitsToAdd = (changes: Units, originals?: Units, generateIds?: boolean): BaseReserve => {
    let units: BaseReserve = []
    forEach(changes, (value, key) => {
      const original = originals ? originals[key] || 0 : 0
      if (value > original)
        units = units.concat(mapRange(value - original, _ => ({ id: generateIds ? getNextId() : 0, type: key, image: '' })))
    })
    return units
  }

  applyLosses = (values: UnitCalcValues, units: BaseReserve) => (
    units.map(unit => addValues(unit, ValuesType.LossModifier, 'Unit', this.generateLosses(values)))
  )

  generateLosses = (values: UnitCalcValues): [string, number][] => toArr(values, (range, type ) => [type, round(randomWithinRange(range.min, range.max), 100)])

  getTypesToRemove = (changes: Units, originals?: Units): UnitType[] => {
    let types: UnitType[] = []
    forEach(changes, (value, key) => {
      const original = originals ? originals[key] || 0 : 0
      if (value < original)
        types = types.concat(mapRange(original - value, _ => key))
    })
    return types
  }

  updateReserve = (name: CountryName, changes: Units, originals: Units, limits: UnitCalcValues) => {
    const { mode, addReserveUnits, removeReserveUnits, invalidate } = this.props
    const units = this.applyLosses(limits, this.getUnitsToAdd(changes, originals, true))
    const types = this.getTypesToRemove(changes, originals)
    if (units.length > 0)
      addReserveUnits(mode, name, units)
    if (types.length > 0)
      removeReserveUnits(mode, name, types)
    if (units.length > 0 || types.length > 0)
      invalidate(mode)
  }

  onClose = (): void => {
    const { attacker, defender, weariness, onClose } = this.props
    this.updateReserve(attacker, this.state.changes_a, this.originals_a, weariness[Side.Attacker])
    this.updateReserve(defender, this.state.changes_d, this.originals_d, weariness[Side.Defender])
    this.setState({ changes_a: {} as Units, changes_d: {} as Units })
    onClose()
  }

  countUnits = (reserve: BaseUnit[], unit: UnitType): number => reserve.reduce((previous, current) => previous + (current && current.type === unit ? 1 : 0), 0)

  clearUnits = (): void => {
    const { mode, clearUnits, invalidate } = this.props
    this.setState({ changes_a: {} as Units, changes_d: {} as Units })
    clearUnits(mode)
    invalidate(mode)
  }
}

const mapStateToProps = (state: AppState) => ({
  attacker: getParticipant(state, Side.Attacker).country,
  defender: getParticipant(state, Side.Defender).country,
  base_units_a: getBaseUnits(state, Side.Attacker),
  base_units_d: getBaseUnits(state, Side.Defender),
  types_a: filterUnitTypesBySide(state, Side.Attacker),
  types_d: filterUnitTypesBySide(state, Side.Defender),
  definitions_a: getUnitDefinitionsBySide(state, Side.Attacker),
  definitions_d: getUnitDefinitionsBySide(state, Side.Defender),
  images: getUnitImages(state),
  mode: state.settings.mode,
  weariness: state.settings.weariness
})

const actions = { addReserveUnits, removeReserveUnits, clearUnits, invalidate, changeWeariness }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends Props, S, D { }
export default connect(mapStateToProps, actions)(ModalFastPlanner)
