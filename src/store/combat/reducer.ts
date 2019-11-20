import { ImmerReducer, createActionCreators, createReducerFunction } from 'immer-reducer'
import { Random, MersenneTwister19937, createEntropy } from 'random-js'
import { Side, Participant, Battle } from '../battle'
import { Mode } from '../../base_definition'
import { CombatParameter, CombatSettings } from '../settings'
import { AppState } from '../'
import { getArmyForCombat, mergeUnitTypes, getCurrentCombat } from '../utils'
import { arrGet } from '../../utils'
import { doConversion, checkAlive } from '../../combat/simulation'
import { deploy } from '../../combat/deployment'
import { doBattleFast, CombatUnits } from '../../combat/combat_fast'

const copyStatus = (status: CombatUnits): CombatUnits => ({
  frontline: status.frontline.map(value => value ? { ...value, state: { ...value.state } } : null),
  reserve: status.reserve.map(value => ({ ...value, state: { ...value.state } })),
  defeated: status.defeated.map(value => ({ ...value, state: { ...value.state } }))
})

class CombatReducer extends ImmerReducer<AppState> {

  private doBattle = (mode: Mode, battle: Battle, settings: CombatSettings, steps: number) => {
    const army_a = getArmyForCombat(this.state, Side.Attacker, mode)
    const army_d = getArmyForCombat(this.state, Side.Defender, mode)
    const terrains = battle.terrains.map(value => this.state.terrains[value])
    const [attacker, defender] = doConversion(army_a, army_d, terrains, mergeUnitTypes(this.state, mode), settings)

    const participant_a = battle.participants[Side.Attacker]
    const participant_d = battle.participants[Side.Defender]

    battle.outdated = false

    const minimum_roll = settings[CombatParameter.DiceMinimum]
    const maximum_roll = settings[CombatParameter.DiceMaximum]
    const roll_frequency = settings[CombatParameter.RollFrequency]
    if (!battle.seed)
      battle.seed = battle.custom_seed ?? createEntropy()[0]
    const engine = MersenneTwister19937.seed(battle.seed)
    engine.discard(2 * Math.ceil((battle.round) / roll_frequency))
    const rng = new Random(engine)


    const rollDice = (participant: Participant) => {
      if (battle.round % roll_frequency !== 0 || !participant.randomize_roll)
        return
      participant.roll = rng.integer(minimum_roll, maximum_roll)
    }

    const updateRoll = (participant: Participant) => {
      if (participant.rolls.length < battle.round + 2)
        participant.rolls.push({ roll: participant.roll, randomized: participant.randomize_roll })
    }

    const checkOldRoll = (participant: Participant) => {
      const rolls = arrGet(participant.rolls, battle.round + 1, { randomized: participant.randomize_roll, roll: participant.roll })
      if (!rolls.randomized)
        participant.roll = rolls.roll
    }

    if (battle.round === -1) {
      Object.freeze(attacker.army)
      Object.freeze(defender.army)
      battle.participants[Side.Attacker].rounds = [attacker.army]
      battle.participants[Side.Defender].rounds = [defender.army]
      attacker.army = copyStatus(attacker.army)
      defender.army = copyStatus(defender.army)
    } else {

      attacker.army = copyStatus(getCurrentCombat(this.state, Side.Attacker))
      defender.army = copyStatus(getCurrentCombat(this.state, Side.Defender))

    }
    if (battle.round === -1 && steps > 0) {
      deploy(attacker.army, defender.army, attacker.flank, defender.flank, attacker.row_types, defender.row_types, settings)
      Object.freeze(attacker.army)
      Object.freeze(defender.army)
      battle.participants[Side.Attacker].rounds.push(attacker.army)
      battle.participants[Side.Defender].rounds.push(defender.army)
      battle.round++
      steps--
    }

    for (let step = 0; step < steps && !battle.fight_over; ++step) {
      attacker.army = copyStatus(attacker.army)
      defender.army = copyStatus(defender.army)
      rollDice(participant_a)
      rollDice(participant_d)
      checkOldRoll(participant_a)
      checkOldRoll(participant_d)
      attacker.roll = participant_a.roll
      defender.roll = participant_d.roll

      doBattleFast(attacker, defender, settings)
      Object.freeze(attacker.army)
      Object.freeze(defender.army)
      battle.participants[Side.Attacker].rounds.push(attacker.army)
      battle.participants[Side.Defender].rounds.push(defender.army)
      updateRoll(participant_a)
      updateRoll(participant_d)
      battle.round++
      battle.fight_over = !checkAlive(attacker.army.frontline, attacker.army.reserve) || !checkAlive(defender.army.frontline, defender.army.reserve)
    }
  }

  battle(mode: Mode, steps: number) {
    const battle = this.draftState.battle[mode]
    const settings = this.state.settings.combat[mode]
    this.doBattle(mode, battle, settings, steps)
  }

  setSeed(mode: Mode, seed?: number) {
    const battle = this.draftState.battle[mode]
    battle.custom_seed = seed
    battle.seed = seed ?? 0
  }

  refreshBattle(mode: Mode) {
    const battle = this.draftState.battle[mode]
    const settings = this.state.settings.combat[mode]
    const steps = battle.round + 1
    battle.round = -1
    battle.fight_over = false
    this.doBattle(mode, battle, settings, steps)
  }
}

const actions = createActionCreators(CombatReducer)

export const battle = actions.battle
export const setSeed = actions.setSeed
export const refreshBattle = actions.refreshBattle

export const combatReducer = createReducerFunction(CombatReducer, {} as any)
