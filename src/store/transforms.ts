import { fromJS, Map, List, OrderedSet, OrderedMap } from 'immutable'
import { tacticFromJS, TacticType, tacticsReducer } from './tactics'
import { terrainFromJS, TerrainType, terrainsReducer } from './terrains'
import { unitDefinitionFromJS, unitFromJS, UnitType, unitsReducer, globalStatsReducer, Unit } from './units'
import { RowType, battleReducer, PastState, Participant, getInitialArmy, Armies, modeState, ArmyName } from './battle'
import { DefinitionType } from '../base_definition'
import { transferReducer } from './transfer'
import { selectionsReducer, CountryName, Selections } from './countries'
import { CombatParameter, settingsReducer } from './settings'

const dummyAction = {
  type: ''
}


const readTypes = <T>(types_raw: any, initial: OrderedSet<T>): OrderedSet<T> => {
  let types = initial
  if (types_raw)
    types = fromJS(types_raw).toOrderedSet()
  if (types.size === 0)
    types = initial
  return types
}

export const transformTactics = (state_raw: any): ReturnType<typeof tacticsReducer> => {
  const initial = tacticsReducer(undefined, dummyAction)
  if (!state_raw)
    return initial
  let definitions = initial.definitions
  if (state_raw.definitions) {
    let definitions_raw: Map<TacticType, any> = fromJS(state_raw.definitions)
    definitions = definitions_raw.map(value => tacticFromJS(value)!).filter(value => value)
  }
  const types = readTypes(state_raw.types, initial.types)
  return { definitions, types }
}

export const transformTerrains = (state_raw: any): ReturnType<typeof terrainsReducer> => {
  const initial = terrainsReducer(undefined, dummyAction)
  if (!state_raw)
    return initial
  let definitions = initial.definitions
  if (state_raw.definitions) {
    let definitions_raw: Map<TerrainType, any> = fromJS(state_raw.definitions)
    definitions = definitions_raw.map(value => terrainFromJS(value)!).filter(value => value)
  }
  const types = readTypes(state_raw.types, initial.types)
  return { definitions, types }
}

export const transformUnits = (state_raw: any): ReturnType<typeof unitsReducer> => {
  const initial = unitsReducer(undefined, dummyAction)
  if (!state_raw)
    return initial
  let definitions = initial.definitions
  if (state_raw.definitions) {
    let definitions_raw: Map<CountryName, Map<UnitType, any>> = fromJS(state_raw.definitions)
    definitions = definitions_raw.filter(value => value).map(value => value.map(value => unitDefinitionFromJS(value)!).filter(value => value))
  }
  let types = initial.types
  if (state_raw.types)
    types = fromJS(state_raw.types)
  if (types.size === 0)
    types = initial.types
  types = types.map(value => readTypes(value, initial.types.get(CountryName.Country1)!))
  return { definitions, types }
}

export const transformGlobalStats = (state_raw: any): ReturnType<typeof globalStatsReducer> => {
  const initial = globalStatsReducer(undefined, dummyAction)
  if (!state_raw)
    return initial
  let global_stats_raw: Map<CountryName, Map<DefinitionType, any>> = fromJS(state_raw)
  let global_stats = global_stats_raw.filter(value => value).map(value => value.map(value => unitDefinitionFromJS(value)!).filter(value => value))
  return global_stats
}

