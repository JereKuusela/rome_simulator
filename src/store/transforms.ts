import { fromJS, Map, List } from 'immutable'
import { tacticFromJS, tacticsReducer, TacticDefinitions } from './tactics'
import { terrainFromJS, terrainsReducer, TerrainDefinitions } from './terrains'
import { unitDefinitionFromJS, unitFromJS, UnitType, unitsReducer, globalStatsReducer, BaseUnit, GlobalStats, Units } from './units'
import { RowType, battleReducer, Army, getDefaultArmy, Battle, modeState, getDefaultParticipant, Participant, Side } from './battle'
import { DefinitionType } from '../base_definition'
import { transferReducer } from './transfer'
import { CountryName } from './countries'
import { settingsReducer } from './settings'
import { filter, map } from '../utils'

const dummyAction: any = {
  type: ''
}

export const transformTactics = (state: TacticDefinitions): TacticDefinitions => {
  const initial = tacticsReducer(undefined, dummyAction)
  if (!state)
    return initial
  state = filter(state)
  state = map(state, tactic => tacticFromJS(fromJS(tactic))!)
  // Automatically heal up default values.
  return state
  //return tactics.map((tactic, type) => clearAllValues(tactic, type)).map((terrain, type) => mergeValues(terrain, defaultTactics.get(type)!))
}

export const transformTerrains = (state: TerrainDefinitions): TerrainDefinitions => {
  const initial = terrainsReducer(undefined, dummyAction)
  if (!state)
    return initial
  state = filter(state)
  state = map(state, terrain => terrainFromJS(fromJS(terrain))!)
  //const defaultTerrains = getDefaultTerrains()
  // Automatically heal up default values.
  return state
  //return terrains.map((terrain, type) => clearAllValues(terrain, type)).map((terrain, type) => mergeValues(terrain, defaultTerrains.get(type)!))
}

export const transformUnits = (state: Units): Units => {
  const initial = unitsReducer(undefined, dummyAction)
  if (!state)
    return initial
  state = filter(state)
  state = map(state, definitions => filter(map(definitions, unit => unitDefinitionFromJS(fromJS(unit))!)))
  //state = objMap(state, definitions => objMap(definitions, (unit, type) => clearAllValues(unit, type)))
  //const defaultUnits = getDefaultUnits()
  // Automatically heal up default values. TODO
  return state
  //return units.map(units => units.map((unit, type) => clearAllValues(unit, type)).map((unit, type) => mergeValues(unit, defaultUnits.get(type)!)))
}

export const transformGlobalStats = (state: GlobalStats): GlobalStats => {
  const initial = globalStatsReducer(undefined, dummyAction)
  if (!state)
    return initial
  state = filter(state)
  state = map(state, global => filter(map(global, unit => unitDefinitionFromJS(fromJS(unit))!)))
  //state = objMap(state, global => objMap(global, (unit, type) => clearAllValues(unit, type)))
  //const defaultGlobal = getDefaultGlobal()
  // Automatically heal up default values. TODO
  return state
  //return global_stats.map(values => values.map((value, type) => clearAllValues(value, type)).map((value, type) => mergeValues(value, defaultGlobal.get(type)!)))
}

const handleArmies = (state_raw: any, mode: DefinitionType): Battle => {
  const initial = modeState(mode)
  let terrains = initial.terrains
  if (state_raw.terrains) {
    const terrains_raw = fromJS(state_raw.terrains)
    if (!terrains_raw.contains(null))
      terrains = terrains_raw
  }

  const serializeUnits = (raw: List<any>): List<BaseUnit | undefined> => raw.map(value => unitFromJS(value))

  const serializeArmy = (army: any): Army => {
    const initial = getDefaultArmy(mode)
    let frontline = initial.frontline
    if (army.frontline)
      frontline = serializeUnits(fromJS(army.frontline))
    let reserve = initial.reserve
    if (army.reserve)
      reserve = serializeUnits(fromJS(army.reserve)).filter(value => value) as List<BaseUnit>
    let defeated = initial.defeated
    if (army.defeated)
      defeated = serializeUnits(fromJS(army.defeated)).filter(value => value) as List<BaseUnit>
    let row_types: Map<RowType, UnitType | undefined>
    if (army.row_types)
      row_types = fromJS(army.row_types)
    else
      row_types = initial.row_types
    let tactic = army.tactic
    if (!tactic)
      tactic = initial.tactic
    const flank_size = army.flank_size || initial.flank_size
    const selections = army.selections ? fromJS(army.selections).toSet() : initial.selections
    return {
      flank_size,
      frontline,
      reserve,
      defeated,
      row_types,
      tactic,
      selections
    }
  }
  const serializeParticipant = (participant: any): Participant => {
    const initial = getDefaultParticipant(CountryName.Country1)
    const name = participant.name || initial.name
    const roll = participant.roll || initial.roll
    const randomize_roll = participant.randomize_roll
    let rolls = initial.rolls
    if (participant.rolls) {
      const rolls_raw: List<any> = fromJS(participant.rolls)
      rolls = rolls_raw.filter(value => value).map(value => value.toJS())
    }
    return {
      name,
      roll,
      randomize_roll,
      rolls,
      rounds: initial.rounds
    }
  }
  let armies = initial.armies
  if (state_raw.armies) {
    let armies_raw: Map<CountryName, any> = fromJS(state_raw.armies)
    armies = armies_raw.filter(value => value).map(value => serializeArmy(value.toJS()))
  }
  let participants = initial.participants
  if (state_raw.participants) {
    let participants_raw: Map<Side, any> = fromJS(state_raw.participants)
    participants = participants_raw.filter(value => value).map(value => serializeParticipant(value.toJS()))
  }
  const round = state_raw.round === undefined ? initial.round : state_raw.round
  const fight_over = initial.fight_over
  const seed = state_raw.seed || initial.seed
  const custom_seed = state_raw.custom_seed || initial.custom_seed
  return { round, fight_over, armies, terrains, participants, seed, custom_seed, outdated: true }
}

export const stripRounds = (battle: ReturnType<typeof battleReducer>): any => {
  return battle.map(value => ({ ...value, participants: value.participants.map(value => ({ ...value, rounds: undefined })) }))
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

// Still required to correct corrupted / missing data.
export const transformSettings = (state_raw: any): ReturnType<typeof settingsReducer> => {
  const initial = settingsReducer(undefined, dummyAction as any)
  if (!state_raw)
    return initial
  let combat = initial.combat
  if (state_raw.combat)
    combat = { [DefinitionType.Land]: { ...combat[DefinitionType.Land], ...state_raw.combat[DefinitionType.Land] }, [DefinitionType.Naval]: { ...combat[DefinitionType.Naval], ...state_raw.combat[DefinitionType.Naval] } }
  const simple_mode = state_raw.simple_mode
  const mode = state_raw.mode || initial.mode
  const country = state_raw.country || initial.country
  const accordions = state_raw.accordions || initial.accordions
  return { combat, simple_mode, mode, country, accordions }
}
