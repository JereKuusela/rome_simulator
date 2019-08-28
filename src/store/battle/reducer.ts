
import { ImmerReducer, createActionCreators, createReducerFunction } from 'immer-reducer'
import { List, Map } from 'immutable'
import {
  getDefaultArmy, getInitialTerrains, Army, Side, ArmyType, BaseUnits, Participant, getDefaultParticipant, RowType
} from './actions'
import { BaseUnit, UnitType } from '../units'
import { TerrainType } from '../terrains'
import { DefinitionType } from '../../base_definition'
import { CountryName } from '../countries'
import { TacticType } from '../tactics';

export interface Battle {
  readonly armies: Map<CountryName, Army>
  readonly terrains: List<TerrainType>,
  readonly participants: Map<Side, Participant>,
  readonly round: number,
  readonly fight_over: boolean,
  readonly seed: number,
  readonly custom_seed?: number,
  readonly outdated: boolean
}

export const modeState = (mode: DefinitionType): Battle => ({
  armies: Map<CountryName, Army>().set(CountryName.Country1, getDefaultArmy(mode)).set(CountryName.Country2, getDefaultArmy(mode)),
  participants: Map<Side, Participant>().set(Side.Attacker, getDefaultParticipant(CountryName.Country1)).set(Side.Defender, getDefaultParticipant(CountryName.Country2)),
  terrains: getInitialTerrains(mode),
  round: -1,
  fight_over: true,
  seed: 0,
  custom_seed: undefined,
  outdated: true
})

export const initialState = Map<DefinitionType, Battle>()
  .set(DefinitionType.Land, modeState(DefinitionType.Land))
  .set(DefinitionType.Naval, modeState(DefinitionType.Naval))

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

export const checkFight = (participants: Map<Side, Participant>, armies: Map<CountryName, Army>) => participants.every(value => checkFightSub(value.rounds.get(-1, armies.get(value.name))))

const checkArmy = (army: List<BaseUnit | undefined>) => army.find(value => value !== undefined) !== undefined

export const doRemoveReserveUnits = (reserve: List<BaseUnit>, types: UnitType[]) => {
  for (const type of types)
    reserve = reserve.delete(reserve.findLastIndex(value => value.type === type))
  return reserve
}

export const doAddReserveUnits = (reserve: List<BaseUnit>, units: BaseUnit[]) => reserve.merge(units)

const update = (state: Map<DefinitionType, Battle>, payload: { mode: DefinitionType, country: CountryName }, updater: (participant: Army) => Army): Map<DefinitionType, Battle> => {
  if (!state.has(payload.mode))
    state = state.set(payload.mode, modeState(payload.mode))
  return state.update(payload.mode, mode => {
    return { ...mode, armies: mode.armies.update(payload.country, getDefaultArmy(payload.mode), updater) }
  })
}

