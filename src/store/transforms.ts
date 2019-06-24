import { fromJS, Map, List, OrderedSet, OrderedMap } from 'immutable'
import { tacticFromJS, TacticType, tacticsState } from './tactics'
import { terrainFromJS, TerrainType, terrainState } from './terrains'
import { unitDefinitionFromJS, unitFromJS, ArmyName, UnitType, unitsState, globalStatsState, Unit } from './units'
import { RowType, initialState, PastState, Participant, getInitialArmy } from './land_battle'
import { DefinitionType } from '../base_definition'
import { transferState } from './transfer'
import { settingsState, CombatParameter } from './settings'

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
  let global_stats_raw: Map<ArmyName, Map<DefinitionType, any>> = fromJS(state_raw)
  let global_stats = global_stats_raw.filter(value => value).map(value => value.map(value => unitDefinitionFromJS(value)!).filter(value => value))
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

  const serializeUnits = (raw: List<any>): List<Unit | undefined> => raw.map(value => unitFromJS(value))

  const serializePast = (past_raw: any, round: number): List<PastState> => {
    let past = List<PastState>()
    if (past_raw) {
      let past4: List<Map<string, any>> = fromJS(past_raw)
      let past3 = past4.map(value => ({
        frontline: value.has('frontline') ? value.get('frontline') as List<any> : value.get('army') as List<any>,
        reserve: value.get('reserve') as List<any>,
        defeated: value.get('defeated') as List<any>,
        roll: value.has('roll') ? value.get('roll') as number : 0
      }))
      past = past3.map(value => ({ frontline: serializeUnits(value.frontline).setSize(30), reserve: serializeUnits(value.reserve).filter(value => value), defeated: serializeUnits(value.defeated).filter(value => value), roll: value.roll } as PastState))
    }
    // Prevent history and index (round number) getting out of sync.
    return past.setSize(round + 1)
  }

  const serializeParticipant = (participant: any): Participant => {
    const initial = getInitialArmy()
    let frontline = initial.frontline
    // Legacy conversion, can be removed at some point (added 2019-06-21).
    if (participant.army && !participant.frontline)
      participant.frontline = participant.army
    if (participant.frontline)
      frontline = serializeUnits(fromJS(participant.frontline)).setSize(30)
    let reserve = initial.reserve
    if (participant.reserve)
      reserve = serializeUnits(fromJS(participant.reserve)).filter(value => value) as List<Unit>
    let defeated = initial.defeated
    if (participant.defeated)
      defeated = serializeUnits(fromJS(participant.defeated)).filter(value => value) as List<Unit>
    let row_types: Map<RowType, UnitType | undefined>
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
    const general = participant.general || initial.general
    const flank_size = participant.flank_size || initial.flank_size
    const roll = participant.roll || initial.roll
    const randomize_roll = participant.randomize_roll
    return {
      general,
      flank_size,
      roll,
      randomize_roll,
      frontline: frontline,
      reserve,
      defeated,
      row_types,
      tactic
    }
  }
  let armies = initialState.armies
  if (state_raw.armies) {
    let armies_raw: Map<ArmyName, any> = fromJS(state_raw.armies)
    armies = armies_raw.filter(value => value).map(value => serializeParticipant(value.toJS()))
  }
  let attacker = state_raw.attacker
  if (!attacker || typeof attacker !== 'string')
    attacker = initialState.attacker
  let defender = state_raw.defender
  if (!defender || typeof defender !== 'string')
    defender = initialState.defender
  const round = state_raw.round === undefined ? initialState.round : state_raw.round
  const attacker_past = serializePast(state_raw.attacker_past, round)
  const defender_past = serializePast(state_raw.defender_past, round)
  const fight_over = state_raw.fight_over === undefined ? initialState.fight_over : state_raw.fight_over
  return { round, fight_over, armies, terrains, attacker, defender, attacker_past, defender_past }
}

export const transfromTransfer = (state_raw: any): typeof transferState => {
  if (!state_raw)
    return transferState
  const export_keys = state_raw.export_keys ? fromJS(state_raw.export_keys) : transferState.export_keys
  const reset_missing = state_raw.reset_missing || transferState.reset_missing
  return { reset_missing, export_keys }
}

const settings = Object.keys(CombatParameter).map(k => CombatParameter[k as any]) as CombatParameter[]

export const transformSettings = (state_raw: any): typeof settingsState => {
  if (!state_raw)
    return settingsState
  let combat = settingsState.combat
  if (state_raw.combat) {
    let combat_raw: Map<DefinitionType, OrderedMap<CombatParameter, number>> = fromJS(state_raw.combat)
    combat = combat.map((value, key) => combat_raw.has(key) ? value.merge(combat_raw.get(key)!).filter((_, key) => settings.includes(key)) : value)
  }
  const simple_mode = state_raw.simple_mode
  const mode = state_raw.mode || settingsState.mode
  return { combat, simple_mode, mode }
}
