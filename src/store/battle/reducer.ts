import { createReducer } from 'typesafe-actions'
import { List, Map } from 'immutable'
import {
  getInitialArmy, getInitialTerrains, Participant, PastState, ParticipantType,
  clearUnits, selectUnit, selectTerrain, selectTactic, undo, toggleRandomRoll, setRoll, setRowType, removeReserveUnits, addReserveUnits, setFlankSize,
  selectArmy, ArmyType
} from './actions'
import { Unit, UnitType  } from '../units'
import { TerrainType } from '../terrains'
import { DefinitionType } from '../../base_definition'
import { CountryName } from '../countries/actions'

export interface Armies {
  readonly armies: Map<CountryName, Participant>
  readonly attacker: CountryName
  readonly defender: CountryName
  readonly terrains: List<TerrainType>,
  readonly attacker_past: List<PastState>,
  readonly defender_past: List<PastState>,
  readonly round: number,
  readonly fight_over: boolean,
}

export const modeState = (mode: DefinitionType): Armies => ({
  armies: Map<CountryName, Participant>().set(CountryName.Country1, getInitialArmy(mode)).set(CountryName.Country2, getInitialArmy(mode)),
  attacker: CountryName.Country1,
  defender: CountryName.Country2,
  terrains: getInitialTerrains(mode),
  attacker_past: List<PastState>(),
  defender_past: List<PastState>(),
  round: -1,
  fight_over: true
})

export const initialState = Map<DefinitionType, Armies>()
  .set(DefinitionType.Land, modeState(DefinitionType.Land))
  .set(DefinitionType.Naval, modeState(DefinitionType.Naval))


export const checkFight = (attacker?: Participant, defender?: Participant) => attacker && defender && (checkArmy(attacker.frontline) || checkArmy(attacker.reserve)) && (checkArmy(defender.frontline) || checkArmy(defender.reserve))

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

const update = (state: Map<DefinitionType, Armies>, payload: { mode: DefinitionType, country: CountryName }, updater: (participant: Participant) => Participant): Map<DefinitionType, Armies> => {
  return state.update(payload.mode, mode => {
    return { ...mode, armies: mode.armies.update(payload.country, updater) }
  })
}

const fightOver = (state: Map<DefinitionType, Armies>, payload: { mode: DefinitionType }): Map<DefinitionType, Armies> => {
  return state.update(payload.mode, mode => {
    return { ...mode, fight_over: !checkFight(mode.armies.get(mode.attacker), mode.armies.get(mode.defender)) }
  })
}