const updateParticipant = (state: Map<DefinitionType, Battle>, payload: { mode: DefinitionType, participant: Side }, updater: (participant: Participant) => Participant): Map<DefinitionType, Battle> => {
  if (!state.has(payload.mode))
    state = state.set(payload.mode, modeState(payload.mode))
  return state.update(payload.mode, mode => {
    return { ...mode, participants: mode.participants.update(payload.participant, getDefaultParticipant(CountryName.Country1), updater) }
  })
}

  class BattleReducer extends ImmerReducer<typeof initialState> {

    selectUnit(mode: DefinitionType, country: CountryName, type: ArmyType, index: number, unit: BaseUnit | undefined) {
      const handleArmy = (participant: Army): Army => {
        if (type === ArmyType.Frontline)
          return { ...participant, frontline: participant.frontline.set(index, unit) }
        if (type === ArmyType.Reserve && unit && index > participant.reserve.size)
          return { ...participant, reserve: participant.reserve.push(unit) }
        if (type === ArmyType.Reserve && unit)
          return { ...participant, reserve: participant.reserve.set(index, unit) }
        if (type === ArmyType.Reserve && !unit)
          return { ...participant, reserve: participant.reserve.delete(index) }
        if (type === ArmyType.Defeated && unit)
          return { ...participant, defeated: participant.defeated.set(index, unit) }
        if (type === ArmyType.Defeated && unit && index > participant.defeated.size)
          return { ...participant, defeated: participant.defeated.push(unit) }
        if (type === ArmyType.Defeated && !unit)
          return { ...participant, defeated: participant.defeated.delete(index) }
        return participant
      }
      this.draftState = update(this.state, { mode, country }, handleArmy)
    }

    editUnit(mode: DefinitionType, country: CountryName, unit: BaseUnit) {
      const handleArmy = (participant: Army): Army => {
        const [type, index] = findUnit(participant, unit.id)
        if (!type)
          return participant
        if (type === ArmyType.Frontline)
          return { ...participant, frontline: participant.frontline.set(index, unit) }
        if (type === ArmyType.Reserve)
          return { ...participant, reserve: participant.reserve.set(index, unit) }
        if (type === ArmyType.Defeated)
          return { ...participant, defeated: participant.defeated.set(index, unit) }
        return participant
      }
      this.draftState = update(this.state, { mode, country }, handleArmy)
    }

    removeUnit(mode: DefinitionType, country: CountryName, unit: BaseUnit) {
      const handleArmy = (participant: Army): Army => {
        const [type, index] = findUnit(participant, unit.id)
        if (!type)
          return participant
        if (type === ArmyType.Frontline)
          return { ...participant, frontline: participant.frontline.set(index, undefined) }
        if (type === ArmyType.Reserve)
          return { ...participant, reserve: participant.reserve.delete(index) }
        if (type === ArmyType.Defeated)
          return { ...participant, defeated: participant.defeated.delete(index) }
        return participant
      }
      this.draftState = update(this.state, { mode, country }, handleArmy)
    }

    removeReserveUnits(mode: DefinitionType, country: CountryName, types: UnitType[]) {
      this.draftState = update(this.state, { mode, country }, (value: Army) => ({ ...value, reserve: doRemoveReserveUnits(value.reserve, types) }))
    }
    
    addReserveUnits(mode: DefinitionType, country: CountryName, units: BaseUnit[]) {
      this.draftState = update(this.state, { mode, country }, (value: Army) => ({ ...value, reserve: doAddReserveUnits(value.reserve, units) }))
    }

    selectTerrain(mode: DefinitionType, index: number, terrain: TerrainType) {
      this.draftState = this.state.update(mode, mode => {
        return { ...mode, terrains: mode.terrains.set(index, terrain) }
      })
    }

    selectTactic(mode: DefinitionType, country: CountryName, tactic: TacticType) {
      this.draftState = update(this.state, { mode, country }, (value: Army) => ({ ...value, tactic }))
    }

    setRowType(mode: DefinitionType, country: CountryName, row_type: RowType, unit: UnitType | undefined) {
      this.draftState = update(this.state, { mode, country }, (value: Army) => ({ ...value, row_types: value.row_types.set(row_type, unit) }))
    }

    invalidate(mode: DefinitionType) {
      this.draftState = this.state.update(mode, value => ({ ...value, outdated: true }))
    }

    invalidateCountry(country: CountryName) {
      this.draftState = this.state.map(value => ({ ...value, outdated: value.outdated || value.participants.some(value => value.name === country) }))
    }

    undo(mode: DefinitionType, steps: number) {
      let next = this.state.get(mode)
      if (!next)
        return
      for (let step = 0; step < steps && next.round > -1; ++step) {
        let seed: number = next.seed
        if (next.round < 2)
          seed = next.custom_seed ? next.custom_seed : 0
        const participants: Map<Side, Participant> = next.participants.map(value => ({
          ...value,
          rounds: value.rounds.pop(),
          roll: value.rolls.get(-2, { roll: value.roll }).roll,
          rolls: value.rolls.pop()
        }))
        next = {
          ...next,
          participants,
          round: next.round - 1,
          fight_over: !checkFight(participants, next.armies),
          seed
        }
      }
      this.draftState = this.state.set(mode, next)
    }

    toggleRandomRoll(mode: DefinitionType, participant: Side) {
      this.draftState = updateParticipant(this.state, { mode, participant }, value => ({ ...value, randomize_roll: !value.randomize_roll }))
    }

    setRoll(mode: DefinitionType, participant: Side, roll: number) {
      this.draftState = updateParticipant(this.state, { mode, participant }, value => ({ ...value, roll }))
    }
    
    setFlankSize(mode: DefinitionType, country: CountryName, flank_size: number) {
      this.draftState = update(this.state, { mode, country }, (value: Army) => ({ ...value, flank_size }))
    }

    selectArmy(mode: DefinitionType, participant: Side, name: CountryName) {
      this.draftState = updateParticipant(this.state, { mode, participant }, value => ({ ...value, name }))
    }

    clearUnits(mode: DefinitionType) {
      let next = this.state.get(mode)
      if (!next)
        return
      let armies = next.armies
      let participants = next.participants
      participants.forEach(value => {
        armies = armies.update(value.name, getDefaultArmy(mode), value => ({ ...value, frontline: getDefaultArmy(mode).frontline, reserve: value.reserve.clear(), defeated: value.defeated.clear() }))
      })
      participants = participants.map(value => ({ ...value, rounds: value.rounds.clear(), rolls: value.rolls.clear() }))
      next = {
        ...next,
        armies,
        participants,
        round: -1,
        fight_over: true
      }
      this.draftState = this.state.set(mode, next)
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
