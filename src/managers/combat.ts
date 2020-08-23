import { AppState, getMode, getCombatSide, getCombatField, convertSides } from 'state'
import { doCombatRound, removeDefeated, getCombatPhaseNumber } from 'combat'
import { Battle, SideType, Setting, Cohorts, SideData, Side, Environment, Army, Reserve } from 'types'
import { createEntropy, MersenneTwister19937, Random } from 'random-js'
import { forEach } from 'utils'
import { getDay, getStartingPhaseNumber, getRound } from './battle'

const copyCohorts = (cohorts: Cohorts): Cohorts => ({
  frontline: cohorts.frontline.map(row => row.map(value => value ? { ...value, state: { ...value.state } } : null)),
  reserve: copyReserve(cohorts.reserve),
  defeated: cohorts.defeated.map(value => ({ ...value, state: { ...value.state } })),
  retreated: cohorts.retreated.map(value => ({ ...value, state: { ...value.state } }))
})

const copyReserve = (reserve: Reserve): Reserve => ({
  front: reserve.front.map(value => ({ ...value, state: { ...value.state } })),
  flank: reserve.flank.map(value => ({ ...value, state: { ...value.state } })),
  support: reserve.support.map(value => ({ ...value, state: { ...value.state } }))
})
const copyArmies = (armies: Army[]): Army[] => (
  armies.map(army => ({ ...army, reserve: copyReserve(army.reserve) }))
)

const freeseSize = (side: Side) => {
  Object.freeze(side.armies)
  Object.freeze(side.cohorts)
  Object.freeze(side.deployed)
}

// Copy is needed because of freezing stuff.
// And freezing is needed because of some immer issue. 
const copy = (side: Side): Side => ({ ...side, deployed: copyArmies(side.deployed), cohorts: copyCohorts(side.cohorts), armies: copyArmies(side.armies), results: { ...side.results } })

const subBattle = (battle: Battle, env: Environment, attacker: Side, defender: Side, steps: number) => {
  const sideA = battle.sides[SideType.A]
  const sideD = battle.sides[SideType.B]
  const settings = env.settings
  const round = getRound(battle)
  const day = getDay(battle)
  const phaseNumber = getStartingPhaseNumber(battle) + getCombatPhaseNumber(getRound(battle), settings)

  battle.outdated = false
  battle.timestamp = new Date().getMilliseconds()
  const minimumRoll = settings[Setting.DiceMinimum]
  const maximumRoll = settings[Setting.DiceMaximum]
  const rollFrequency = settings[Setting.PhaseLength]
  // Regenerate seed for the first roll (undo resets it when going back to deployment).
  if (day + steps > 0 && !battle.seed)
    battle.seed = battle.customSeed ?? Math.abs(createEntropy(undefined, 1)[0])
  const engine = MersenneTwister19937.seed(battle.seed)
  engine.discard(2 * phaseNumber)
  const rng = new Random(engine)


  const rollDice = (side: SideData) => {
    if (getRound(battle) % rollFrequency !== 0)
      return null
    // Always throw dice so that manually setting one side won't affect the other.
    const random = rng.integer(minimumRoll, maximumRoll)
    const phase = getStartingPhaseNumber(battle) + getCombatPhaseNumber(getRound(battle), settings)
    if (side.randomizeDice)
      return random
    else if (phase < side.rolls.length && side.rolls[phase])
      return side.rolls[phase]
    else
      return side.dice
  }
  
  if (day === -1) {
    attacker = copy(attacker)
    defender = copy(defender)
    env.day = 0
    env.round = round
    doCombatRound(env, attacker, defender, true)
    battle.fightOver = !attacker.armiesRemaining || !defender.armiesRemaining
    freeseSize(attacker)
    freeseSize(defender)
    sideA.days = [attacker]
    sideD.days = [defender]
    battle.days.push({ round: env.round, startingPhaseNumber: 0, attacker: env.attacker })
  }

  for (let step = 0; step < steps && !battle.fightOver; ++step) {
    attacker = copy(attacker)
    defender = copy(defender)
    attacker.results.dice = rollDice(sideA) ?? attacker.results.dice
    defender.results.dice = rollDice(sideD) ?? defender.results.dice
    env.day = getDay(battle) + 1
    env.round = getRound(battle)
    doCombatRound(env, attacker, defender, true)

    battle.fightOver = !attacker.armiesRemaining || !defender.armiesRemaining
    if (battle.fightOver) {
      removeDefeated(attacker.cohorts.frontline)
      removeDefeated(defender.cohorts.frontline)
    }
    let startingPhaseNumber = getStartingPhaseNumber(battle)
    if (env.round === -1) {
      startingPhaseNumber += getCombatPhaseNumber(getRound(battle), settings)
    }

    freeseSize(attacker)
    freeseSize(defender)
    sideA.days.push(attacker)
    sideD.days.push(defender)
    battle.days.push({ round: env.round, startingPhaseNumber, attacker: env.attacker })
  }
}

export const battle = (pair: [AppState, AppState], steps: number) => {
  const [state, draft] = pair
  const mode = getMode(state)
  const battle = draft.battle[mode]
  subBattle(battle, getCombatField(state), getCombatSide(state, SideType.A), getCombatSide(state, SideType.B), steps)
}

export const refreshBattle = (pair: [AppState, AppState]) => {
  const [state, draft] = pair
  const mode = getMode(state)
  const battle = draft.battle[mode]
  const steps = getDay(battle)
  battle.days = []
  const [attacker, defender] = convertSides(state)
  subBattle(battle, getCombatField(draft), attacker, defender, steps)
}

export const undo = (pair: [AppState, AppState], steps: number) => {
  const [state, draft] = pair
  const mode = getMode(state)
  const battle = draft.battle[mode]
  for (let step = 0; step < steps && battle.days.length > 1; ++step) {
    let seed: number = battle.seed
    if (getDay(battle) < 2)
      seed = battle.customSeed ? battle.customSeed : 0
    forEach(battle.sides, side => {
      side.days.pop()
    })
    battle.days.pop()
    battle.seed = seed
    battle.fightOver = false
    battle.timestamp = new Date().getMilliseconds()
  }
}
