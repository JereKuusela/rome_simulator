import { createReducer } from 'typesafe-actions'
import { Random, MersenneTwister19937, createEntropy } from 'random-js'
import { battle, checkFight, setSeed } from '../battle'
import { battle as fight } from './combat'
import { mergeValues } from '../../base_definition'
import { CombatParameter } from '../settings'
import { AppState } from '../'
import { mergeSettings, getBattle } from '../utils'
import { sum } from '../../utils'
import { defaultCountry } from '../countries/reducer'

export const combatReducer = createReducer<AppState>({} as any)
  .handleAction(battle, (state, action: ReturnType<typeof battle>) => {
    const definitions = state.units.map((value, key) => value.map(value => mergeValues(value, state.global_stats.getIn([key, action.payload.mode]))))
    let next = getBattle(state)
    const attacker_country = state.countries.get(next.attacker, defaultCountry)
    const defender_country = state.countries.get(next.defender, defaultCountry)
    let attacker = next.armies.get(next.attacker)
    let defender = next.armies.get(next.defender)
    const combat = mergeSettings(state)
    const minimum_roll = combat.get(CombatParameter.DiceMinimum) || 1
    const maximum_roll = combat.get(CombatParameter.DiceMaximum) || 6
    const roll_frequency = combat.get(CombatParameter.RollFrequency) || 5
    if (!next.seed)
      next = { ...next, seed: next.custom_seed || createEntropy()[0] }
    const rng = new Random(MersenneTwister19937.seed(next.seed))
    for (let step = 0; step < action.payload.steps && !next.fight_over; ++step) {
      if (!attacker || !defender)
        continue
      const old_rolls = [attacker.roll, defender.roll]
      if (next.round % roll_frequency === 0) {
        attacker = {
          ...attacker,
          roll: attacker.randomize_roll ? rng.integer(minimum_roll, maximum_roll) : attacker.roll
        }
        defender = {
          ...defender,
          roll: defender.randomize_roll ? rng.integer(minimum_roll, maximum_roll) : defender.roll
        }
      }
      const attacker_info = {
        ...attacker,
        tactic: state.tactics.get(attacker.tactic),
        country: next.attacker,
        general: attacker_country.has_general ? attacker_country.general_martial  + sum(attacker_country.trait_martial) : 0
      }
      const defender_info = {
        ...defender,
        tactic: state.tactics.get(defender.tactic),
        country: next.defender,
        general: defender_country.has_general ? defender_country.general_martial  + sum(defender_country.trait_martial) : 0
      }
      const [a, d] = fight(definitions, attacker_info, defender_info, next.round + 1, next.terrains.map(type => state.terrains.get(type)!), combat)
      const new_attacker = {
        ...attacker,
        ...a
      }
      const new_defender = {
        ...defender,
        ...d
      }
      next = {
        ...next,
        armies: next.armies.set(next.attacker, new_attacker).set(next.defender, new_defender),
        attacker_past: next.attacker_past.push({ frontline: attacker.frontline, reserve: attacker.reserve, defeated: attacker.defeated, roll: old_rolls[0] }),
        defender_past: next.defender_past.push({ frontline: defender.frontline, reserve: defender.reserve, defeated: defender.defeated, roll: old_rolls[1] }),
        round: next.round + 1,
        fight_over: !checkFight(new_attacker, new_defender)
      }
      attacker = next.armies.get(next.attacker)
      defender = next.armies.get(next.defender)
    }
    return { ...state, battle: state.battle.set(state.settings.mode, next) }
  })
  .handleAction(setSeed, (state, action: ReturnType<typeof setSeed>) => (
    {
      ...state,
      battle: state.battle.update(state.settings.mode, battle => ({ ...battle, custom_seed: action.payload.seed, seed: action.payload.seed || 0 }))
    }
  ))
