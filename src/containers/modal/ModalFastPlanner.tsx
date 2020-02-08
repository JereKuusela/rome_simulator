import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Modal, Button, Grid } from 'semantic-ui-react'
import { AppState, getParticipant, getBaseCohorts, filterUnitTypesBySide, getUnitDefinitionsBySide, getUnitImages } from 'state'
import FastPlanner from 'components/FastPlanner'
import ArmyCosts from 'components/ArmyCosts'
import { ValuesType, UnitType, BaseReserve, Side, CountryName, BaseCohort, WearinessAttributes } from 'types'
import { mergeBaseUnitsWithDefinitions, getNextId } from 'army_utils'
import WearinessRange from 'components/WearinessRange'
import { changeWeariness, addToReserve, removeFromReserve, clearCohorts, invalidate } from 'reducers'
import { removeFromReserve as removeReserve, addToReserve as addReserve } from 'managers/army_manager'
import { forEach, mapRange, toArr, round, randomWithinRange } from 'utils'
import { addValues } from 'definition_values'

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
    const army = { reserve }
    addReserve(army, units)
    removeReserve(army, types)
    return army.reserve
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

  applyLosses = (values: WearinessAttributes, units: BaseReserve) => (
    units.map(unit => addValues(unit, ValuesType.LossModifier, 'Unit', this.generateLosses(values)))
  )

  generateLosses = (values: WearinessAttributes): [string, number][] => toArr(values, (range, type) => [type, round(randomWithinRange(range.min, range.max), 100)])

  getTypesToRemove = (changes: Units, originals?: Units): UnitType[] => {
    let types: UnitType[] = []
    forEach(changes, (value, key) => {
      const original = originals ? originals[key] || 0 : 0
      if (value < original)
        types = types.concat(mapRange(original - value, _ => key))
    })
    return types
  }

  updateReserve = (country: CountryName, changes: Units, originals: Units, limits: WearinessAttributes) => {
    const { mode, addToReserve, removeFromReserve, invalidate } = this.props
    const units = this.applyLosses(limits, this.getUnitsToAdd(changes, originals, true))
    const types = this.getTypesToRemove(changes, originals)
    if (units.length > 0)
      addToReserve(country, units)
    if (types.length > 0)
      removeFromReserve(country, types)
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

  countUnits = (reserve: BaseCohort[], unit: UnitType): number => reserve.reduce((previous, current) => previous + (current && current.type === unit ? 1 : 0), 0)

  clearUnits = (): void => {
    const { mode, attacker, defender, clearCohorts, invalidate } = this.props
    this.setState({ changes_a: {} as Units, changes_d: {} as Units })
    clearCohorts(attacker)
    clearCohorts(defender)
    invalidate(mode)
  }
}

const mapStateToProps = (state: AppState) => ({
  attacker: getParticipant(state, Side.Attacker).country,
  defender: getParticipant(state, Side.Defender).country,
  base_units_a: getBaseCohorts(state, Side.Attacker),
  base_units_d: getBaseCohorts(state, Side.Defender),
  types_a: filterUnitTypesBySide(state, Side.Attacker),
  types_d: filterUnitTypesBySide(state, Side.Defender),
  definitions_a: getUnitDefinitionsBySide(state, Side.Attacker),
  definitions_d: getUnitDefinitionsBySide(state, Side.Defender),
  images: getUnitImages(state),
  mode: state.settings.mode,
  weariness: state.settings.weariness
})

const actions = { addToReserve, removeFromReserve, clearCohorts, invalidate, changeWeariness }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends Props, S, D { }
export default connect(mapStateToProps, actions)(ModalFastPlanner)
