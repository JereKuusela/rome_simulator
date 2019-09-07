
import { ImmerReducer, createActionCreators, createReducerFunction } from 'immer-reducer'
import { List } from 'immutable'
import {
  getDefaultArmy, getInitialTerrains, Army, Side, ArmyType, BaseUnits, Participant, getDefaultParticipant, RowType
} from './actions'
import { BaseUnit, UnitType } from '../units'
import { TerrainType } from '../terrains'
import { DefinitionType, Mode } from '../../base_definition'
import { CountryName } from '../countries'
import { TacticType } from '../tactics';
import { keys, toArr, map, every, forEach, arrGet } from '../../utils';

export interface Battle {
  readonly armies: Armies
  readonly terrains: TerrainType[],
  readonly participants: Participants,
  readonly round: number,
  readonly fight_over: boolean,
  readonly seed: number,
  readonly custom_seed?: number,
  readonly outdated: boolean
}

export type Armies = { [key in CountryName]: Army }
export type Participants = { [key in Side]: Participant }
export type ModeState = { [key in Mode]: Battle }


export const modeState = (mode: Mode): Battle => ({
  armies: { [CountryName.Country1]: getDefaultArmy(mode), [CountryName.Country2]: getDefaultArmy(mode) },
  participants: { [Side.Attacker]: getDefaultParticipant(CountryName.Country1), [Side.Defender]: getDefaultParticipant(CountryName.Country2) },
  terrains: getInitialTerrains(mode),
  round: -1,
  fight_over: true,
  seed: 0,
  custom_seed: undefined,
  outdated: true
})

export const initialState: ModeState = { [DefinitionType.Land]: modeState(DefinitionType.Land), [DefinitionType.Naval]: modeState(DefinitionType.Naval) }

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

const checkFightSub = (army?: BaseUnits) => army ? (checkArmy(army.frontline) || checkArmy(army.reserve)) : false

export const checkFight = (participants: Participants, armies: Armies) => every(participants, value => checkFightSub(arrGet(value.rounds, -1, armies[value.name])))

const checkArmy = (army: List<BaseUnit | undefined>) => army.find(value => value !== undefined) !== undefined

export const doRemoveReserveUnits = (reserve: List<BaseUnit>, types: UnitType[]) => {
  for (const type of types)
    reserve = reserve.delete(reserve.findLastIndex(value => value.type === type))
  return reserve
}

export const doAddReserveUnits = (reserve: List<BaseUnit>, units: BaseUnit[]) => reserve.merge(units)

class BattleReducer extends ImmerReducer<ModeState> {

  selectUnit(mode: Mode, country: CountryName, type: ArmyType, index: number, unit: BaseUnit | undefined) {
    const state = this.state[mode].armies[country]
    const draft = this.draftState[mode].armies[country]
    if (type === ArmyType.Frontline)
      draft.frontline = state.frontline.set(index, unit)
    else if (type === ArmyType.Reserve && unit && index > state.reserve.size)
      draft.reserve = state.reserve.push(unit)
    else if (type === ArmyType.Reserve && unit)
      draft.reserve = state.reserve.set(index, unit)
    else if (type === ArmyType.Reserve && !unit)
      draft.reserve = state.reserve.delete(index)
    else if (type === ArmyType.Defeated && unit)
      draft.defeated = state.defeated.set(index, unit)
    else if (type === ArmyType.Defeated && unit && index > state.defeated.size)
      draft.defeated = state.defeated.push(unit)
    else if (type === ArmyType.Defeated && !unit)
      draft.defeated = state.defeated.delete(index)
  }

  editUnit(mode: Mode, country: CountryName, unit: BaseUnit) {
    const state = this.state[mode].armies[country]
    const draft = this.draftState[mode].armies[country]
    const [type, index] = findUnit(state, unit.id)
    if (!type)
      return
    if (type === ArmyType.Frontline)
      draft.frontline = state.frontline.set(index, unit)
    if (type === ArmyType.Reserve)
      draft.reserve = state.reserve.set(index, unit)
    if (type === ArmyType.Defeated)
      draft.defeated = state.defeated.set(index, unit)
  }

