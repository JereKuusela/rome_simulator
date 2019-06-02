import { createReducer } from 'typesafe-actions'
import { List } from 'immutable'
import { getInitialArmy, getInitialTerrains, Participant, PastState } from './types'
import { selectUnit, selectTerrain, selectTactic, undo, toggleRandomRoll, setRoll, setGeneral, setRowType, removeReserveUnits, addReserveUnits, setFlankSize } from './actions'
import { ArmyName, Unit, UnitType, ArmyType } from '../units'

export const initialState = {
  attacker: getInitialArmy(),
  defender: getInitialArmy(),
  terrains: getInitialTerrains(),
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
      attacker: { ...state.attacker, randomize_roll: action.payload.army === ArmyName.Attacker ? !state.attacker.randomize_roll : state.attacker.randomize_roll },
      defender: { ...state.defender, randomize_roll: action.payload.army === ArmyName.Defender ? !state.defender.randomize_roll : state.defender.randomize_roll }
    }
  ))
  .handleAction(setGeneral, (state, action: ReturnType<typeof setGeneral>) => (
    {
      ...state,
      attacker: { ...state.attacker, general: action.payload.army === ArmyName.Attacker ? action.payload.skill : state.attacker.general },
      defender: { ...state.defender, general: action.payload.army === ArmyName.Defender ? action.payload.skill : state.defender.general }
    }
  ))
  .handleAction(setFlankSize, (state, action: ReturnType<typeof setFlankSize>) => (
    {
      ...state,
      attacker: { ...state.attacker, flank_size: action.payload.army === ArmyName.Attacker ? action.payload.size : state.attacker.flank_size },
      defender: { ...state.defender, flank_size: action.payload.army === ArmyName.Defender ? action.payload.size : state.defender.flank_size }
    }
  ))
  .handleAction(setRoll, (state, action: ReturnType<typeof setRoll>) => (
    {
      ...state,
      attacker: { ...state.attacker, roll: action.payload.army === ArmyName.Attacker ? action.payload.roll : state.attacker.roll },
      defender: { ...state.defender, roll: action.payload.army === ArmyName.Defender ? action.payload.roll : state.defender.roll }
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

    if (action.payload.army === ArmyName.Attacker)
      new_attacker = handleArmy(new_attacker)
    if (action.payload.army === ArmyName.Defender)
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
      attacker: { ...state.attacker, row_types: action.payload.army === ArmyName.Attacker ? state.attacker.row_types.set(action.payload.row_type, action.payload.unit) : state.attacker.row_types },
      defender: { ...state.defender, row_types: action.payload.army === ArmyName.Defender ? state.defender.row_types.set(action.payload.row_type, action.payload.unit) : state.defender.row_types }
    }
  ))
  .handleAction(selectTactic, (state, action: ReturnType<typeof selectTactic>) => (
    {
      ...state,
      attacker: { ...state.attacker, tactic: action.payload.army === ArmyName.Attacker ? action.payload.tactic : state.attacker.tactic },
      defender: { ...state.defender, tactic: action.payload.army === ArmyName.Defender ? action.payload.tactic : state.defender.tactic }
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
        roll: past ? past.roll : current.roll,
        past: current.past.pop()
      })
      const new_attacker = handleArmy(next.attacker, next.attacker.past.get(-1))
      const new_defender = handleArmy(next.defender, next.defender.past.get(-1))
      next = {
        ...next,
        attacker: new_attacker,
        defender: new_defender,
        day: next.day - 1,
        fight_over: !(checkFight(new_attacker, new_defender))
      }
    }
    return next
  })
  .handleAction(removeReserveUnits, (state, action: ReturnType<typeof removeReserveUnits>) => {
    let reserve = action.payload.army === ArmyName.Attacker ? state.attacker.reserve : state.defender.reserve
    reserve = doRemoveReserveUnits(reserve, action.payload.types)
    const new_attacker = {
      ...state.attacker,
      reserve: action.payload.army === ArmyName.Attacker ? reserve : state.attacker.reserve
    }
    const new_defender = {
      ...state.defender,
      reserve: action.payload.army === ArmyName.Defender ? reserve : state.defender.reserve
    }
    return {
      ...state,
      attacker: new_attacker,
      defender: new_defender,
      fight_over: !(checkFight(new_attacker, new_defender))
    }
  })
  .handleAction(addReserveUnits, (state, action: ReturnType<typeof addReserveUnits>) => {
    let reserve = action.payload.army === ArmyName.Attacker ? state.attacker.reserve : state.defender.reserve
    reserve = doAddReserveUnits(reserve, action.payload.units)
    const new_attacker = {
      ...state.attacker,
      reserve: action.payload.army === ArmyName.Attacker ? reserve : state.attacker.reserve
    }
    const new_defender = {
      ...state.defender,
      reserve: action.payload.army === ArmyName.Defender ? reserve : state.defender.reserve
    }
    return {
      ...state,
      attacker: new_attacker,
      defender: new_defender,
      fight_over: !(checkFight(new_attacker, new_defender))
    }
  })
