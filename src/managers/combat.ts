import { AppState, getMode, getCurrentCombat, getSettings, getCombatParticipant, initializeCombatParticipants } from 'state'
import { deploy, doBattle, removeDefeated, getCombatPhaseNumber, armySize } from 'combat'
import { Battle, SideType, Setting, Settings, CombatCohorts, CombatParticipant, Side } from 'types'
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

  const side_a = battle.sides[SideType.Attacker]
  const side_d = battle.sides[SideType.Defender]

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


  const rollDice = (side: Side) => {
    if ((battle.round - 1) % roll_frequency !== 0)
      return null
    // Always throw dice so that manually setting one side won't affect the other.
    const random = rng.integer(minimum_roll, maximum_roll)
    const phase = getCombatPhaseNumber(battle.round, settings)
    if (side.randomize_dice)
      return random
    else if (phase < side.rolls.length && side.rolls[phase])
      return side.rolls[phase]
    else
      return side.dice
  }

  if (battle.round === -1) {
    Object.freeze(attacker.cohorts)
    Object.freeze(defender.cohorts)
    side_a.rounds = [attacker]
    side_d.rounds = [defender]
    attacker = copy(attacker)
    defender = copy(defender)
    attacker.alive = armySize(attacker.cohorts) > 0
    defender.alive = armySize(defender.cohorts) > 0
    battle.fight_over = !attacker.alive || !defender.alive
  } else {
    attacker.cohorts = copyStatus(getCurrentCombat(state, SideType.Attacker))
    defender.cohorts = copyStatus(getCurrentCombat(state, SideType.Defender))
  }
  if (battle.round === -1 && steps > 0 && !battle.fight_over) {
    deploy(attacker, defender, settings)
    battle.fight_over = !attacker.alive || !defender.alive
    Object.freeze(attacker.cohorts)
    Object.freeze(defender.cohorts)
    side_a.rounds.push(attacker)
    side_d.rounds.push(defender)
    battle.round++
    steps--
  }


  for (let step = 0; step < steps && !battle.fight_over; ++step) {
    attacker = copy(attacker)
    defender = copy(defender)
    battle.round++
    attacker.dice = rollDice(side_a) ?? attacker.dice
    defender.dice = rollDice(side_d) ?? defender.dice

    doBattle(attacker, defender, true, settings, battle.round)

    battle.fight_over = !attacker.alive || !defender.alive
    if (battle.fight_over) {
      removeDefeated(attacker.cohorts.frontline)
      removeDefeated(defender.cohorts.frontline)
    }

    Object.freeze(attacker.cohorts)
    Object.freeze(defender.cohorts)
    side_a.rounds.push(attacker)
    side_d.rounds.push(defender)
  }
}

export const battle = (pair: [AppState, AppState], steps: number) => {
  const [state, draft] = pair
  const mode = getMode(state)
  const battle = draft.battle[mode]
  const settings = getSettings(state, mode)
  subBattle(state, battle, getCombatParticipant(state, SideType.Attacker), getCombatParticipant(state, SideType.Defender), settings, steps)
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