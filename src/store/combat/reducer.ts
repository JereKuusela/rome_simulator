import { createReducer } from 'typesafe-actions'
import { Random, MersenneTwister19937, createEntropy } from 'random-js'
import { battle, checkFight, setSeed, refreshBattle } from '../battle'
import { battle as fight } from './combat'
import { mergeValues, DefinitionType } from '../../base_definition'
import { CombatParameter } from '../settings'
import { AppState } from '../'
import { mergeSettings, getBattle, getAttacker, getDefender } from '../utils'
import { sum } from '../../utils'
import { defaultCountry } from '../countries/reducer'

const doBattle = (state: AppState, mode: DefinitionType, steps: number): AppState => {
  const definitions = state.units.map((value, key) => value.map(value => mergeValues(value, state.global_stats.getIn([key, mode]))))
  let next = getBattle(state)
  const attacker_country = state.countries.get(next.attacker, defaultCountry)
  const defender_country = state.countries.get(next.defender, defaultCountry)
  let attacker = getAttacker(state)
  let defender = getDefender(state)
  const combat = mergeSettings(state)
  const minimum_roll = combat.get(CombatParameter.DiceMinimum) || 1
  const maximum_roll = combat.get(CombatParameter.DiceMaximum) || 6
  const roll_frequency = combat.get(CombatParameter.RollFrequency) || 5
  if (!next.seed)
    next = { ...next, seed: next.custom_seed || createEntropy()[0] }
  next = { ...next, fight_over: !checkFight(attacker, defender)}
  const rng = new Random(MersenneTwister19937.seed(next.seed))
  for (let step = 0; step < steps && !next.fight_over; ++step) {
    if (!attacker || !defender)
      continue
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
      general: attacker_country.has_general ? attacker_country.general_martial + sum(attacker_country.trait_martial) : 0
    }
    const defender_info = {
      ...defender,
      tactic: state.tactics.get(defender.tactic),
      country: next.defender,
      general: defender_country.has_general ? defender_country.general_martial + sum(defender_country.trait_martial) : 0
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
      attacker_rounds: next.attacker_rounds.push({ frontline: new_attacker.frontline, reserve: new_attacker.reserve, defeated: new_attacker.defeated, roll: new_attacker.roll }),
      defender_rounds: next.defender_rounds.push({ frontline: new_defender.frontline, reserve: new_defender.reserve, defeated: new_defender.defeated, roll: new_defender.roll }),
      round: next.round + 1,
      fight_over: !checkFight(new_attacker, new_defender)
    }
    attacker = new_attacker
    defender = new_defender
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
  .handleAction(refreshBattle, state => {
    const steps = getBattle(state).round + 1
    state = { ...state, battle: state.battle.update(state.settings.mode, value => ({ ...value, round: -1})) }
    return doBattle(state, state.settings.mode, steps)
  })
