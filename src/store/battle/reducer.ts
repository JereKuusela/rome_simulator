import { createReducer } from 'typesafe-actions'
import { List, Map } from 'immutable'
import {
  getDefaultArmy, getInitialTerrains, Participant, RoundState, ParticipantType,
  clearUnits, selectUnit, selectTerrain, selectTactic, undo, toggleRandomRoll, setRoll, setRowType, removeReserveUnits, addReserveUnits, setFlankSize,
  selectArmy, ArmyType, Army, invalidate, invalidateCountry
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
  readonly attacker_rounds: List<RoundState>,
  readonly defender_rounds: List<RoundState>,
  readonly round: number,
  readonly fight_over: boolean,
  readonly seed: number,
  readonly custom_seed?: number,
  readonly outdated: boolean
}

export const modeState = (mode: DefinitionType): Armies => ({
  armies: Map<CountryName, Participant>().set(CountryName.Country1, getDefaultArmy(mode)).set(CountryName.Country2, getDefaultArmy(mode)),
  attacker: CountryName.Country1,
  defender: CountryName.Country2,
  terrains: getInitialTerrains(mode),
  attacker_rounds: List<RoundState>(),
  defender_rounds: List<RoundState>(),
  round: -1,
  fight_over: true,
  seed: 0,
  custom_seed: undefined,
  outdated: true
})

export const initialState = Map<DefinitionType, Armies>()
  .set(DefinitionType.Land, modeState(DefinitionType.Land))
  .set(DefinitionType.Naval, modeState(DefinitionType.Naval))


export const checkFight = (attacker?: Army, defender?: Army) => attacker && defender && (checkArmy(attacker.frontline) || checkArmy(attacker.reserve)) && (checkArmy(defender.frontline) || checkArmy(defender.reserve))

const checkArmy = (army: List<Unit | undefined>) => army.find(value => value !== undefined) !== undefined

export const doRemoveReserveUnits = (reserve: List<Unit>, types: UnitType[]) => {
  for (const type of types)
    reserve = reserve.delete(reserve.findLastIndex(value => value.type === type))
  return reserve
}

export const doAddReserveUnits = (reserve: List<Unit>, units: Unit[]) => reserve.merge(units)

const update = (state: Map<DefinitionType, Armies>, payload: { mode: DefinitionType, country: CountryName }, updater: (participant: Participant) => Participant): Map<DefinitionType, Armies> => {
  if (!state.has(payload.mode))
    state = state.set(payload.mode, modeState(payload.mode))
  return state.update(payload.mode, mode => {
    return { ...mode, armies: mode.armies.update(payload.country, getDefaultArmy(payload.mode), updater) }
  })
}

const fightOver = (state: Map<DefinitionType, Armies>, payload: { mode: DefinitionType }): Map<DefinitionType, Armies> => {
  if (!state.has(payload.mode))
    state = state.set(payload.mode, modeState(payload.mode))
  return state.update(payload.mode, mode => {
    return { ...mode, fight_over: !checkFight(mode.armies.get(mode.attacker, getDefaultArmy(payload.mode)), mode.armies.get(mode.defender, getDefaultArmy(payload.mode))) }
  })
}

