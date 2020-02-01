
import { ImmerReducer, createActionCreators, createReducerFunction, Actions } from 'immer-reducer'
import { findLastIndex, forEach} from 'lodash'
import { Mode, DefinitionType, ValuesType, TerrainType, CountryName, Army, Side, ArmyType, BaseUnit, UnitType, UnitValueType, TacticType, UnitPreferenceType, ModeState } from 'types'
import { addValues } from 'definition_values'
import { toArr, arrGet, keys } from 'utils'
import { createCountry, deleteCountry, changeCountryName } from './countries'
import { getDefaultBattle, getDefaultArmy } from 'data'

const findUnit = (participant: Army, id: number): [ArmyType | undefined, number] => {
  let index = participant.reserve.findIndex(unit => unit.id === id)
  if (index > -1)
    return [ArmyType.Reserve, index]
  index = participant.frontline.findIndex(unit => unit ? unit.id === id : false)
  if (index > -1)
    return [ArmyType.Frontline, index]
  index = participant.defeated.findIndex(unit => unit.id === id)
  if (index > -1)
    return [ArmyType.Defeated, index]
  return [undefined, -1]
}

const update = (army: Army, id: number, updater: (unit: BaseUnit) => BaseUnit): void => {
  let index = army.reserve.findIndex(unit => unit.id === id)
  if (index > -1) {
    army.reserve[index] = updater(army.reserve[index])
    return
  }
  index = army.frontline.findIndex(unit => unit ? unit.id === id : false)
  if (index > -1) {
    army.frontline[index] = updater(army.frontline[index]!)
    return
  }
  index = army.defeated.findIndex(unit => unit.id === id)
  if (index > -1) {
    army.defeated[index] = updater(army.defeated[index])
    return
  }
}

export const doRemoveReserveUnits = (reserve: BaseUnit[], types: UnitType[]) => {
  for (const type of types) {
    const index = findLastIndex(reserve, value => value.type === type)
    reserve = reserve.filter((_, i) => i !== index)
  }
  return reserve
}

export const doAddReserveUnits = (reserve: BaseUnit[], units: BaseUnit[]) => reserve.concat(units)

class BattleReducer extends ImmerReducer<ModeState> {

  selectUnit(mode: Mode, country: CountryName, type: ArmyType, index: number, unit: BaseUnit | null) {
    const state = this.state[mode].armies[country]
    const draft = this.draftState[mode].armies[country]
    if (type === ArmyType.Frontline)
      draft.frontline[index] = unit
    else if (type === ArmyType.Reserve && unit && index > state.reserve.length)
      draft.reserve.push(unit)
    else if (type === ArmyType.Reserve && unit)
      draft.reserve[index] = unit
    else if (type === ArmyType.Reserve && !unit)
      draft.reserve.splice(index, 1)
    else if (type === ArmyType.Defeated && unit)
      draft.defeated[index] = unit
    else if (type === ArmyType.Defeated && unit && index > state.defeated.length)
      draft.defeated.push(unit)
    else if (type === ArmyType.Defeated && !unit)
      draft.defeated.splice(index, 1)
  }

  setValue(mode: Mode, country: CountryName, id: number, values_type: ValuesType, key: string, attribute: UnitValueType, value: number) {
    const draft = this.draftState[mode].armies[country]
    update(draft, id, unit => addValues(unit, values_type, key, [[attribute, value]]))
  }

  changeType(mode: Mode, country: CountryName, id: number, type: UnitType) {
    const draft = this.draftState[mode].armies[country]
    update(draft, id, unit => ({ ...unit, type}))
  }

  toggleLoyal(mode: Mode, country: CountryName, id: number) {
    const draft = this.draftState[mode].armies[country]
    update(draft, id, unit => ({ ...unit, is_loyal: !unit.is_loyal}))
  }

  editUnit(mode: Mode, country: CountryName, unit: BaseUnit) {
    const state = this.state[mode].armies[country]
    const draft = this.draftState[mode].armies[country]
    const [type, index] = findUnit(state, unit.id)
    if (!type)
      return
    if (type === ArmyType.Frontline)
      draft.frontline[index] = unit
    if (type === ArmyType.Reserve)
      draft.reserve[index] = unit
    if (type === ArmyType.Defeated)
      draft.defeated[index] = unit
  }

  deleteUnit(mode: Mode, country: CountryName, id: number) {
    const state = this.state[mode].armies[country]
    const draft = this.draftState[mode].armies[country]
    const [type, index] = findUnit(state, id)
    if (!type)
      return
    if (type === ArmyType.Frontline)
      draft.frontline[index] = null
    if (type === ArmyType.Reserve)
      draft.reserve.splice(index, 1)
    if (type === ArmyType.Defeated)
      draft.defeated.splice(index, 1)
  }

  removeReserveUnits(mode: Mode, country: CountryName, types: UnitType[]) {
    const state = this.state[mode].armies[country]
    const draft = this.draftState[mode].armies[country]
    draft.reserve = doRemoveReserveUnits(state.reserve, types)
  }

