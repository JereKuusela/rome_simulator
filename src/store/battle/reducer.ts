import { createReducer } from 'typesafe-actions'
import { battle, checkFight, initialState as initialStateBattle } from '../land_battle'
import { tacticsState } from '../tactics'
import { terrainState } from '../terrains'
import { globalStatsState, unitsState } from '../units'
import { transferState } from '../transfer'
import { battle as fight } from '../land_battle/combat'
import { merge_values } from '../../base_definition'

export const initialState = {
  tactics: tacticsState,
  terrains: terrainState,
  units: unitsState,
  global_stats: globalStatsState,
  land: initialStateBattle,
  transfer: transferState
}

export const battleReducer = createReducer(initialState)
.handleAction(battle, (state, action: ReturnType<typeof battle>) => {
  const definitions = state.units.definitions.map((value, key) => value.map(value => merge_values(value, state.global_stats.get(key)!)))
  let next = state.land
  for (let step = 0; step < action.payload.steps && !next.fight_over; ++step) {
    const old_rolls = [next.attacker.roll, next.defender.roll]
    if (next.day % 5 === 0) {
      next = {
        ...next,
        attacker: {
          ...next.attacker,
          roll: next.attacker.randomize_roll ? 1 + Math.round(Math.random() * 5) : next.attacker.roll
        },
        defender: {
          ...next.defender,
          roll: next.defender.randomize_roll ? 1 + Math.round(Math.random() * 5) : next.defender.roll
        }
      }
    }
    const attacker = { ...next.attacker, tactic: state.tactics.definitions.get(next.attacker.tactic) }
    const defender = { ...next.defender, tactic: state.tactics.definitions.get(next.defender.tactic) }
    let [army_a, army_d, reserve_a, reserve_d, defeated_a, defeated_d] = fight(definitions, attacker, defender, next.day + 1, next.terrains.map(type => state.terrains.definitions.get(type)!))
    const new_attacker = {
      ...next.attacker,
      army: army_a,
      reserve: reserve_a,
      defeated: defeated_a,
      past: next.attacker.past.push({ army: next.attacker.army, reserve: next.attacker.reserve, defeated: next.attacker.defeated, roll: old_rolls[0] })
    }
    const new_defender = {
      ...next.defender,
      army: army_d,
      reserve: reserve_d,
      defeated: defeated_d,
      past: next.defender.past.push({ army: next.defender.army, reserve: next.defender.reserve, defeated: next.defender.defeated, roll: old_rolls[1] })
    }
    next = {
      ...next,
      attacker: new_attacker,
      defender: new_defender,
      day: next.day + 1,
      fight_over: !checkFight(new_attacker, new_defender)
    }
  }
  return { ...state, land: next}
}
)