const handleArmies = (state_raw: any, mode: DefinitionType): Armies => {
  const initial = modeState(mode)
  let terrains = initial.terrains
  if (state_raw.terrains) {
    const terrains_raw = fromJS(state_raw.terrains)
    if (!terrains_raw.contains(null))
      terrains = terrains_raw
  }

  const serializeUnits = (raw: List<any>): List<Unit | undefined> => raw.map(value => unitFromJS(value))

  const serializePast = (past_raw: any, round: number): List<PastState> => {
    let past = List<PastState>()
    if (past_raw) {
      let past4: List<Map<string, any>> = fromJS(past_raw)
      let past3 = past4.map(value => ({
        frontline: value.get('frontline') as List<any>,
        reserve: value.get('reserve') as List<any>,
        defeated: value.get('defeated') as List<any>,
        roll: value.has('roll') ? value.get('roll') as number : 0
      }))
      past = past3.map(value => ({ frontline: serializeUnits(value.frontline), reserve: serializeUnits(value.reserve).filter(value => value), defeated: serializeUnits(value.defeated).filter(value => value), roll: value.roll } as PastState))
    }
    // Prevent history and index (round number) getting out of sync.
    return past.setSize(round + 1)
  }

  const serializeParticipant = (participant: any): Participant => {
    const initial = getInitialArmy(mode, CountryName.Country1)
    let frontline = initial.frontline
    if (participant.frontline)
      frontline = serializeUnits(fromJS(participant.frontline))
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
    if (!tactic)
      tactic = initial.tactic
    const general = participant.general || initial.general
    const flank_size = participant.flank_size || initial.flank_size
    const roll = participant.roll || initial.roll
    const randomize_roll = participant.randomize_roll
    const country = participant.country || initial.country
    const selections = participant.selections ? fromJS(participant.selections).toSet() : initial.selections
    return {
      general,
      flank_size,
      roll,
      randomize_roll,
      frontline,
      reserve,
      defeated,
      row_types,
      tactic,
      country,
      selections
    }
  }
  let armies = initial.armies
  if (state_raw.armies) {
    let armies_raw: Map<ArmyName, any> = fromJS(state_raw.armies)
    armies = armies_raw.filter(value => value).map(value => serializeParticipant(value.toJS()))
  }
  let attacker = state_raw.attacker
  if (!attacker || typeof attacker !== 'string')
    attacker = initial.attacker
  let defender = state_raw.defender
  if (!defender || typeof defender !== 'string')
    defender = initial.defender
  const round = state_raw.round === undefined ? initial.round : state_raw.round
  const attacker_past = serializePast(state_raw.attacker_past, round)
  const defender_past = serializePast(state_raw.defender_past, round)
  const fight_over = state_raw.fight_over === undefined ? initial.fight_over : state_raw.fight_over
  return { round, fight_over, armies, terrains, attacker, defender, attacker_past, defender_past }
}

export const transformBattle = (state_raw: any): ReturnType<typeof battleReducer> => {
  const initial = battleReducer(undefined, dummyAction)
  if (!state_raw)
    return initial
  let battle: Map<DefinitionType, any> = fromJS(state_raw) 
  return battle.map((value, key) => handleArmies(value.toJS(), key))
}

export const transfromTransfer = (state_raw: any): ReturnType<typeof transferReducer> => {
  const initial = transferReducer(undefined, undefined)
  if (!state_raw)
    return initial
  const export_keys = state_raw.export_keys ? fromJS(state_raw.export_keys) : initial.export_keys
  const reset_missing = state_raw.reset_missing || initial.reset_missing
  return { reset_missing, export_keys }
}

export const transformCountries = (state_raw: any): ReturnType<typeof selectionsReducer> => {
  const initial = selectionsReducer(undefined, dummyAction)
  if (!state_raw)
    return initial
  const countries: Map<CountryName, Selections> = fromJS(state_raw)
  return countries.map(value => ({ ...value, selections: value.selections.toSet()}))
}

const settings = Object.keys(CombatParameter).map(k => CombatParameter[k as any]) as CombatParameter[]

export const transformSettings = (state_raw: any): ReturnType<typeof settingsReducer> => {
  const initial = settingsReducer(undefined, dummyAction)
  if (!state_raw)
    return initial
  let combat = initial.combat
  if (state_raw.combat) {
    let combat_raw: Map<DefinitionType, OrderedMap<CombatParameter, number>> = fromJS(state_raw.combat)
    combat = combat.map((value, key) => combat_raw.has(key) ? value.merge(combat_raw.get(key)!).filter((_, key) => settings.includes(key)) : value)
  }
  const simple_mode = state_raw.simple_mode
  const mode = state_raw.mode || initial.mode
  const country = state_raw.country || initial.country
  const army = state_raw.army || initial.army
  return { combat, simple_mode, mode, country, army }
}
