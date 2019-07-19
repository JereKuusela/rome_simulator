import { fromJS, Map, List, OrderedMap } from 'immutable'
import { tacticFromJS, TacticType, tacticsReducer } from './tactics'
import { terrainFromJS, TerrainType, terrainsReducer } from './terrains'
import { unitDefinitionFromJS, unitFromJS, UnitType, unitsReducer, globalStatsReducer, Unit } from './units'
import { RowType, battleReducer, PastState, Participant, getDefaultArmy, Armies, modeState } from './battle'
import { DefinitionType } from '../base_definition'
import { transferReducer } from './transfer'
import { selectionsReducer, CountryName, Country } from './countries'
import { CombatParameter, settingsReducer } from './settings'
import { orderedMapFromJS } from '../utils'

const dummyAction = {
  type: ''
}

export const transformTactics = (state_raw: any): ReturnType<typeof tacticsReducer> => {
  const initial = tacticsReducer(undefined, dummyAction)
  if (!state_raw)
    return initial
  const raw: OrderedMap<TacticType, any> = orderedMapFromJS(state_raw)
  return raw.map(value => tacticFromJS(value)!).filter(value => value)
}

export const transformTerrains = (state_raw: any): ReturnType<typeof terrainsReducer> => {
  const initial = terrainsReducer(undefined, dummyAction)
  if (!state_raw)
    return initial
  const raw: OrderedMap<TerrainType, any> = orderedMapFromJS(state_raw)
  return raw.map(value => terrainFromJS(value)!).filter(value => value)
}

export const transformUnits = (state_raw: any): ReturnType<typeof unitsReducer> => {
  const initial = unitsReducer(undefined, dummyAction)
  if (!state_raw)
    return initial
  let raw: Map<CountryName, OrderedMap<UnitType, any>> = orderedMapFromJS(state_raw).toMap()
  return raw.filter(value => value).map(value => value.map(value => unitDefinitionFromJS(value)!).filter(value => value))
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
    const initial = getDefaultArmy(mode)
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
    const flank_size = participant.flank_size || initial.flank_size
    const roll = participant.roll || initial.roll
    const randomize_roll = participant.randomize_roll
    const selections = participant.selections ? fromJS(participant.selections).toSet() : initial.selections
    return {
      flank_size,
      roll,
      randomize_roll,
      frontline,
      reserve,
      defeated,
      row_types,
      tactic,
      selections
    }
  }
  let armies = initial.armies
  if (state_raw.armies) {
    let armies_raw: Map<CountryName, any> = fromJS(state_raw.armies)
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
  const initial = transferReducer(undefined, dummyAction)
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
  const countries_raw: Map<CountryName, any> = fromJS(state_raw)
  const countries: Map<CountryName, Country> = countries_raw.map(value => value.toJS())
  return countries.map(value => ({ ...value, selections: fromJS(value.selections).toSet(), trait_martial: fromJS(value.trait_martial) }))
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
  const accordions = state_raw.accordions ? fromJS(state_raw.accordions).toSet() : initial.accordions
  return { combat, simple_mode, mode, country, accordions }
}