  removeUnit(mode: Mode, country: CountryName, unit: BaseUnit) {
    const state = this.state[mode].armies[country]
    const draft = this.draftState[mode].armies[country]
    const [type, index] = findUnit(state, unit.id)
    if (!type)
      return
    if (type === ArmyType.Frontline)
      draft.frontline = state.frontline.set(index, undefined)
    if (type === ArmyType.Reserve)
      draft.reserve = state.reserve.delete(index)
    if (type === ArmyType.Defeated)
      draft.defeated = state.defeated.delete(index)
  }

  removeReserveUnits(mode: Mode, country: CountryName, types: UnitType[]) {
    const state = this.state[mode].armies[country]
    const draft = this.draftState[mode].armies[country]
    draft.reserve = doRemoveReserveUnits(state.reserve, types)
  }

  addReserveUnits(mode: Mode, country: CountryName, units: BaseUnit[]) {
    const state = this.state[mode].armies[country]
    const draft = this.draftState[mode].armies[country]
    draft.reserve = doAddReserveUnits(state.reserve, units)
  }

  selectTerrain(mode: Mode, index: number, terrain: TerrainType) {
    this.draftState[mode].terrains[index] = terrain
  }

  selectTactic(mode: Mode, country: CountryName, tactic: TacticType) {
    const draft = this.draftState[mode].armies[country]
    draft.tactic = tactic
  }

  setRowType(mode: Mode, country: CountryName, row_type: RowType, unit: UnitType | undefined) {
    const state = this.state[mode].armies[country]
    const draft = this.draftState[mode].armies[country]
    draft.row_types = state.row_types.set(row_type, unit)
  }

  invalidate(mode: Mode) {
    this.draftState[mode].outdated = true
  }

  invalidateCountry(country: CountryName) {
    keys(this.state).forEach(key => {
      if (toArr(this.state[key].participants).find(value => value.name === country))
        this.invalidate(key)
    })
  }

  undo(mode: Mode, steps: number) {
    let next = this.state[mode]
    for (let step = 0; step < steps && next.round > -1; ++step) {
      let seed: number = next.seed
      if (next.round < 2)
        seed = next.custom_seed ? next.custom_seed : 0
      const participants = map(next.participants, value => ({
        ...value,
        rounds: value.rounds.splice(-1, 1),
        roll: arrGet(value.rolls, -2, { roll: value.roll }).roll,
        rolls: value.rolls.splice(-1, 1)
      }))
      next = {
        ...next,
        participants,
        round: next.round - 1,
        fight_over: !checkFight(participants, next.armies),
        seed
      }
    }
    this.draftState[mode] = next
  }

  toggleRandomRoll(mode: Mode, side: Side) {
    const state = this.state[mode].participants[side]
    const draft = this.draftState[mode].participants[side]
    draft.randomize_roll = state.randomize_roll
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
    draft.name = name
  }

  clearUnits(mode: Mode) {
    let next = this.draftState[mode]
    let armies = next.armies
    let participants = next.participants
    forEach(participants, value => {
      armies[value.name].frontline = getDefaultArmy(mode).frontline
      armies[value.name].reserve = armies[value.name].reserve.clear()
      armies[value.name].defeated = armies[value.name].defeated.clear()
    })
    participants = map(participants, value => ({ ...value, rounds: [], rolls: [] }))
    next = {
      ...next,
      armies,
      participants,
      round: -1,
      fight_over: true
    }
    this.draftState[mode] = next
  }
}


const actions = createActionCreators(BattleReducer)

export const selectUnit = actions.selectUnit
export const editUnit = actions.editUnit
export const removeUnit = actions.removeUnit
export const removeReserveUnits = actions.removeReserveUnits
export const addReserveUnits = actions.addReserveUnits
export const selectTerrain = actions.selectTerrain
export const selectTactic = actions.selectTactic
export const setRowType = actions.setRowType
export const invalidate = actions.invalidate
export const invalidateCountry = actions.invalidateCountry
export const undo = actions.undo
export const toggleRandomRoll = actions.toggleRandomRoll
export const setRoll = actions.setRoll
export const setFlankSize = actions.setFlankSize
export const selectArmy = actions.selectArmy
export const clearUnits = actions.clearUnits


export const battleReducer = createReducerFunction(BattleReducer, initialState)
