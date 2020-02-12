import { AppState, getMode, getArmyForCombat, mergeUnitTypes, getCurrentCombat, getSettings } from 'state'
import { CombatUnits, Frontline, Reserve, doConversion, deploy, doBattleFast, removeDefeated } from 'combat'
import { Mode, Battle, Side, Setting, Participant, Settings, CombatPhase } from 'types'
import { createEntropy, MersenneTwister19937, Random } from 'random-js'
import { arrGet } from 'utils'

const copyStatus = (status: CombatUnits): CombatUnits => ({
  frontline: status.frontline.map(row => row.map(value => value ? { ...value, state: { ...value.state } } : null)),
  reserve: status.reserve.map(value => ({ ...value, state: { ...value.state } })),
  defeated: status.defeated.map(value => ({ ...value, state: { ...value.state } })),
  tactic_bonus: status.tactic_bonus,
  phase: status.phase
})

const checkAlive = (frontline: Frontline, reserve: Reserve) => reserve.length || frontline.some(row => row.some(value => value && !value.state.is_defeated))

const doBattle = (state: AppState, mode: Mode, battle: Battle, settings: Settings, steps: number) => {
  const army_a = getArmyForCombat(state, Side.Attacker, mode)
  const army_d = getArmyForCombat(state, Side.Defender, mode)
  const terrains = battle.terrains.map(value => state.terrains[value])
  const [attacker, defender] = doConversion(army_a, army_d, terrains, mergeUnitTypes(state, mode), settings)

  const participant_a = battle.participants[Side.Attacker]
  const participant_d = battle.participants[Side.Defender]

  battle.outdated = false

  const minimum_roll = settings[Setting.DiceMinimum]
  const maximum_roll = settings[Setting.DiceMaximum]
  const roll_frequency = settings[Setting.RollFrequency]
  // Regenerate seed for the first roll (undo resets it when going back to deployment).
  if (battle.round + steps > 0 && !battle.seed)
    battle.seed = battle.custom_seed ?? Math.abs(createEntropy(undefined, 1)[0])
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
    battle.fight_over = !checkAlive(attacker.army.frontline, attacker.army.reserve) || !checkAlive(defender.army.frontline, defender.army.reserve)
  } else {
    attacker.army = copyStatus(getCurrentCombat(state, Side.Attacker))
    defender.army = copyStatus(getCurrentCombat(state, Side.Defender))
  }
  if (battle.round === -1 && steps > 0 && !battle.fight_over) {
    deploy(attacker, defender, settings)
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

    doBattleFast(attacker, defender, true, settings, battle.round)

    battle.fight_over = !checkAlive(attacker.army.frontline, attacker.army.reserve) || !checkAlive(defender.army.frontline, defender.army.reserve)
    if (battle.fight_over) {
      removeDefeated(attacker.army.frontline)
      removeDefeated(defender.army.frontline)
    }

    Object.freeze(attacker.army)
    Object.freeze(defender.army)
    battle.participants[Side.Attacker].rounds.push(attacker.army)
    battle.participants[Side.Defender].rounds.push(defender.army)
    updateRoll(participant_a)
    updateRoll(participant_d)
    battle.round++
  }
}

export const getCombatPhase = (round: number, settings: Settings) => {
  if (settings[Setting.FireAndShock]) {
    const phase = Math.floor(round / settings[Setting.RollFrequency])
    return phase % 2 ? CombatPhase.Shock : CombatPhase.Fire
  }
  return CombatPhase.Default
}

export const battle = (pair: [AppState, AppState], steps: number) => {
  const [state, draft] = pair
  const mode = getMode(state)
  const battle = draft.battle[mode]
  const settings = getSettings(state, mode)
  doBattle(state, mode, battle, settings, steps)
}

export const refreshBattle = (pair: [AppState, AppState]) => {
  const [state, draft] = pair
  const mode = getMode(state)
  const battle = draft.battle[mode]
  const settings = getSettings(state, mode)
  const steps = battle.round + 1
  battle.round = -1
  battle.fight_over = false
  doBattle(state, mode, battle, settings, steps)
}