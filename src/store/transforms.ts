import { tacticsReducer, TacticDefinitions } from './tactics'
import { terrainsReducer, TerrainDefinitions } from './terrains'
import { unitsReducer, globalStatsReducer, GlobalStats, Units } from './units'
import { battleReducer, Army, getDefaultArmy, Battle, modeState, getDefaultParticipant, Participant, ModeState, BaseReserve, BaseDefeated } from './battle'
import { DefinitionType, Mode } from '../base_definition'
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
  // Automatically heal up default values.
  return state
  //return tactics.map((tactic, type) => clearAllValues(tactic, type)).map((terrain, type) => mergeValues(terrain, defaultTactics.get(type)!))
}

export const transformTerrains = (state: TerrainDefinitions): TerrainDefinitions => {
  const initial = terrainsReducer(undefined, dummyAction)
  if (!state)
    return initial
  state = filter(state)
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
  //state = objMap(state, global => objMap(global, (unit, type) => clearAllValues(unit, type)))
  //const defaultGlobal = getDefaultGlobal()
  // Automatically heal up default values. TODO
  return state
  //return global_stats.map(values => values.map((value, type) => clearAllValues(value, type)).map((value, type) => mergeValues(value, defaultGlobal.get(type)!)))
}

const handleArmies = (state: Battle, mode: Mode): Battle => {
  const initial = modeState(mode)
  let terrains = initial.terrains
  if (state.terrains) {
    terrains = state.terrains
  }

  const serializeArmy = (army: Army): Army => {
    const initial = getDefaultArmy(mode)
    let frontline = initial.frontline
    if (army.frontline)
      frontline = army.frontline
    let reserve = initial.reserve
    if (army.reserve)
      reserve = army.reserve.filter(value => value) as BaseReserve
    let defeated = initial.defeated
    if (army.defeated)
      defeated = army.defeated.filter(value => value) as BaseDefeated
    let row_types = initial.row_types
    if (army.row_types)
      row_types = army.row_types
    let tactic = army.tactic
    if (!tactic)
      tactic = initial.tactic
    const flank_size = army.flank_size || initial.flank_size
    const selections = army.selections || initial.selections
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
  const serializeParticipant = (participant: Participant): Participant => {
    const initial = getDefaultParticipant(CountryName.Country1)
    const name = participant.name || initial.name
    const roll = participant.roll || initial.roll
    const randomize_roll = participant.randomize_roll
    let rolls = initial.rolls
    if (participant.rolls)
      rolls = participant.rolls.filter(value => value)
    return {
      name,
      roll,
      randomize_roll,
      rolls,
      rounds: initial.rounds
    }
  }
  let armies = initial.armies
  if (state.armies) {
    armies = state.armies
    armies = filter(armies)
    armies = map(armies, value => serializeArmy(value))
  }
  let participants = initial.participants
  if (state.participants) {
    participants = state.participants
    participants = filter(participants)
    participants = map(participants, value => serializeParticipant(value))
  }
  const round = state.round === undefined ? initial.round : state.round
  const fight_over = initial.fight_over
  const seed = state.seed || initial.seed
  const custom_seed = state.custom_seed || initial.custom_seed
  return { round, fight_over, armies, terrains, participants, seed, custom_seed, outdated: true }
}

export const stripRounds = (battle: ReturnType<typeof battleReducer>): any => {
  return map(battle, value => ({ ...value, participants: map(value.participants, value => ({ ...value, rounds: undefined })) }))
}

export const transformBattle = (state: ModeState): ModeState => {
  const initial = battleReducer(undefined, dummyAction)
  if (!state)
    return initial
  return map(state, (value, key) => handleArmies(value, key))
}

export const transfromTransfer = (state_raw: any): ReturnType<typeof transferReducer> => {
  const initial = transferReducer(undefined, dummyAction)
  if (!state_raw)
    return initial
  const export_keys = state_raw.export_keys || initial.export_keys
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