export const battleReducer = createReducer(initialState)
  .handleAction(toggleRandomRoll, (state, action: ReturnType<typeof toggleRandomRoll>) => (
    update(state, action.payload, (value: Participant) => ({ ...value, randomize_roll: !value.randomize_roll }))
  ))
  .handleAction(setFlankSize, (state, action: ReturnType<typeof setFlankSize>) => (
    update(state, action.payload, (value: Participant) => ({ ...value, flank_size: action.payload.size }))
  ))
  .handleAction(setRoll, (state, action: ReturnType<typeof setRoll>) => (
    update(state, action.payload, (value: Participant) => ({ ...value, roll: action.payload.roll }))
  ))
  .handleAction(selectUnit, (state, action: ReturnType<typeof selectUnit>) => {
    const handleArmy = (participant: Participant): Participant => {
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
  .handleAction(selectTerrain, (state, action: ReturnType<typeof selectTerrain>) => (
    state.update(action.payload.mode, mode => {
      return { ...mode, terrains: mode.terrains.set(action.payload.index, action.payload.terrain) }
    })
  ))
  .handleAction(setRowType, (state, action: ReturnType<typeof setRowType>) => (
    update(state, action.payload, (value: Participant) => ({ ...value, row_types: value.row_types.set(action.payload.row_type, action.payload.unit) }))
  ))
  .handleAction(selectTactic, (state, action: ReturnType<typeof selectTactic>) => (
    update(state, action.payload, (value: Participant) => ({ ...value, tactic: action.payload.tactic }))
  ))
  .handleAction(undo, (state, action: ReturnType<typeof undo>) => {
    let next = state.get(action.payload.mode)
    if (!next)
      return state
    for (let step = 0; step < action.payload.steps && next.round > -1; ++step) {
      const handleArmy = (current?: Participant, past?: PastState): Participant | undefined => current && ({
        ...current,
        frontline: past ? past.frontline : current.frontline,
        reserve: past ? past.reserve : current.reserve,
        defeated: past ? past.defeated : current.defeated,
        roll: past ? past.roll : current.roll
      })
      let armies: Map<CountryName, Participant> = next.armies
      const new_attacker = handleArmy(next.armies.get(next.attacker), next.attacker_past.get(-1))
      if (new_attacker)
        armies = armies.set(next.attacker, new_attacker)
      const attacker_past: List<PastState> = next.attacker_past.pop()
      const new_defender = handleArmy(next.armies.get(next.defender), next.defender_past.get(-1))
      if (new_defender)
        armies = armies.set(next.defender, new_defender)
      const defender_past: List<PastState> = next.defender_past.pop()
      next = {
        ...next,
        armies,
        attacker_past,
        defender_past,
        round: next.round - 1,
        fight_over: !(checkFight(new_attacker, new_defender))
      }
    }
    return state.set(action.payload.mode, next)
  })
  .handleAction(removeReserveUnits, (state, action: ReturnType<typeof removeReserveUnits>) => {
    let next = update(state, action.payload, (value: Participant) => ({ ...value, reserve: doRemoveReserveUnits(value.reserve, action.payload.types) }))
    return fightOver(next, action.payload)
  })
  .handleAction(addReserveUnits, (state, action: ReturnType<typeof addReserveUnits>) => {
    let next = update(state, action.payload, (value: Participant) => ({ ...value, reserve: doAddReserveUnits(value.reserve, action.payload.units) }))
    return fightOver(next, action.payload)
  })
  .handleAction(selectArmy, (state, action: ReturnType<typeof selectArmy>) => {
    let next = state.get(action.payload.mode)
    if (!next)
      return state
    let armies = next.armies
    if (next.attacker_past.size > 0)
      armies = armies.update(next.attacker, value => ({ ...value, ...next!.attacker_past.get(0) }))
    if (next.defender_past.size > 0)
      armies = armies.update(next.defender, value => ({ ...value, ...next!.defender_past.get(0) }))
    const attacker = action.payload.type === ParticipantType.Attacker ? action.payload.country : (action.payload.country === next.attacker ? next.defender : next.attacker)
    const defender = action.payload.type === ParticipantType.Defender ? action.payload.country : (action.payload.country === next.defender ? next.attacker : next.defender)
    next = {
      ...next,
      armies,
      attacker: attacker,
      defender: defender,
      attacker_past: next.attacker_past.clear(),
      defender_past: next.attacker_past.clear(),
      round: -1
    }
    return fightOver(state.set(action.payload.mode, next), action.payload)
  })
  .handleAction(clearUnits, (state, action: ReturnType<typeof clearUnits>) => {
    let next = state.get(action.payload.mode)
    if (!next)
      return state
    let armies = next.armies
    if (armies.has(next.attacker))
      armies = armies.update(next.attacker, value => ({ ...value, frontline: getInitialArmy(action.payload.mode).frontline, reserve: value.reserve.clear(), defeated: value.defeated.clear() }))
    if (armies.has(next.defender))
      armies = armies.update(next.defender, value => ({ ...value, frontline: getInitialArmy(action.payload.mode).frontline, reserve: value.reserve.clear(), defeated: value.defeated.clear() }))
    next = {
      ...next,
      armies,
      attacker_past: next.attacker_past.clear(),
      defender_past: next.defender_past.clear(),
      round: -1,
      fight_over: true
    }
    return state.set(action.payload.mode, next)
  })
