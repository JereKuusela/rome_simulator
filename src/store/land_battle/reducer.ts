import { createReducer } from 'typesafe-actions'
import { List } from 'immutable'
import { getInitialArmy, getInitialTerrains, ParticipantState, PastState } from './types'
import { selectUnit, selectTerrain, battle, selectTactic, undo, toggleRandomRoll, setRoll, setGeneral, setRowType, removeReserveUnits, addReserveUnits, setFlankSize } from './actions'
import { ArmyName, setGlobalValue, setValue, UnitDefinition, UnitType, ValueType, ArmyType } from '../units'
import { battle as fight } from './combat'
import { ValuesType } from '../../utils'
import { setBaseValue as setTacticBaseValue } from '../tactics'
import { setBaseValue as setTerrainBaseValue } from '../terrains'

export const initialState = {
  attacker: getInitialArmy(),
  defender: getInitialArmy(),
  terrains: getInitialTerrains(),
  day: -1,
  fight_over: true
}

const updateValue = (army_type: ArmyName, army: List<UnitDefinition | undefined>, payload: { army: ArmyName, type: ValuesType, unit: UnitType, key: string, attribute: ValueType, value: number }) => {
  return army.map(unit => payload.army === army_type && unit && unit.type === payload.unit ? unit.add_value(payload.type, payload.key, payload.attribute, payload.value) : unit)
}

const updateValue2 = (army_type: ArmyName, army: List<UnitDefinition>, payload: { army: ArmyName, type: ValuesType, unit: UnitType, key: string, attribute: ValueType, value: number }) => {
  return army.map(unit => payload.army === army_type && unit && unit.type === payload.unit ? unit.add_value(payload.type, payload.key, payload.attribute, payload.value) : unit)
}

const updateGlobalValue = (army_type: ArmyName, army: List<UnitDefinition | undefined>, payload: { army: ArmyName, type: ValuesType, key: string, attribute: ValueType, value: number }) => {
  return army.map(unit => payload.army === army_type && unit ? unit.add_value(payload.type, payload.key, payload.attribute, payload.value) : unit)
}
const updateGlobalValue2 = (army_type: ArmyName, army: List<UnitDefinition>, payload: { army: ArmyName, type: ValuesType, key: string, attribute: ValueType, value: number }) => {
  return army.map(unit => payload.army === army_type && unit ? unit.add_value(payload.type, payload.key, payload.attribute, payload.value) : unit)
}
const checkFight = (attacker: ParticipantState, defender: ParticipantState) => (checkArmy(attacker.army) || checkArmy(attacker.reserve)) && (checkArmy(defender.army) || checkArmy(defender.reserve))

