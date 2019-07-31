import { createReducer } from 'typesafe-actions'
import { Random, MersenneTwister19937, createEntropy } from 'random-js'
import { battle, checkFight, setSeed, refreshBattle, ParticipantType } from '../battle'
import { battle as fight } from './combat'
import { mergeValues, DefinitionType } from '../../base_definition'
import { CombatParameter } from '../settings'
import { AppState } from '../'
import { mergeSettings, getBattle, getArmy, getParticipant } from '../utils'
import { sum } from '../../utils'
import { defaultCountry } from '../countries/reducer'

const doBattle = (state: AppState, mode: DefinitionType, steps: number): AppState => {
  const definitions = state.units.map((value, key) => value.map(value => mergeValues(value, state.global_stats.getIn([key, mode]))))
  let next = getBattle(state)
  // Whole logic really messed after so many refactorings
  let units_a = getArmy(state, ParticipantType.Attacker)
  let units_d = getArmy(state, ParticipantType.Defender)
  let participant_a = getParticipant(state, ParticipantType.Attacker)
  let participant_d = getParticipant(state, ParticipantType.Defender)
  const country_a = state.countries.get(units_a.name, defaultCountry)
  const country_d = state.countries.get(units_d.name, defaultCountry)
  const combat = mergeSettings(state)
  const minimum_roll = combat.get(CombatParameter.DiceMinimum) || 1
  const maximum_roll = combat.get(CombatParameter.DiceMaximum) || 6
  const roll_frequency = combat.get(CombatParameter.RollFrequency) || 5
  if (!next.seed)
    next = { ...next, seed: next.custom_seed || createEntropy()[0] }
  next = { ...next, fight_over: !checkFight(next.participants, next.armies), outdated: false}
  const engine = MersenneTwister19937.seed(next.seed)
  engine.discard(2 * Math.ceil((next.round) / roll_frequency))
  const rng = new Random(engine)
  for (let step = 0; step < steps && !next.fight_over; ++step) {
    if (!units_a || !units_d)
      continue
    if (next.round % roll_frequency === 0) {
      participant_a = {
        ...participant_a,
        roll: participant_a.randomize_roll ? rng.integer(minimum_roll, maximum_roll) : participant_a.roll
      }
      participant_d = {
        ...participant_d,
        roll: participant_d.randomize_roll ? rng.integer(minimum_roll, maximum_roll) : participant_d.roll
      }
    }
    const attacker_info = {
      frontline: units_a.frontline,
      reserve: units_a.reserve,
      defeated: units_a.defeated,
      row_types: units_a.row_types,
      flank_size: units_a.flank_size,
      tactic: state.tactics.get(units_a.tactic),
      country: participant_a.name,
      general: country_a.has_general ? country_a.general_martial + sum(country_a.trait_martial) : 0,
      roll: participant_a.roll
    }
    const defender_info = {
      frontline: units_d.frontline,
      reserve: units_d.reserve,
      defeated: units_d.defeated,
      row_types: units_d.row_types,
      flank_size: units_d.flank_size,
      tactic: state.tactics.get(units_d.tactic),
      country: participant_d.name,
      general: country_d.has_general ? country_d.general_martial + sum(country_d.trait_martial) : 0,
      roll: participant_d.roll
    }
    const [a, d] = fight(definitions, attacker_info, defender_info, next.round + 1, next.terrains.map(type => state.terrains.get(type)!), combat)
    participant_a = {
      ...participant_a,
      rounds: participant_a.rounds.push(a)
    }
    participant_d = {
      ...participant_d,
      rounds: participant_d.rounds.push(d)
    }
    next = {
      ...next,
      participants: next.participants.set(ParticipantType.Attacker, participant_a).set(ParticipantType.Defender, participant_d),
      round: next.round + 1
    }
    next = {
      ...next,
      fight_over: !checkFight(next.participants, next.armies)
    }
    units_a = { ...units_a, ...a }
    units_d = { ...units_d, ...d }
  }
  return { ...state, battle: state.battle.set(state.settings.mode, next) }
}


export const combatReducer = createReducer<AppState>({} as any)
  .handleAction(battle, (state, action: ReturnType<typeof battle>) => (
    doBattle(state, action.payload.mode, action.payload.steps)
  ))
  .handleAction(setSeed, (state, action: ReturnType<typeof setSeed>) => (
    {
      ...state,
      battle: state.battle.update(state.settings.mode, battle => ({ ...battle, custom_seed: action.payload.seed, seed: action.payload.seed || 0 }))
    }
  ))
  .handleAction(refreshBattle, (state, action: ReturnType<typeof refreshBattle>) => {
    const steps = state.battle.get(action.payload.mode)!.round + 1
    state = { ...state, battle: state.battle.update(action.payload.mode, value => ({ ...value, round: -1, participants: value.participants.map(value => ({ ...value, rounds: value.rounds.clear()}))})) }
    return doBattle(state, action.payload.mode, steps)
  })
