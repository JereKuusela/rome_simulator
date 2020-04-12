import { AppState, getMode, getCurrentCombat, getSettings, getCombatParticipant, initializeCombatParticipants } from 'state'
import { deploy, doBattle, removeDefeated, getCombatPhaseNumber, armySize } from 'combat'
import { Battle, Side, Setting, Participant, Settings, CombatCohorts, CombatParticipant } from 'types'
import { createEntropy, MersenneTwister19937, Random } from 'random-js'

const copyStatus = (status: CombatCohorts): CombatCohorts => ({
  frontline: status.frontline.map(row => row.map(value => value ? { ...value, state: { ...value.state } } : null)),
  reserve: {
    front: status.reserve.front.map(value => ({ ...value, state: { ...value.state } })),
    flank: status.reserve.flank.map(value => ({ ...value, state: { ...value.state } })),
    support: status.reserve.support.map(value => ({ ...value, state: { ...value.state } }))
  },
  defeated: status.defeated.map(value => ({ ...value, state: { ...value.state } })),
  left_flank: status.left_flank,
  right_flank: status.right_flank
})

const copy = (participant: CombatParticipant): CombatParticipant => ({ ...participant, cohorts: copyStatus(participant.cohorts) })

const subBattle = (state: AppState, battle: Battle, attacker: CombatParticipant, defender: CombatParticipant, settings: Settings, steps: number) => {

  const participant_a = battle.participants[Side.Attacker]
  const participant_d = battle.participants[Side.Defender]

  battle.outdated = false
  battle.timestamp = new Date().getMilliseconds()
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
    if ((battle.round - 1) % roll_frequency !== 0)
      return null
    // Always throw dice so that manually setting one side won't affect the other.
    const random = rng.integer(minimum_roll, maximum_roll)
    const phase = getCombatPhaseNumber(battle.round, settings)
    if (participant.randomize_dice)
      return random
    else if (phase < participant.rolls.length && participant.rolls[phase])
      return participant.rolls[phase]
    else
      return participant.dice
  }

  if (battle.round === -1) {
    Object.freeze(attacker.cohorts)
    Object.freeze(defender.cohorts)
    battle.participants[Side.Attacker].rounds = [attacker]
    battle.participants[Side.Defender].rounds = [defender]
    attacker = copy(attacker)
    defender = copy(defender)
    attacker.alive = armySize(attacker.cohorts) > 0
    defender.alive = armySize(defender.cohorts) > 0
    battle.fight_over = !attacker.alive || !defender.alive
  } else {
    attacker.cohorts = copyStatus(getCurrentCombat(state, Side.Attacker))
    defender.cohorts = copyStatus(getCurrentCombat(state, Side.Defender))
  }
  if (battle.round === -1 && steps > 0 && !battle.fight_over) {
    deploy(attacker, defender, settings)
    battle.fight_over = !attacker.alive || !defender.alive
    Object.freeze(attacker.cohorts)
    Object.freeze(defender.cohorts)
    battle.participants[Side.Attacker].rounds.push(attacker)
    battle.participants[Side.Defender].rounds.push(defender)
    battle.round++
    steps--
  }


  for (let step = 0; step < steps && !battle.fight_over; ++step) {
    attacker = copy(attacker)
    defender = copy(defender)
    battle.round++
    attacker.dice = rollDice(participant_a) ?? attacker.dice
    defender.dice = rollDice(participant_d) ?? defender.dice

    doBattle(attacker, defender, true, settings, battle.round)

    battle.fight_over = !attacker.alive || !defender.alive
    if (battle.fight_over) {
      removeDefeated(attacker.cohorts.frontline)
      removeDefeated(defender.cohorts.frontline)
    }

    Object.freeze(attacker.cohorts)
    Object.freeze(defender.cohorts)
    battle.participants[Side.Attacker].rounds.push(attacker)
    battle.participants[Side.Defender].rounds.push(defender)
  }
}

export const battle = (pair: [AppState, AppState], steps: number) => {
  const [state, draft] = pair
  const mode = getMode(state)
  const battle = draft.battle[mode]
  const settings = getSettings(state, mode)
  subBattle(state, battle, getCombatParticipant(state, Side.Attacker), getCombatParticipant(state, Side.Defender), settings, steps)
}

export const refreshBattle = (pair: [AppState, AppState]) => {
  const [state, draft] = pair
  const mode = getMode(state)
  const battle = draft.battle[mode]
  const settings = getSettings(state, mode)
  const steps = battle.round + 1
  battle.round = -1
  battle.fight_over = false
  const [attacker, defender] = initializeCombatParticipants(state)
  subBattle(state, battle, attacker, defender, settings, steps)
}