const checkArmy = (army: List<UnitDefinition | undefined>) => {
  for (let unit of army) {
    if (unit)
      return true
  }
  return false
}

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

    const handleArmy = (participant: ParticipantState) => {
      if (action.payload.type === ArmyType.Main)
        return { ...participant, army: participant.army.set(action.payload.index, action.payload.unit) }
      if (action.payload.type === ArmyType.Reserve && action.payload.unit)
        return { ...participant, reserve: participant.reserve.push(action.payload.unit) }
      if (action.payload.type === ArmyType.Reserve && !action.payload.unit)
        return { ...participant, reserve: participant.reserve.delete(action.payload.index) }
      if (action.payload.type === ArmyType.Defeated && action.payload.unit)
        return { ...participant, defeated: participant.defeated.push(action.payload.unit) }
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
  .handleAction(battle, (state, action: ReturnType<typeof battle>) => {
    let next = state
    for (let step = 0; step < action.payload.steps && !next.fight_over; ++step) {
      const old_rolls = [next.attacker.roll, next.defender.roll]
      if (next.day % 5 === 0) {
        next = {
          ...next,
          attacker: {
            ...next.attacker,
            roll: next.attacker.randomize_roll ? 1 + Math.round(Math.random() * 5) : next.attacker.roll
          },
          defender: {
            ...next.defender,
            roll: next.defender.randomize_roll ? 1 + Math.round(Math.random() * 5) : next.defender.roll
          }
        }
      }
      let [army_a, army_d, reserve_a, reserve_d, defeated_a, defeated_d] = fight(next.attacker, next.defender, next.day + 1, next.terrains)
      const new_attacker = {
        ...next.attacker,
        army: army_a,
        reserve: reserve_a,
        defeated: defeated_a,
        past: next.attacker.past.push({ army: next.attacker.army, reserve: next.attacker.reserve, defeated: next.attacker.defeated, roll: old_rolls[0] })
      }
      const new_defender = {
        ...next.defender,
        army: army_d,
        reserve: reserve_d,
        defeated: defeated_d,
        past: next.defender.past.push({ army: next.defender.army, reserve: next.defender.reserve, defeated: next.defender.defeated, roll: old_rolls[1] })
      }
      next = {
        ...next,
        attacker: new_attacker,
        defender: new_defender,
        day: next.day + 1,
        fight_over: !checkFight(new_attacker, new_defender)
      }
    }
    return next
  }
  )
  .handleAction(undo, (state, action: ReturnType<typeof undo>) => {
    let next = state
    for (let step = 0; step < action.payload.steps && next.day > -1; ++step) {
      const handleArmy = (current: ParticipantState, past: PastState | undefined) => ({
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
    for (const type of action.payload.types)
      reserve = reserve.delete(reserve.findLastIndex(value => value.type === type))
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
    reserve = reserve.merge(action.payload.units)
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
  .handleAction(setTacticBaseValue, (state, action: ReturnType<typeof setTacticBaseValue>) => (
    {
      ...state,
      attacker: {
        ...state.attacker,
        tactic: state.attacker.tactic && action.payload.tactic === state.attacker.tactic.type ? state.attacker.tactic.add_base_value(action.payload.key, action.payload.attribute, action.payload.value) : state.attacker.tactic
      },
      defender: {
        ...state.defender,
        tactic: state.defender.tactic && action.payload.tactic === state.defender.tactic.type ? state.defender.tactic.add_base_value(action.payload.key, action.payload.attribute, action.payload.value) : state.defender.tactic
      }
    }
  ))
  .handleAction(setTerrainBaseValue, (state, action: ReturnType<typeof setTerrainBaseValue>) => (
    {
      ...state,
      terrains: state.terrains.map(terrain => terrain.type === action.payload.terrain ? terrain.add_base_value(action.payload.key, action.payload.attribute, action.payload.value) : terrain)
    }
  ))
  .handleAction(setValue, (state, action: ReturnType<typeof setValue>) => (
    {
      ...state,
      attacker: {
        ...state.attacker,
        army: updateValue(ArmyName.Attacker, state.attacker.army, action.payload),
        reserve: updateValue2(ArmyName.Attacker, state.attacker.reserve, action.payload),
        defeated: updateValue2(ArmyName.Attacker, state.attacker.defeated, action.payload),
        past: state.attacker.past.map(armies => ({ ...armies, army: updateValue(ArmyName.Attacker, armies.army, action.payload), reserve: updateValue2(ArmyName.Attacker, armies.reserve, action.payload), defeated: updateValue2(ArmyName.Attacker, armies.defeated, action.payload) }))
      },
      defender: {
        ...state.defender,
        army: updateValue(ArmyName.Defender, state.defender.army, action.payload),
        reserve: updateValue2(ArmyName.Defender, state.attacker.reserve, action.payload),
        defeated: updateValue2(ArmyName.Defender, state.defender.defeated, action.payload),
        past: state.defender.past.map(armies => ({ ...armies, army: updateValue(ArmyName.Defender, armies.army, action.payload), reserve: updateValue2(ArmyName.Defender, armies.reserve, action.payload), defeated: updateValue2(ArmyName.Defender, armies.defeated, action.payload) }))
      }
    }
  ))
  .handleAction(setGlobalValue, (state, action: ReturnType<typeof setGlobalValue>) => (
    {
      ...state,
      attacker: {
        ...state.attacker,
        army: updateGlobalValue(ArmyName.Attacker, state.attacker.army, action.payload),
        reserve: updateGlobalValue2(ArmyName.Attacker, state.attacker.reserve, action.payload),
        defeated: updateGlobalValue2(ArmyName.Attacker, state.attacker.defeated, action.payload),
        past: state.attacker.past.map(armies => ({ ...armies, army: updateGlobalValue(ArmyName.Attacker, armies.army, action.payload), reserve: updateGlobalValue2(ArmyName.Attacker, armies.reserve, action.payload), defeated: updateGlobalValue2(ArmyName.Attacker, armies.defeated, action.payload) }))
      },
      defender: {
        ...state.defender,
        army: updateGlobalValue(ArmyName.Defender, state.defender.army, action.payload),
        reserve: updateGlobalValue2(ArmyName.Defender, state.attacker.reserve, action.payload),
        defeated: updateGlobalValue2(ArmyName.Defender, state.defender.defeated, action.payload),
        past: state.defender.past.map(armies => ({ ...armies, army: updateGlobalValue(ArmyName.Defender, armies.army, action.payload), reserve: updateGlobalValue2(ArmyName.Defender, armies.reserve, action.payload), defeated: updateGlobalValue2(ArmyName.Defender, armies.defeated, action.payload) }))
      }
    }
  ))
