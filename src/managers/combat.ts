import { AppState, getMode, getCombatSide, getCombatField, convertSides } from 'state'
import { doBattle, removeDefeated, getCombatPhaseNumber } from 'combat'
import { Battle, SideType, Setting, Cohorts, SideData, Side, Environment, Army, Reserve, General } from 'types'
import { createEntropy, MersenneTwister19937, Random } from 'random-js'
import { forEach } from 'utils'
import { getRound } from './battle'

const copyCohorts = (cohorts: Cohorts): Cohorts => ({
  frontline: cohorts.frontline.map(row => row.map(value => value ? { ...value, state: { ...value.state } } : null)),
  reserve: copyReserve(cohorts.reserve),
  defeated: cohorts.defeated.map(value => ({ ...value, state: { ...value.state } }))
})

const copyReserve = (reserve: Reserve): Reserve => ({
  front: reserve.front.map(value => ({ ...value, state: { ...value.state } })),
  flank: reserve.flank.map(value => ({ ...value, state: { ...value.state } })),
  support: reserve.support.map(value => ({ ...value, state: { ...value.state } }))
})
const copyArmies = (armies: Army[]): Army[] => (
  armies.map(army => ({ ...army, reserve: copyReserve(army.reserve), general: { ...army.general } }))
)
const copyGenerals = (generals: General[]): General[] => (
  generals.map(general => ({ ...general }))
)

const freeseSize = (side: Side) => {
  Object.freeze(side.armies)
  Object.freeze(side.deployedArmies)
  Object.freeze(side.cohorts)
  Object.freeze(side.generals)
}

// Copy is needed because of freezing stuff.
// And freezing is needed because of some immer issue. 
const copy = (side: Side): Side => ({ ...side, generals: copyGenerals(side.generals), cohorts: copyCohorts(side.cohorts), armies: copyArmies(side.armies), deployedArmies: copyArmies(side.deployedArmies), results: { ...side.results } })

const subBattle = (battle: Battle, field: Environment, attacker: Side, defender: Side, steps: number) => {

  const sideA = battle.sides[SideType.Attacker]
  const sideD = battle.sides[SideType.Defender]
  const settings = field.settings
  const round = getRound(battle)

  battle.outdated = false
  battle.timestamp = new Date().getMilliseconds()
  const minimumRoll = settings[Setting.DiceMinimum]
  const maximumRoll = settings[Setting.DiceMaximum]
  const rollFrequency = settings[Setting.PhaseLength]
  // Regenerate seed for the first roll (undo resets it when going back to deployment).
  if (round + steps > 0 && !battle.seed)
    battle.seed = battle.customSeed ?? Math.abs(createEntropy(undefined, 1)[0])
  const engine = MersenneTwister19937.seed(battle.seed)
  engine.discard(2 * Math.ceil((round) / rollFrequency))
  const rng = new Random(engine)


  const rollDice = (side: SideData) => {
    if (getRound(battle) % rollFrequency !== 0)
      return null
    // Always throw dice so that manually setting one side won't affect the other.
    const random = rng.integer(minimumRoll, maximumRoll)
    const phase = getCombatPhaseNumber(getRound(battle), settings)
    if (side.randomizeDice)
      return random
    else if (phase < side.rolls.length && side.rolls[phase])
      return side.rolls[phase]
    else
      return side.dice
  }
  
  if (round === -1) {
    attacker = copy(attacker)
    defender = copy(defender)
    field.round = 0
    field.duration = 0
    doBattle(field, attacker, defender, true)
    battle.fightOver = !attacker.alive || !defender.alive
    freeseSize(attacker)
    freeseSize(defender)
    sideA.rounds = [attacker]
    sideD.rounds = [defender]
    battle.rounds.push({ duration: field.duration })
  }

  for (let step = 0; step < steps && !battle.fightOver; ++step) {
    attacker = copy(attacker)
    defender = copy(defender)
    attacker.results.dice = rollDice(sideA) ?? attacker.results.dice
    defender.results.dice = rollDice(sideD) ?? defender.results.dice
    field.round = getRound(battle) + 1
    doBattle(field, attacker, defender, true)

    battle.fightOver = !attacker.alive || !defender.alive
    if (battle.fightOver) {
      removeDefeated(attacker.cohorts.frontline)
      removeDefeated(defender.cohorts.frontline)
    }

    freeseSize(attacker)
    freeseSize(defender)
    sideA.rounds.push(attacker)
    sideD.rounds.push(defender)
    battle.rounds.push({ duration: field.duration })
  }
}

export const battle = (pair: [AppState, AppState], steps: number) => {
  const [state, draft] = pair
  const mode = getMode(state)
  const battle = draft.battle[mode]
  subBattle(battle, getCombatField(state), getCombatSide(state, SideType.Attacker), getCombatSide(state, SideType.Defender), steps)
}

export const refreshBattle = (pair: [AppState, AppState]) => {
  const [state, draft] = pair
  const mode = getMode(state)
  const battle = draft.battle[mode]
  const steps = getRound(battle)
  battle.rounds = []
  const [attacker, defender] = convertSides(state)
  subBattle(battle, getCombatField(state), attacker, defender, steps)
}

export const undo = (pair: [AppState, AppState], steps: number) => {
  const [state, draft] = pair
  const mode = getMode(state)
  const battle = draft.battle[mode]
  for (let step = 0; step < steps && battle.rounds.length > 1; ++step) {
    let seed: number = battle.seed
    if (getRound(battle) < 2)
      seed = battle.customSeed ? battle.customSeed : 0
    forEach(battle.sides, side => {
      side.rounds.pop()
    })
    battle.rounds.pop()
    battle.seed = seed
    battle.fightOver = false
    battle.timestamp = new Date().getMilliseconds()
  }
}
