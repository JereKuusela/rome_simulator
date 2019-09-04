import { ImmerReducer, createActionCreators, createReducerFunction } from 'immer-reducer'
import { Random, MersenneTwister19937, createEntropy } from 'random-js'
import { checkFight, Side, Participant } from '../battle'
import { doBattle as fight } from './combat'
import { mergeValues, Mode } from '../../base_definition'
import { CombatParameter } from '../settings'
import { AppState } from '../'
import { getSettings, getBattle, getArmy, getParticipant } from '../utils'
import { objGet, sumObj, map } from '../../utils'
import { defaultCountry } from '../countries/reducer'

const doBattle = (state: AppState, mode: Mode, steps: number) => {
  const definitions = map(state.units, (definitions, country) => map(definitions, unit => mergeValues(unit, state.global_stats[country][mode])))
  let next = getBattle(state)
  // Whole logic really messed after so many refactorings
  let units_a = getArmy(state, Side.Attacker)
  let units_d = getArmy(state, Side.Defender)
  let participant_a = getParticipant(state, Side.Attacker)
  let participant_d = getParticipant(state, Side.Defender)
  const country_a = objGet(state.countries, units_a.name, defaultCountry)
  const country_d = objGet(state.countries, units_d.name, defaultCountry)
  const combat = getSettings(state)
  const minimum_roll = combat[CombatParameter.DiceMinimum]
  const maximum_roll = combat[CombatParameter.DiceMaximum]
  const roll_frequency = combat[CombatParameter.RollFrequency]
  if (!next.seed)
    next = { ...next, seed: next.custom_seed || createEntropy()[0] }
  next = { ...next, fight_over: !checkFight(next.participants, next.armies), outdated: false }
  const engine = MersenneTwister19937.seed(next.seed)
  engine.discard(2 * Math.ceil((next.round) / roll_frequency))
  const rng = new Random(engine)


  const rollDice = (participant: Participant): Participant => {
    if (next.round % roll_frequency !== 0 || !participant.randomize_roll)
      return participant
    return { ...participant, roll: rng.integer(minimum_roll, maximum_roll) }
  }
  const checkOldRoll = (participant: Participant): Participant => {
    const rolls = participant.rolls.get(next.round + 1, { randomized: participant.randomize_roll, roll: participant.roll })
    if (!rolls.randomized)
      return { ...participant, roll: rolls.roll }
    return participant
  }

  for (let step = 0; step < steps && !next.fight_over; ++step) {
    if (!units_a || !units_d)
      continue
    participant_a = rollDice(participant_a)
    participant_d = rollDice(participant_d)
    participant_a = checkOldRoll(participant_a)
    participant_d = checkOldRoll(participant_d)

    const attacker_info = {
      frontline: units_a.frontline,
      reserve: units_a.reserve,
      defeated: units_a.defeated,
      row_types: units_a.row_types,
      flank_size: units_a.flank_size,
      tactic: state.tactics[units_a.tactic],
      country: participant_a.name,
      general: country_a.has_general ? country_a.general_martial + sumObj(country_a.trait_martial) : 0,
      roll: participant_a.roll
    }
    const defender_info = {
      frontline: units_d.frontline,
      reserve: units_d.reserve,
      defeated: units_d.defeated,
      row_types: units_d.row_types,
      flank_size: units_d.flank_size,
      tactic: state.tactics[units_d.tactic],
      country: participant_d.name,
      general: country_d.has_general ? country_d.general_martial + sumObj(country_d.trait_martial) : 0,
      roll: participant_d.roll
    }
    const [a, d] = fight(definitions, attacker_info, defender_info, next.round + 1, next.terrains.map(type => state.terrains[type]), combat)
    participant_a = {
      ...participant_a,
      rounds: participant_a.rounds.push(a),
      rolls: participant_a.rolls.count() < next.round + 2 ? participant_a.rolls.push({ roll: participant_a.roll, randomized: participant_a.randomize_roll }) : participant_a.rolls
    }
    participant_d = {
      ...participant_d,
      rounds: participant_d.rounds.push(d),
      rolls: participant_d.rolls.count() < next.round + 2 ? participant_d.rolls.push({ roll: participant_d.roll, randomized: participant_d.randomize_roll }) : participant_d.rolls
    }
    next = {
      ...next,
      participants: next.participants.set(Side.Attacker, participant_a).set(Side.Defender, participant_d),
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

class CombatReducer extends ImmerReducer<AppState> {

  battle(mode: Mode, steps: number) {
    this.draftState = doBattle(this.state, mode, steps)
  }

  setSeed(mode: Mode, seed?: number) {
    this.draftState = { ...this.state, battle: this.state.battle.update(mode, battle => ({ ...battle, custom_seed: seed, seed: seed || 0 }))}
  }

  refreshBattle(mode: Mode) {
    const steps = this.state.battle.get(mode)!.round + 1
    const next = { ...this.state, battle: this.state.battle.update(mode, value => ({ ...value, round: -1, participants: value.participants.map(value => ({ ...value, rounds: value.rounds.clear() })) })) }
    this.draftState = doBattle(next, mode, steps)

  }
}

const actions = createActionCreators(CombatReducer)

export const battle = actions.battle
export const setSeed = actions.setSeed
export const refreshBattle = actions.refreshBattle

export const combatReducer = createReducerFunction(CombatReducer, {} as any)