export const battleReducer = createReducer(initialState)
  .handleAction(toggleRandomRoll, (state, action: ReturnType<typeof toggleRandomRoll>) => 
    update(state, action.payload, (value: Participant) => ({ ...value, randomize_roll: !value.randomize_roll }))
  )
  .handleAction(setFlankSize, (state, action: ReturnType<typeof setFlankSize>) => 
    update(state, action.payload, (value: Participant) => ({ ...value, flank_size: action.payload.size }))
  )
  .handleAction(setRoll, (state, action: ReturnType<typeof setRoll>) => 
    update(state, action.payload, (value: Participant) => ({ ...value, roll: action.payload.roll }))
  )
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
  .handleAction(selectTerrain, (state, action: ReturnType<typeof selectTerrain>) => 
    state.update(action.payload.mode, mode => {
      return { ...mode, terrains: mode.terrains.set(action.payload.index, action.payload.terrain) }
    })
  )
  .handleAction(setRowType, (state, action: ReturnType<typeof setRowType>) => 
    update(state, action.payload, (value: Participant) => ({ ...value, row_types: value.row_types.set(action.payload.row_type, action.payload.unit) }))
  )
  .handleAction(selectTactic, (state, action: ReturnType<typeof selectTactic>) => 
    update(state, action.payload, (value: Participant) => ({ ...value, tactic: action.payload.tactic }))
  )
  .handleAction(undo, (state, action: ReturnType<typeof undo>) => {
    let next = state.get(action.payload.mode)
    if (!next)
      return state
    for (let step = 0; step < action.payload.steps && next.round > -1; ++step) {
      let seed: number = next.seed
      if (next.round < 2)
        seed = next.custom_seed ? next.custom_seed : 0
      const attacker_rounds: List<RoundState> = next.attacker_rounds.pop()
      const defender_rounds: List<RoundState> = next.defender_rounds.pop()
      next = {
        ...next,
        attacker_rounds,
        defender_rounds,
        round: next.round - 1,
        fight_over: !(checkFight(attacker_rounds.get(-1, next.armies.get(next.attacker)), defender_rounds.get(-1, next.armies.get(next.defender)))),
        seed
      }
    }
    return state.set(action.payload.mode, next)
  })
  .handleAction(removeReserveUnits, (state, action: ReturnType<typeof removeReserveUnits>) => 
    update(state, action.payload, (value: Participant) => ({ ...value, reserve: doRemoveReserveUnits(value.reserve, action.payload.types) }))
  )
  .handleAction(addReserveUnits, (state, action: ReturnType<typeof addReserveUnits>) => 
    update(state, action.payload, (value: Participant) => ({ ...value, reserve: doAddReserveUnits(value.reserve, action.payload.units) }))
  )
  .handleAction(selectArmy, (state, action: ReturnType<typeof selectArmy>) => {
    let next = state.get(action.payload.mode)
    if (!next)
      return state
    const attacker = action.payload.type === ParticipantType.Attacker ? action.payload.country : (action.payload.country === next.attacker ? next.defender : next.attacker)
    const defender = action.payload.type === ParticipantType.Defender ? action.payload.country : (action.payload.country === next.defender ? next.attacker : next.defender)
    return state.update(action.payload.mode, value => ({ ...value, attacker, defender }))
  })
  .handleAction(clearUnits, (state, action: ReturnType<typeof clearUnits>) => {
    let next = state.get(action.payload.mode)
    if (!next)
      return state
    let armies = next.armies
    if (armies.has(next.attacker))
      armies = armies.update(next.attacker, getDefaultArmy(action.payload.mode), value => ({ ...value, frontline: getDefaultArmy(action.payload.mode).frontline, reserve: value.reserve.clear(), defeated: value.defeated.clear() }))
    if (armies.has(next.defender))
      armies = armies.update(next.defender, getDefaultArmy(action.payload.mode), value => ({ ...value, frontline: getDefaultArmy(action.payload.mode).frontline, reserve: value.reserve.clear(), defeated: value.defeated.clear() }))
    next = {
      ...next,
      armies,
      attacker_rounds: next.attacker_rounds.clear(),
      defender_rounds: next.defender_rounds.clear(),
      round: -1,
      fight_over: true
    }
    return state.set(action.payload.mode, next)
  })
  .handleAction(invalidate, (state, action: ReturnType<typeof invalidate>) => 
    state.update(action.payload.mode, value => ({ ...value, outdated: true}))
  )
  .handleAction(invalidateCountry, (state, action: ReturnType<typeof invalidateCountry>) => 
    state.map(value => ({ ...value, outdated: value.outdated || value.attacker === action.payload.country || value.defender === action.payload.country}))
  )
