import { createReducer } from 'typesafe-actions'
import { battle, checkFight, initialState as initialStateBattle } from '../land_battle'
import { tacticsState } from '../tactics'
import { terrainState } from '../terrains'
import { globalStatsState, unitsState } from '../units'
import { transferState } from '../transfer'
import { battle as fight } from './combat'
import { mergeValues } from '../../base_definition'
import { settingsState, CombatParameter } from '../settings'

export const initialState = {
  tactics: tacticsState,
  terrains: terrainState,
  units: unitsState,
  global_stats: globalStatsState,
  land: initialStateBattle,
  transfer: transferState,
  settings: settingsState
}

export const battleReducer = createReducer(initialState)
  .handleAction(battle, (state, action: ReturnType<typeof battle>) => {
    const definitions = state.units.definitions.map((value, key) => value.map(value => mergeValues(value, state.global_stats.get(key)!)))
    let next = state.land
    let attacker = next.armies.get(next.attacker)
    let defender = next.armies.get(next.defender)
    const minimum_roll = state.settings.combat.get(CombatParameter.DiceMinimum) || 1
    const maximum_roll = state.settings.combat.get(CombatParameter.DiceMaximum) || 6
    const roll_frequency = state.settings.combat.get(CombatParameter.RollFrequency) || 5
    for (let step = 0; step < action.payload.steps && !next.fight_over; ++step) {
      if (!attacker || !defender)
        continue
      const old_rolls = [attacker.roll, defender.roll]
      if (next.round % roll_frequency === 0) {
        attacker = {
          ...attacker,
          roll: attacker.randomize_roll ? minimum_roll + Math.round(Math.random() * (maximum_roll - minimum_roll)) : attacker.roll
        }
        defender = {
          ...defender,
          roll: defender.randomize_roll ? minimum_roll + Math.round(Math.random() * (maximum_roll - minimum_roll)) : defender.roll
        }
      }
      const attacker_info = { ...attacker, tactic: state.tactics.definitions.get(attacker.tactic) }
      const defender_info = { ...defender, tactic: state.tactics.definitions.get(defender.tactic) }
      const [a, d] = fight(definitions, attacker_info, defender_info, next.round + 1, next.terrains.map(type => state.terrains.definitions.get(type)!), state.settings.combat)
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
        attacker_past: next.attacker_past.push({ army: attacker.army, reserve: attacker.reserve, defeated: attacker.defeated, roll: old_rolls[0] }),
        defender_past: next.defender_past.push({ army: defender.army, reserve: defender.reserve, defeated: defender.defeated, roll: old_rolls[1] }),
        round: next.round + 1,
        fight_over: !checkFight(new_attacker, new_defender)
      }
      attacker = next.armies.get(next.attacker)
      defender = next.armies.get(next.defender)
    }
    return { ...state, land: next }
  }
  )
