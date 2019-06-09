import { createReducer } from 'typesafe-actions'
import { List } from 'immutable'
import { getInitialArmy, getInitialTerrains, Participant, PastState, ParticipantType } from './types'
import { selectUnit, selectTerrain, selectTactic, undo, toggleRandomRoll, setRoll, setGeneral, setRowType, removeReserveUnits, addReserveUnits, setFlankSize, setArmyName } from './actions'
import { Unit, UnitType, ArmyType } from '../units'

export const initialState = {
  attacker: getInitialArmy(true),
  defender: getInitialArmy(false),
  terrains: getInitialTerrains(),
  attacker_past: List<PastState>(),
  defender_past: List<PastState>(),
  day: -1,
  fight_over: true
}

export const checkFight = (attacker: Participant, defender: Participant) => (checkArmy(attacker.army) || checkArmy(attacker.reserve)) && (checkArmy(defender.army) || checkArmy(defender.reserve))

const checkArmy = (army: List<Unit | undefined>) => {
  for (let unit of army) {
    if (unit)
      return true
  }
  return false
}

export const doRemoveReserveUnits = (reserve: List<Unit>, types: UnitType[]) => {
  for (const type of types)
    reserve = reserve.delete(reserve.findLastIndex(value => value.type === type))
  return reserve
}

export const doAddReserveUnits = (reserve: List<Unit>, units: Unit[]) => reserve.merge(units)

