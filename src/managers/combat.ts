import { AppState, getMode, getArmyForCombat, mergeUnitTypes, getCurrentCombat, getSettings } from 'state'
import { CombatCohorts, Frontline, Reserve, deploy, doBattleFast, removeDefeated, getBaseDamages, CombatParticipant, convertParticipant } from 'combat'
import { Mode, Battle, Side, Setting, Participant, Settings } from 'types'
import { createEntropy, MersenneTwister19937, Random } from 'random-js'
import { arrGet } from 'utils'

const copyStatus = (status: CombatCohorts): CombatCohorts => ({
  frontline: status.frontline.map(row => row.map(value => value ? { ...value, state: { ...value.state } } : null)),
  reserve: status.reserve.map(value => ({ ...value, state: { ...value.state } })),
  defeated: status.defeated.map(value => ({ ...value, state: { ...value.state } }))
})

const copy = (participant: CombatParticipant): CombatParticipant => ({ ...participant, cohorts: copyStatus(participant.cohorts) })

const checkAlive = (frontline: Frontline, reserve: Reserve) => reserve.length || frontline.some(row => row.some(value => value && !value.state.is_defeated))

const doBattle = (state: AppState, mode: Mode, battle: Battle, settings: Settings, steps: number) => {
  const army_a = getArmyForCombat(state, Side.Attacker, mode)
  const army_d = getArmyForCombat(state, Side.Defender, mode)
  const terrains = battle.terrains.map(value => state.terrains[value])
  let attacker = convertParticipant(Side.Attacker, army_a, army_d, terrains, mergeUnitTypes(state, mode), settings)
  let defender = convertParticipant(Side.Defender, army_d, army_a, terrains, mergeUnitTypes(state, mode), settings)

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
    participant.dice = rng.integer(minimum_roll, maximum_roll)
  }

  const updateRoll = (participant: Participant) => {
    if (participant.rolls.length < battle.round + 2)
      participant.rolls.push({ dice: participant.dice, randomized: participant.randomize_roll })
  }

  const checkOldRoll = (participant: Participant) => {
    const rolls = arrGet(participant.rolls, battle.round + 1, { randomized: participant.randomize_roll, dice: participant.dice })
    if (!rolls.randomized)
      participant.dice = rolls.dice
  }

  if (battle.round === -1) {
    Object.freeze(attacker.cohorts)
    Object.freeze(defender.cohorts)
    battle.participants[Side.Attacker].rounds = [attacker]
    battle.participants[Side.Defender].rounds = [defender]
    attacker = copy(attacker)
    defender = copy(defender)
    battle.fight_over = !checkAlive(attacker.cohorts.frontline, attacker.cohorts.reserve) || !checkAlive(defender.cohorts.frontline, defender.cohorts.reserve)
  } else {
    attacker.cohorts = copyStatus(getCurrentCombat(state, Side.Attacker))
    defender.cohorts = copyStatus(getCurrentCombat(state, Side.Defender))
  }
  if (battle.round === -1 && steps > 0 && !battle.fight_over) {
    deploy(attacker, defender, settings)
    Object.freeze(attacker.cohorts)
    Object.freeze(defender.cohorts)
    battle.participants[Side.Attacker].rounds.push(attacker)
    battle.participants[Side.Defender].rounds.push(defender)
    battle.round++
    steps--
  }

  const base_damages = getBaseDamages(settings)

  for (let step = 0; step < steps && !battle.fight_over; ++step) {
    attacker = copy(attacker)
    defender = copy(defender)
    rollDice(participant_a)
    rollDice(participant_d)
    checkOldRoll(participant_a)
    checkOldRoll(participant_d)
    attacker.dice = participant_a.dice
    defender.dice = participant_d.dice

    doBattleFast(attacker, defender, true, base_damages, settings, battle.round)

    battle.fight_over = !checkAlive(attacker.cohorts.frontline, attacker.cohorts.reserve) || !checkAlive(defender.cohorts.frontline, defender.cohorts.reserve)
    if (battle.fight_over) {
      removeDefeated(attacker.cohorts.frontline)
      removeDefeated(defender.cohorts.frontline)
    }

    Object.freeze(attacker.cohorts)
    Object.freeze(defender.cohorts)
    battle.participants[Side.Attacker].rounds.push(attacker)
    battle.participants[Side.Defender].rounds.push(defender)
    updateRoll(participant_a)
    updateRoll(participant_d)
    battle.round++
  }
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