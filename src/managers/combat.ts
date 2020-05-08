import { AppState, getMode, getCurrentCombat, getSettings, getCombatSide, initializeCombatParticipants } from 'state'
import { deploy, doBattle, removeDefeated, getCombatPhaseNumber, armySize } from 'combat'
import { Battle, SideType, Setting, Settings, CombatCohorts, CombatParticipant, Side } from 'types'
import { createEntropy, MersenneTwister19937, Random } from 'random-js'
import { forEach } from 'utils'

const copyStatus = (status: CombatCohorts): CombatCohorts => ({
  frontline: status.frontline.map(row => row.map(value => value ? { ...value, state: { ...value.state } } : null)),
  reserve: {
    front: status.reserve.front.map(value => ({ ...value, state: { ...value.state } })),
    flank: status.reserve.flank.map(value => ({ ...value, state: { ...value.state } })),
    support: status.reserve.support.map(value => ({ ...value, state: { ...value.state } }))
  },
  defeated: status.defeated.map(value => ({ ...value, state: { ...value.state } })),
  leftFlank: status.leftFlank,
  rightFlank: status.rightFlank
})

const copy = (participant: CombatParticipant): CombatParticipant => ({ ...participant, cohorts: copyStatus(participant.cohorts) })

const subBattle = (state: AppState, battle: Battle, attacker: CombatParticipant, defender: CombatParticipant, settings: Settings, steps: number) => {

  const sideA = battle.sides[SideType.Attacker]
  const sideD = battle.sides[SideType.Defender]

  battle.outdated = false
  battle.timestamp = new Date().getMilliseconds()
  const minimumRoll = settings[Setting.DiceMinimum]
  const maximumRoll = settings[Setting.DiceMaximum]
  const rollFrequency = settings[Setting.PhaseLength]
  // Regenerate seed for the first roll (undo resets it when going back to deployment).
  if (battle.round + steps > 0 && !battle.seed)
    battle.seed = battle.customSeed ?? Math.abs(createEntropy(undefined, 1)[0])
  const engine = MersenneTwister19937.seed(battle.seed)
  engine.discard(2 * Math.ceil((battle.round) / rollFrequency))
  const rng = new Random(engine)


  const rollDice = (side: Side) => {
    if ((battle.round - 1) % rollFrequency !== 0)
      return null
    // Always throw dice so that manually setting one side won't affect the other.
    const random = rng.integer(minimumRoll, maximumRoll)
    const phase = getCombatPhaseNumber(battle.round, settings)
    if (side.randomizeDice)
      return random
    else if (phase < side.rolls.length && side.rolls[phase])
      return side.rolls[phase]
    else
      return side.dice
  }

  if (battle.round === -1) {
    Object.freeze(attacker.cohorts)
    Object.freeze(defender.cohorts)
    sideA.rounds = [attacker]
    sideD.rounds = [defender]
    attacker = copy(attacker)
    defender = copy(defender)
    attacker.alive = armySize(attacker.cohorts) > 0
    defender.alive = armySize(defender.cohorts) > 0
    battle.fightOver = !attacker.alive || !defender.alive
  } else {
    attacker.cohorts = copyStatus(getCurrentCombat(state, SideType.Attacker))
    defender.cohorts = copyStatus(getCurrentCombat(state, SideType.Defender))
  }
  if (battle.round === -1 && steps > 0 && !battle.fightOver) {
    deploy(attacker, defender, settings)
    battle.fightOver = !attacker.alive || !defender.alive
    Object.freeze(attacker.cohorts)
    Object.freeze(defender.cohorts)
    sideA.rounds.push(attacker)
    sideD.rounds.push(defender)
    battle.round++
    steps--
  }


  for (let step = 0; step < steps && !battle.fightOver; ++step) {
    attacker = copy(attacker)
    defender = copy(defender)
    battle.round++
    attacker.dice = rollDice(sideA) ?? attacker.dice
    defender.dice = rollDice(sideD) ?? defender.dice

    doBattle(attacker, defender, true, settings, battle.round)

    battle.fightOver = !attacker.alive || !defender.alive
    if (battle.fightOver) {
      removeDefeated(attacker.cohorts.frontline)
      removeDefeated(defender.cohorts.frontline)
    }

    Object.freeze(attacker.cohorts)
    Object.freeze(defender.cohorts)
    sideA.rounds.push(attacker)
    sideD.rounds.push(defender)
  }
}

export const battle = (pair: [AppState, AppState], steps: number) => {
  const [state, draft] = pair
  const mode = getMode(state)
  const battle = draft.battle[mode]
  const settings = getSettings(state, mode)
  subBattle(state, battle, getCombatSide(state, SideType.Attacker), getCombatSide(state, SideType.Defender), settings, steps)
}

export const refreshBattle = (pair: [AppState, AppState]) => {
  const [state, draft] = pair
  const mode = getMode(state)
  const battle = draft.battle[mode]
  const settings = getSettings(state, mode)
  const steps = battle.round + 1
  battle.round = -1
  battle.fightOver = false
  const [attacker, defender] = initializeCombatParticipants(state)
  subBattle(state, battle, attacker, defender, settings, steps)
}

export const undo = (pair: [AppState, AppState], steps: number) => {
  const [state, draft] = pair
  const mode = getMode(state)
  const battle = draft.battle[mode]
  for (let step = 0; step < steps && battle.round > -1; ++step) {
    let seed: number = battle.seed
    if (battle.round < 2)
      seed = battle.customSeed ? battle.customSeed : 0
    forEach(battle.sides, side => {
      side.rounds.pop()
    })
    battle.round--
    battle.seed = seed
    battle.fightOver = false
    battle.timestamp = new Date().getMilliseconds()
  }
}
