import { createReducer } from 'typesafe-actions'
import { List, Map } from 'immutable'
import { getInitialArmy, getInitialTerrains, Participant, PastState, ParticipantType } from './types'
import { clearUnits, selectUnit, selectTerrain, selectTactic, undo, toggleRandomRoll, setRoll, setGeneral, setRowType, removeReserveUnits, addReserveUnits, setFlankSize, selectArmy } from './actions'
import { Unit, UnitType, ArmyType, ArmyName, deleteArmy, createArmy, changeName, duplicateArmy } from '../units'

export const initialState = {
  armies: Map<ArmyName, Participant>().set(ArmyName.Attacker, getInitialArmy()).set(ArmyName.Defender, getInitialArmy()),
  attacker: ArmyName.Attacker,
  defender: ArmyName.Defender,
  terrains: getInitialTerrains(),
  attacker_past: List<PastState>(),
  defender_past: List<PastState>(),
  round: -1,
  fight_over: true
}

export const checkFight = (attacker?: Participant, defender?: Participant) => attacker && defender && (checkArmy(attacker.army) || checkArmy(attacker.reserve)) && (checkArmy(defender.army) || checkArmy(defender.reserve))

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
      armies: state.armies.update(action.payload.name, value => ({ ...value, randomize_roll: !value.randomize_roll }))
    }
  ))
  .handleAction(setGeneral, (state, action: ReturnType<typeof setGeneral>) => (
    {
      ...state,
      armies: state.armies.update(action.payload.name, value => ({ ...value, general: action.payload.skill }))
    }
  ))
  .handleAction(setFlankSize, (state, action: ReturnType<typeof setFlankSize>) => (
    {
      ...state,
      armies: state.armies.update(action.payload.name, value => ({ ...value, flank_size: action.payload.size }))
    }
  ))
  .handleAction(setRoll, (state, action: ReturnType<typeof setRoll>) => (
    {
      ...state,
      armies: state.armies.update(action.payload.name, value => ({ ...value, roll: action.payload.roll }))
    }
  ))
  .handleAction(selectUnit, (state, action: ReturnType<typeof selectUnit>) => {
    const handleArmy = (participant: Participant): Participant => {
      if (action.payload.type === ArmyType.Main)
        return { ...participant, army: participant.army.set(action.payload.index, action.payload.unit) }
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
    const armies = state.armies.update(action.payload.name, value => handleArmy(value))
    return {
      ...state,
      armies,
      fight_over: !checkFight(armies.get(state.attacker), armies.get(state.defender))
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
      armies: state.armies.update(action.payload.name, value => ({ ...value, row_types: value.row_types.set(action.payload.row_type, action.payload.unit) }))
    }
  ))
  .handleAction(selectTactic, (state, action: ReturnType<typeof selectTactic>) => (
    {
      ...state,
      armies: state.armies.update(action.payload.name, value => ({ ...value, tactic: action.payload.tactic }))
    }
  ))
  .handleAction(undo, (state, action: ReturnType<typeof undo>) => {
    let next = state
    for (let step = 0; step < action.payload.steps && next.round > -1; ++step) {
      const handleArmy = (current?: Participant, past?: PastState): Participant | undefined => current && ({
        ...current,
        army: past ? past.army : current.army,
        reserve: past ? past.reserve : current.reserve,
        defeated: past ? past.defeated : current.defeated,
        roll: past ? past.roll : current.roll
      })
      let armies = next.armies
      const new_attacker = handleArmy(next.armies.get(next.attacker), next.attacker_past.get(-1))
      if (new_attacker)
        armies = armies.set(next.attacker, new_attacker)
      const attacker_past = next.attacker_past.pop()
      const new_defender = handleArmy(next.armies.get(next.defender), next.defender_past.get(-1))
      if (new_defender)
        armies = armies.set(next.defender, new_defender)
      const defender_past = next.defender_past.pop()
      next = {
        ...next,
        armies,
        attacker_past,
        defender_past,
        round: next.round - 1,
        fight_over: !(checkFight(new_attacker, new_defender))
      }
    }
    return next
  })
  .handleAction(removeReserveUnits, (state, action: ReturnType<typeof removeReserveUnits>) => {
    const armies = state.armies.update(action.payload.name, value => ({ ...value, reserve: doRemoveReserveUnits(value.reserve, action.payload.types) }))
    return {
      ...state,
      armies,
      fight_over: !(checkFight(armies.get(state.attacker), armies.get(state.defender)))
    }
  })
  .handleAction(addReserveUnits, (state, action: ReturnType<typeof addReserveUnits>) => {
    const armies = state.armies.update(action.payload.name, value => ({ ...value, reserve: doAddReserveUnits(value.reserve, action.payload.units) }))
    return {
      ...state,
      armies,
      fight_over: !(checkFight(armies.get(state.attacker), armies.get(state.defender)))
    }
  })
  .handleAction(selectArmy, (state, action: ReturnType<typeof selectArmy>) => {
    let armies = state.armies
    if (state.attacker_past.size > 0)
      armies = armies.update(state.attacker, value => ({ ...value, ...state.attacker_past.get(0) }))
    if (state.defender_past.size > 0)
      armies = armies.update(state.defender, value => ({ ...value, ...state.defender_past.get(0) }))
    const attacker = action.payload.type === ParticipantType.Attacker ? action.payload.name : (action.payload.name === state.attacker ? state.defender : state.attacker)
    const defender = action.payload.type === ParticipantType.Defender ? action.payload.name : (action.payload.name === state.defender ? state.attacker : state.defender)
    return {
      ...state,
      armies,
      attacker: attacker,
      defender: defender,
      attacker_past: state.attacker_past.clear(),
      defender_past: state.attacker_past.clear(),
      round: -1,
      fight_over: !(checkFight(armies.get(attacker), armies.get(defender)))
    }
  })
  .handleAction(createArmy, (state, action: ReturnType<typeof createArmy>) => (
    {
      ...state,
      armies: state.armies.set(action.payload.army, getInitialArmy())
    }
  ))
  .handleAction(duplicateArmy, (state, action: ReturnType<typeof duplicateArmy>) => (
    {
      ...state,
      armies: state.armies.set(action.payload.army, state.armies.get(action.payload.source) || getInitialArmy())
    }
  ))
  .handleAction(deleteArmy, (state, action: ReturnType<typeof deleteArmy>) => (
    {
      ...state,
      armies: state.armies.delete(action.payload.army)
    }
  ))
  .handleAction(changeName, (state, action: ReturnType<typeof changeName>) => (
    {
      ...state,
      armies: state.armies.mapKeys(key => key === action.payload.old_army ? action.payload.new_army : key)
    }
  ))
  .handleAction(clearUnits, (state, action: ReturnType<typeof clearUnits>) => {
    let armies = state.armies
    if (armies.has(state.attacker))
      armies = armies.update(state.attacker, value => ({ ...value, army: getInitialArmy().army, reserve: value.reserve.clear(), defeated: value.defeated.clear() }))
    if (armies.has(state.defender))
      armies = armies.update(state.defender, value => ({ ...value, army: getInitialArmy().army, reserve: value.reserve.clear(), defeated: value.defeated.clear() }))
    return {
      ...state,
      armies,
      attacker_past: state.attacker_past.clear(),
      defender_past: state.defender_past.clear(),
      round: -1,
      fight_over: true
    }
  })

