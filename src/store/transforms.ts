import { fromJS, Map, List, OrderedSet } from 'immutable'
import { tacticFromJS, TacticType, tacticsState } from './tactics'
import { terrainFromJS, TerrainType, terrainState } from './terrains'
import { unitDefinitionFromJS, unitFromJS, ArmyName, UnitType, unitsState, globalStatsState, Unit } from './units'
import { RowType, initialState, PastState, Participant } from './land_battle'
import { transferState } from './transfer'
import { settingsState } from './settings'

const readTypes = <T>(types_raw: any, initial: OrderedSet<T>): OrderedSet<T> => {
  let types = initial
  if (types_raw)
    types = fromJS(types_raw).toOrderedSet()
  if (types.size === 0)
    types = initial
  return types
}

export const transformTactics = (state_raw: any): typeof tacticsState => {
  if (!state_raw)
    return tacticsState
  let definitions = tacticsState.definitions
  if (state_raw.definitions) {
    let definitions_raw: Map<TacticType, any> = fromJS(state_raw.definitions)
    definitions = definitions_raw.map(value => tacticFromJS(value)!).filter(value => value)
  }
  const types = readTypes(state_raw.types, tacticsState.types)
  return { definitions, types }
}

export const transformTerrains = (state_raw: any): typeof terrainState => {
  if (!state_raw)
    return terrainState
  let definitions = terrainState.definitions
  if (state_raw.definitions) {
    let definitions_raw: Map<TerrainType, any> = fromJS(state_raw.definitions)
    definitions = definitions_raw.map(value => terrainFromJS(value)!).filter(value => value)
  }
  const types = readTypes(state_raw.types, terrainState.types)
  return { definitions, types }
}

export const transformUnits = (state_raw: any): typeof unitsState => {
  if (!state_raw)
    return unitsState
  let definitions = unitsState.definitions
  if (state_raw.definitions) {
    let definitions_raw: Map<ArmyName, Map<UnitType, any>> = fromJS(state_raw.definitions)
    definitions = definitions_raw.filter(value => value).map(value => value.map(value => unitDefinitionFromJS(value)!).filter(value => value))
  }
  let types = unitsState.types
  if (state_raw.types)
    types = fromJS(state_raw.types)
  if (types.size === 0)
    types = unitsState.types
  types = types.map(value => readTypes(value, unitsState.types.get(ArmyName.Attacker)!))
  return { definitions, types }
}

export const transformGlobalStats = (state_raw: any): typeof globalStatsState => {
  if (!state_raw)
    return globalStatsState
  let global_stats_raw: Map<ArmyName, any> = fromJS(state_raw)
  let global_stats = global_stats_raw.map(value => unitDefinitionFromJS(value)!)
  return global_stats
}

export const transformLand = (state_raw: any): typeof initialState => {
  if (!state_raw)
    return initialState
  // Terrain can be null (corrupted), TerrainDefinition (old) or TerrainType.
  let terrains = initialState.terrains
  if (state_raw.terrains) {
    const terrains_raw = fromJS(state_raw.terrains)
    if (!terrains_raw.contains(null))
      terrains = terrains_raw.map((value: any) => typeof value === 'string' ? value : value.type)
  }

  const serializeUnits = (raw: List<any>):List<Unit | undefined> => raw.map(value => unitFromJS(value))

  const serializeParticipant = (participant: any, attacker: boolean): Participant => {
    const initial = attacker ? initialState.attacker : initialState.defender
    let army = initial.army
    if (participant.army)
      army = serializeUnits(fromJS(participant.army)).setSize(30)
    let reserve = initial.reserve
    if (participant.reserve)
      reserve = serializeUnits(fromJS(participant.reserve)).filter(value => value) as List<Unit>
    let defeated = initial.defeated
    if (participant.defeated)
      defeated = serializeUnits(fromJS(participant.defeated)).filter(value => value) as List<Unit>
    let past = initial.past
    if (participant.past) {
      let past4: List<Map<string, any>> = fromJS(participant.past)
      let past3 = past4.map(value => ({
        army: value.get('army') as List<any>,
        reserve: value.get('reserve') as List<any>,
        defeated: value.get('defeated') as List<any>,
        roll: value.get('roll') as number
      }))
      past = past3.map(value => ({ army: serializeUnits(value.army).setSize(30), reserve: serializeUnits(value.reserve).filter(value => value), defeated: serializeUnits(value.defeated).filter(value => value), roll: value.roll } as PastState))
    }
    let row_types: Map<RowType, UnitType>
    if (participant.row_types)
      row_types = fromJS(participant.row_types)
    else
      row_types = initial.row_types
    let tactic = participant.tactic
    // Tactic can be null (corrupted), TacticDefition (old) or TacticType.
    if (!tactic)
      tactic = initial.tactic
    if (typeof tactic !== 'string')
      tactic = tactic.type
    const name = participant.name || initial.name
    const general = participant.general || initial.general
    const flank_size = participant.flank_size || initial.flank_size
    const roll = participant.roll || initial.roll
    const randomize_roll = participant.randomize_roll || initial.randomize_roll
    return {
      name,
      general,
      flank_size,
      roll,
      randomize_roll,
      army,
      reserve,
      defeated,
      past,
      row_types,
      tactic
    }
  }
  let attacker = initialState.attacker
  if (state_raw.attacker)
    attacker = serializeParticipant(state_raw.attacker, true)
  let defender = initialState.defender
  if (state_raw.defender)
    defender = serializeParticipant(state_raw.defender, false)
  const day = state_raw.day || initialState.day
  const fight_over = state_raw.fight_over || initialState.fight_over
  return { day, fight_over, terrains, attacker, defender }
}

export const transfromTransfer = (state_raw: any): typeof transferState => {
  if (!state_raw)
    return transferState
  const export_keys = state_raw.export_keys ? fromJS(state_raw.export_keys) : transferState.export_keys
  const reset_missing = state_raw.reset_missing || transferState.reset_missing
  return { reset_missing, export_keys }
}

export const transformSettings = (state_raw: any): typeof settingsState => {
  if (!state_raw)
    return settingsState
  const combat = state_raw.combat ? fromJS(state_raw.combat) : settingsState.combat
  return { combat }
}