export const landBattleReducer = createReducer(initialState)
  .handleAction(toggleRandomRoll, (state, action: ReturnType<typeof toggleRandomRoll>) => (
    {
      ...state,
      attacker: { ...state.attacker, randomize_roll: action.payload.participant === ParticipantType.Attacker ? !state.attacker.randomize_roll : state.attacker.randomize_roll },
      defender: { ...state.defender, randomize_roll: action.payload.participant === ParticipantType.Defender ? !state.defender.randomize_roll : state.defender.randomize_roll }
    }
  ))
  .handleAction(setGeneral, (state, action: ReturnType<typeof setGeneral>) => (
    {
      ...state,
      attacker: { ...state.attacker, general: action.payload.participant === ParticipantType.Attacker ? action.payload.skill : state.attacker.general },
      defender: { ...state.defender, general: action.payload.participant === ParticipantType.Defender ? action.payload.skill : state.defender.general }
    }
  ))
  .handleAction(setFlankSize, (state, action: ReturnType<typeof setFlankSize>) => (
    {
      ...state,
      attacker: { ...state.attacker, flank_size: action.payload.participant === ParticipantType.Attacker ? action.payload.size : state.attacker.flank_size },
      defender: { ...state.defender, flank_size: action.payload.participant === ParticipantType.Defender ? action.payload.size : state.defender.flank_size }
    }
  ))
  .handleAction(setRoll, (state, action: ReturnType<typeof setRoll>) => (
    {
      ...state,
      attacker: { ...state.attacker, roll: action.payload.participant === ParticipantType.Attacker ? action.payload.roll : state.attacker.roll },
      defender: { ...state.defender, roll: action.payload.participant === ParticipantType.Defender ? action.payload.roll : state.defender.roll }
    }
  ))
  .handleAction(selectUnit, (state, action: ReturnType<typeof selectUnit>) => {
    let new_attacker = state.attacker
    let new_defender = state.defender

    const handleArmy = (participant: Participant) => {
      if (action.payload.type === ArmyType.Main)
        return { ...participant, army: participant.army.set(action.payload.index, action.payload.unit) }
      if (action.payload.type === ArmyType.Reserve && action.payload.unit)
        return { ...participant, reserve: participant.reserve.set(action.payload.index, action.payload.unit) }
      if (action.payload.type === ArmyType.Reserve && !action.payload.unit)
        return { ...participant, reserve: participant.reserve.delete(action.payload.index) }
      if (action.payload.type === ArmyType.Defeated && action.payload.unit)
        return { ...participant, defeated: participant.defeated.set(action.payload.index, action.payload.unit) }
      if (action.payload.type === ArmyType.Defeated && !action.payload.unit)
        return { ...participant, defeated: participant.defeated.delete(action.payload.index) }
      return participant
    }

    if (action.payload.participant === ParticipantType.Attacker)
      new_attacker = handleArmy(new_attacker)
    if (action.payload.participant === ParticipantType.Defender)
      new_defender = handleArmy(new_defender)
    return {
      ...state,
      attacker: new_attacker,
      defender: new_defender,
      fight_over: !checkFight(new_attacker, new_defender)
    }
  })
  .handleAction(selectTerrain, (state, action: ReturnType<typeof selectTerrain>) => (
    {
      ...state,
      terrains: state.terrains.set(action.payload.index, action.payload.terrain)
    }
  ))
  .handleAction(setRowType, (state, action: ReturnType<typeof setRowType>) => (
    {
      ...state,
      attacker: { ...state.attacker, row_types: action.payload.participant === ParticipantType.Attacker ? state.attacker.row_types.set(action.payload.row_type, action.payload.unit) : state.attacker.row_types },
      defender: { ...state.defender, row_types: action.payload.participant === ParticipantType.Defender ? state.defender.row_types.set(action.payload.row_type, action.payload.unit) : state.defender.row_types }
    }
  ))
  .handleAction(selectTactic, (state, action: ReturnType<typeof selectTactic>) => (
    {
      ...state,
      attacker: { ...state.attacker, tactic: action.payload.participant === ParticipantType.Attacker ? action.payload.tactic : state.attacker.tactic },
      defender: { ...state.defender, tactic: action.payload.participant === ParticipantType.Defender ? action.payload.tactic : state.defender.tactic }
    }
  ))
  .handleAction(undo, (state, action: ReturnType<typeof undo>) => {
    let next = state
    for (let step = 0; step < action.payload.steps && next.day > -1; ++step) {
      const handleArmy = (current: Participant, past: PastState | undefined) => ({
        ...current,
        army: past ? past.army : current.army,
        reserve: past ? past.reserve : current.reserve,
        defeated: past ? past.defeated : current.defeated,
        roll: past ? past.roll : current.roll
      })
      const new_attacker = handleArmy(next.attacker, next.attacker_past.get(-1))
      const attacker_past = next.attacker_past.pop()
      const new_defender = handleArmy(next.defender, next.defender_past.get(-1))
      const defender_past = next.defender_past.pop()
      next = {
        ...next,
        attacker: new_attacker,
        defender: new_defender,
        attacker_past,
        defender_past,
        day: next.day - 1,
        fight_over: !(checkFight(new_attacker, new_defender))
      }
    }
    return next
  })
  .handleAction(removeReserveUnits, (state, action: ReturnType<typeof removeReserveUnits>) => {
    let reserve = action.payload.participant === ParticipantType.Attacker ? state.attacker.reserve : state.defender.reserve
    reserve = doRemoveReserveUnits(reserve, action.payload.types)
    const new_attacker = {
      ...state.attacker,
      reserve: action.payload.participant === ParticipantType.Attacker ? reserve : state.attacker.reserve
    }
    const new_defender = {
      ...state.defender,
      reserve: action.payload.participant === ParticipantType.Defender ? reserve : state.defender.reserve
    }
    return {
      ...state,
      attacker: new_attacker,
      defender: new_defender,
      fight_over: !(checkFight(new_attacker, new_defender))
    }
  })
  .handleAction(addReserveUnits, (state, action: ReturnType<typeof addReserveUnits>) => {
    let reserve = action.payload.participant === ParticipantType.Attacker ? state.attacker.reserve : state.defender.reserve
    reserve = doAddReserveUnits(reserve, action.payload.units)
    const new_attacker = {
      ...state.attacker,
      reserve: action.payload.participant === ParticipantType.Attacker ? reserve : state.attacker.reserve
    }
    const new_defender = {
      ...state.defender,
      reserve: action.payload.participant === ParticipantType.Defender ? reserve : state.defender.reserve
    }
    return {
      ...state,
      attacker: new_attacker,
      defender: new_defender,
      fight_over: !(checkFight(new_attacker, new_defender))
    }
  })
  .handleAction(setArmyName, (state, action: ReturnType<typeof setArmyName>) => (
    {
      ...state,
      attacker: { ...state.attacker, name: action.payload.participant === ParticipantType.Attacker ? action.payload.name : state.attacker.name },
      defender: { ...state.defender, name: action.payload.participant === ParticipantType.Defender ? action.payload.name : state.defender.name }
    }
  ))