  addReserveUnits(mode: Mode, country: CountryName, units: BaseUnit[]) {
    const draft = this.draftState[mode].armies[country]
    draft.reserve = doAddReserveUnits(draft.reserve, units)
  }

  selectTerrain(mode: Mode, index: number, terrain: TerrainType) {
    this.draftState[mode].terrains[index] = terrain
  }

  selectTactic(mode: Mode, country: CountryName, tactic: TacticType) {
    const draft = this.draftState[mode].armies[country]
    draft.tactic = tactic
  }

  setUnitPreference(mode: Mode, country: CountryName, preference_type: UnitPreferenceType, unit: UnitType | null) {
    const draft = this.draftState[mode].armies[country]
    draft.unit_preferences[preference_type] = unit
  }

  invalidate(mode: Mode) {
    this.draftState[mode].outdated = true
  }

  invalidateCountry(country: CountryName) {
    keys(this.state).forEach(key => {
      if (toArr(this.state[key].participants).find(value => value.country === country))
        this.invalidate(key)
    })
  }

  undo(mode: Mode, steps: number) {
    const draft = this.draftState[mode]
    for (let step = 0; step < steps && draft.round > -1; ++step) {
      let seed: number = draft.seed
      if (draft.round < 2)
        seed = draft.custom_seed ? draft.custom_seed : 0
      forEach(draft.participants, value => {
        value.rounds.pop()
        value.roll = arrGet(value.rolls, -2, { roll: value.roll }).roll
        value.rolls.pop()
      })
      draft.round--
      draft.seed = seed
      draft.fight_over = false
    }
  }

  toggleRandomRoll(mode: Mode, side: Side) {
    const state = this.state[mode].participants[side]
    const draft = this.draftState[mode].participants[side]
    draft.randomize_roll = !state.randomize_roll
  }

  setRoll(mode: Mode, side: Side, roll: number) {
    const draft = this.draftState[mode].participants[side]
    draft.roll = roll
  }

  setFlankSize(mode: Mode, country: CountryName, flank_size: number) {
    const draft = this.draftState[mode].armies[country]
    draft.flank_size = flank_size
  }

  selectArmy(mode: Mode, side: Side, name: CountryName) {
    const draft = this.draftState[mode].participants[side]
    draft.country = name
  }

  clearUnits(mode: Mode) {
    let next = this.draftState[mode]
    let armies = next.armies
    let participants = next.participants
    forEach(participants, value => {
      armies[value.country].frontline = getDefaultArmy(mode).frontline
      armies[value.country].reserve = []
      armies[value.country].defeated = []
    })
    this.draftState[mode] = next
  }

  createCountry(country: CountryName, source_country?: CountryName) {
    this.draftState[DefinitionType.Land].armies[country] = source_country ? this.state[DefinitionType.Land].armies[source_country] : getDefaultArmy(DefinitionType.Land)
    this.draftState[DefinitionType.Naval].armies[country] = source_country ? this.state[DefinitionType.Naval].armies[source_country] : getDefaultArmy(DefinitionType.Naval)
  }

  deleteCountry(country: CountryName) {
    delete this.draftState[DefinitionType.Land].armies[country]
    delete this.draftState[DefinitionType.Naval].armies[country]
  }

  changeCountryName(old_country: CountryName, country: CountryName) {
    delete Object.assign(this.draftState[DefinitionType.Land].armies, { [country]: this.draftState[DefinitionType.Land].armies[old_country] })[old_country]
    delete Object.assign(this.draftState[DefinitionType.Naval].armies, { [country]: this.draftState[DefinitionType.Naval].armies[old_country] })[old_country]
  }
}


const actions = createActionCreators(BattleReducer)

export const selectCohort = actions.selectUnit
export const editCohort = actions.editUnit
export const setCohortValue = actions.setValue
export const changeCohortType = actions.changeType
export const deleteCohort = actions.deleteUnit
export const toggleCohortLoyal = actions.toggleLoyal
export const removeReserveUnits = actions.removeReserveUnits
export const addReserveUnits = actions.addReserveUnits
export const selectTerrain = actions.selectTerrain
export const selectTactic = actions.selectTactic
export const setUnitPreference = actions.setUnitPreference
export const invalidate = actions.invalidate
export const invalidateCountry = actions.invalidateCountry
export const undo = actions.undo
export const toggleRandomRoll = actions.toggleRandomRoll
export const setRoll = actions.setRoll
export const setFlankSize = actions.setFlankSize
export const selectArmy = actions.selectArmy
export const clearUnits = actions.clearUnits


const battleBaseReducer = createReducerFunction(BattleReducer, getDefaultBattle())

export const battleReducer = (state = getDefaultBattle(), action: Actions<typeof BattleReducer>) => {
  if (action.type === createCountry.type)
    return battleBaseReducer(state, { payload: action.payload, type: actions.createCountry.type, args: true } as any)
  if (action.type === deleteCountry.type)
    return battleBaseReducer(state, { payload: action.payload, type: actions.deleteCountry.type })
  if (action.type === changeCountryName.type)
    return battleBaseReducer(state, { payload: action.payload, type: actions.changeCountryName.type, args: true } as any)
  return battleBaseReducer(state, action)
}