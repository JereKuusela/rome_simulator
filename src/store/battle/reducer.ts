import { createReducer } from 'typesafe-actions'
import { List, Map } from 'immutable'
import {
  getDefaultArmy, getInitialTerrains, Army, ParticipantType,
  clearUnits, selectUnit, selectTerrain, selectTactic, undo, toggleRandomRoll, setRoll, setRowType, removeReserveUnits, addReserveUnits, setFlankSize,
  selectArmy, ArmyType, Units, invalidate, invalidateCountry, Participant, getDefaultParticipant
} from './actions'
import { Unit, UnitType  } from '../units'
import { TerrainType } from '../terrains'
import { DefinitionType } from '../../base_definition'
import { CountryName } from '../countries/actions'

export interface Battle {
  readonly armies: Map<CountryName, Army>
  readonly terrains: List<TerrainType>,
  readonly participants: Map<ParticipantType, Participant>,
  readonly round: number,
  readonly fight_over: boolean,
  readonly seed: number,
  readonly custom_seed?: number,
  readonly outdated: boolean
}

export const modeState = (mode: DefinitionType): Battle => ({
  armies: Map<CountryName, Army>().set(CountryName.Country1, getDefaultArmy(mode)).set(CountryName.Country2, getDefaultArmy(mode)),
  participants: Map<ParticipantType, Participant>().set(ParticipantType.Attacker, getDefaultParticipant(CountryName.Country1)).set(ParticipantType.Defender, getDefaultParticipant(CountryName.Country2)),
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


const checkFightSub = (army?: Units) => army ? (checkArmy(army.frontline) || checkArmy(army.reserve)) : false

export const checkFight = (participants: Map<ParticipantType, Participant>, armies: Map<CountryName, Army>) => participants.every(value => checkFightSub(value.rounds.get(-1, armies.get(value.name))))

const checkArmy = (army: List<Unit | undefined>) => army.find(value => value !== undefined) !== undefined

export const doRemoveReserveUnits = (reserve: List<Unit>, types: UnitType[]) => {
  for (const type of types)
    reserve = reserve.delete(reserve.findLastIndex(value => value.type === type))
  return reserve
}

export const doAddReserveUnits = (reserve: List<Unit>, units: Unit[]) => reserve.merge(units)

const update = (state: Map<DefinitionType, Battle>, payload: { mode: DefinitionType, country: CountryName }, updater: (participant: Army) => Army): Map<DefinitionType, Battle> => {
  if (!state.has(payload.mode))
    state = state.set(payload.mode, modeState(payload.mode))
  return state.update(payload.mode, mode => {
    return { ...mode, armies: mode.armies.update(payload.country, getDefaultArmy(payload.mode), updater) }
  })
}

const updateParticipant = (state: Map<DefinitionType, Battle>, payload: { mode: DefinitionType, participant: ParticipantType }, updater: (participant: Participant) => Participant): Map<DefinitionType, Battle> => {
  if (!state.has(payload.mode))
    state = state.set(payload.mode, modeState(payload.mode))
  return state.update(payload.mode, mode => {
    return { ...mode, participants: mode.participants.update(payload.participant, getDefaultParticipant(CountryName.Country1), updater) }
  })
}

const fightOver = (state: Map<DefinitionType, Battle>, payload: { mode: DefinitionType }): Map<DefinitionType, Battle> => {
  if (!state.has(payload.mode))
    state = state.set(payload.mode, modeState(payload.mode))
  return state.update(payload.mode, mode => {
    return { ...mode, fight_over: !checkFight(mode.participants, mode.armies) }
  })
}

export const battleReducer = createReducer(initialState)
  .handleAction(toggleRandomRoll, (state, action: ReturnType<typeof toggleRandomRoll>) =>
    updateParticipant(state, action.payload,  value => ({ ...value, randomize_roll: !value.randomize_roll }))
  )
  .handleAction(setFlankSize, (state, action: ReturnType<typeof setFlankSize>) => 
    update(state, action.payload, (value: Army) => ({ ...value, flank_size: action.payload.size }))
  )
  .handleAction(setRoll, (state, action: ReturnType<typeof setRoll>) => 
    updateParticipant(state, action.payload, value => ({ ...value, roll: action.payload.roll }))
  )
  .handleAction(selectUnit, (state, action: ReturnType<typeof selectUnit>) => {
    const handleArmy = (participant: Army): Army => {
      if (action.payload.type === ArmyType.Frontline)
        return { ...participant, frontline: participant.frontline.set(action.payload.index, action.payload.unit) }
      if (action.payload.type === ArmyType.Reserve && action.payload.unit && action.payload.index > participant.reserve.size)
        return { ...participant, reserve: participant.reserve.push(action.payload.unit) }
      if (action.payload.type === ArmyType.Reserve && action.payload.unit)
        return { ...participant, reserve: participant.reserve.set(action.payload.index, action.payload.unit) }
      if (action.payload.type === ArmyType.Reserve && !action.payload.unit)
        return { ...participant, reserve: participant.reserve.delete(action.payload.index) }
      if (action.payload.type === ArmyType.Defeated && action.payload.unit)
        return { ...participant, defeated: participant.defeated.set(action.payload.index, action.payload.unit) }
      if (action.payload.type === ArmyType.Defeated && action.payload.unit && action.payload.index > participant.defeated.size)
        return { ...participant, defeated: participant.defeated.push(action.payload.unit) }
      if (action.payload.type === ArmyType.Defeated && !action.payload.unit)
        return { ...participant, defeated: participant.defeated.delete(action.payload.index) }
      return participant
    }
    return fightOver(update(state, action.payload, handleArmy), action.payload)
  })
  .handleAction(selectTerrain, (state, action: ReturnType<typeof selectTerrain>) => 
    state.update(action.payload.mode, mode => {
      return { ...mode, terrains: mode.terrains.set(action.payload.index, action.payload.terrain) }
    })
  )
  .handleAction(setRowType, (state, action: ReturnType<typeof setRowType>) => 
    update(state, action.payload, (value: Army) => ({ ...value, row_types: value.row_types.set(action.payload.row_type, action.payload.unit) }))
  )
  .handleAction(selectTactic, (state, action: ReturnType<typeof selectTactic>) => 
    update(state, action.payload, (value: Army) => ({ ...value, tactic: action.payload.tactic }))
  )
  .handleAction(undo, (state, action: ReturnType<typeof undo>) => {
    let next = state.get(action.payload.mode)
    if (!next)
      return state
    for (let step = 0; step < action.payload.steps && next.round > -1; ++step) {
      let seed: number = next.seed
      if (next.round < 2)
        seed = next.custom_seed ? next.custom_seed : 0
      const participants: Map<ParticipantType, Participant> = next.participants.map(value => ({
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
    return state.set(action.payload.mode, next)
  })
  .handleAction(removeReserveUnits, (state, action: ReturnType<typeof removeReserveUnits>) => 
    update(state, action.payload, (value: Army) => ({ ...value, reserve: doRemoveReserveUnits(value.reserve, action.payload.types) }))
  )
  .handleAction(addReserveUnits, (state, action: ReturnType<typeof addReserveUnits>) => 
    update(state, action.payload, (value: Army) => ({ ...value, reserve: doAddReserveUnits(value.reserve, action.payload.units) }))
  )
  .handleAction(selectArmy, (state, action: ReturnType<typeof selectArmy>) =>
    updateParticipant(state, action.payload, value => ({ ...value, name: action.payload.country }))
  )
  .handleAction(clearUnits, (state, action: ReturnType<typeof clearUnits>) => {
    let next = state.get(action.payload.mode)
    if (!next)
      return state
    let armies = next.armies
    let participants = next.participants
    participants.forEach(value => {
      armies = armies.update(value.name, getDefaultArmy(action.payload.mode), value => ({ ...value, frontline: getDefaultArmy(action.payload.mode).frontline, reserve: value.reserve.clear(), defeated: value.defeated.clear() }))
    })
    participants = participants.map(value => ({ ...value, rounds: value.rounds.clear(), rolls: value.rolls.clear() }))
    next = {
      ...next,
      armies,
      participants,
      round: -1,
      fight_over: true
    }
    return state.set(action.payload.mode, next)
  })
  .handleAction(invalidate, (state, action: ReturnType<typeof invalidate>) => 
    state.update(action.payload.mode, value => ({ ...value, outdated: true}))
  )
  .handleAction(invalidateCountry, (state, action: ReturnType<typeof invalidateCountry>) => 
    state.map(value => ({ ...value, outdated: value.outdated || value.participants.some(value => value.name === action.payload.country) }))
  )
