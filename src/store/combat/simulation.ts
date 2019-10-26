import { Units } from "../units"
import { ParticipantState, doBattle } from "."
import { TerrainDefinition } from "../terrains"
import { DeepReadonly as R, DeepWritable as W } from 'ts-essentials'
import { Settings, CombatParameter } from "../settings"
import { mapRange, round } from "../../utils"
import { checkFightSub, Side } from "../battle"
import { createEntropy, MersenneTwister19937, Random } from "random-js"

export const getRolls = (index: number, dice: number): [number, number][] => {
  let rolls: [number, number][] = []
  let divider = dice * dice
  while (index >= divider)
    divider = divider * dice * dice
  divider = divider / dice / dice
  while (divider > dice) {
    const result = Math.floor(index / divider)
    rolls.push([(result % dice) + 1, Math.floor(result / dice) + 1])
    index = index % divider
    divider = Math.sqrt(divider)
  }
  rolls.push([(index % dice) + 1, Math.floor(index / dice) + 1])
  return rolls.reverse()
}

export const monteCarot = (definitions: Units, attacker: R<ParticipantState>, defender: R<ParticipantState>, terrains: TerrainDefinition[], settings: Settings) => {
  const iterations = 10000
  const seed = createEntropy()[0]
  const engine = MersenneTwister19937.seed(seed)
  const rng = new Random(engine)

  let wins_attacker = 0.0
  let wins_defender = 0.0
  let draws = 0.0
  let incomplete = 0.0

  // Deployment is shared for each iteration.
  const [a, d] = doBattle(definitions, attacker, defender, 0, terrains, settings)
  attacker = { ...attacker, ...a }
  defender = { ...defender, ...d }

  for (let i = 0; i < iterations; i++) {
    // Copy once to allow mutations.
    const units_a = { ...attacker } as W<ParticipantState>
    const units_d = { ...defender } as W<ParticipantState>
    let winner: Side | null | undefined = undefined

    let round = 0

    while (winner === undefined) {
      units_a.roll = rng.integer(1, 6)
      units_d.roll = rng.integer(1, 6)
      winner = doPhase(round, definitions, units_a, units_d, terrains, settings)
      round++
    }
    if (winner === Side.Attacker)
      wins_attacker += 1.0 / iterations
    if (winner === Side.Defender)
      wins_defender += 1.0 / iterations
    if (winner === null)
      draws += 1.0 / iterations
    if (winner === undefined)
      incomplete += 1.0 / iterations
  }
  wins_attacker = round(wins_attacker, 10000.0)
  wins_defender = round(wins_defender, 10000.0)
  draws = round(draws, 10000.0)
  incomplete = round(incomplete, 10000.0)
  console.log('Attacker ' + wins_attacker + ' Defender ' + wins_defender + ' Draws ' + draws + ' Incomplete ' + incomplete)
  return { wins_attacker, wins_defender, draws, incomplete }

}

export const calculateWinRate = (definitions: Units, attacker: R<ParticipantState>, defender: R<ParticipantState>, terrains: TerrainDefinition[], settings: Settings) => {
  const dice = settings[CombatParameter.DiceMaximum] - settings[CombatParameter.DiceMinimum] + 1
  const dice_2 = dice * dice
  let indexes = mapRange(dice_2, value => value)
  //indexes = [11]

  let wins_attacker = 0.0
  let wins_defender = 0.0
  let draws = 0.0
  let incomplete = 0.0

  // Deployment is shared for each iteration.
  const [a, d] = doBattle(definitions, attacker, defender, 0, terrains, settings)
  attacker = { ...attacker, ...a }
  defender = { ...defender, ...d }

  let storage: {[key: string]: any} = {}

  const todo: number[] = []
  let last_primary = 0
  let iterations = 0
  let rounds = 0
  while (indexes.length) {
    iterations++
    // Copy once to allow mutations.
    const units_a = { ...attacker } as W<ParticipantState>
    const units_d = { ...defender } as W<ParticipantState>
    const index = indexes.pop()!
    const rolls = getRolls(index, dice)
    let depth = rolls.length
    if (depth === 1) {
      if (rolls[0][0] !== last_primary)
        storage = {}
      last_primary = rolls[0][0]
    }
    let winner: Side | null | undefined = undefined
    let key = ''

    rolls.forEach(([roll_a, roll_d], roll_index) => {
      if (winner !== undefined)
        return
      if (storage[key + roll_a + ',' + roll_d]) {
        const stored = storage[key + roll_a + ',' + roll_d]
        units_a.frontline = stored.units_a.frontline
        units_a.reserve = stored.units_a.reserve
        units_a.defeated = stored.units_a.defeated
        units_d.frontline = stored.units_d.frontline
        units_d.reserve = stored.units_d.reserve
        units_d.defeated = stored.units_d.defeated
        key += roll_a + ',' + roll_d + '_'
        return
      }
      units_a.roll = roll_a
      units_d.roll = roll_d
      rounds++
      winner = doPhase(roll_index, definitions, units_a, units_d, terrains, settings)
      if (winner === undefined) {
        storage[key + roll_a + ',' + roll_d] = { units_a: { ...units_a },  units_d: { ...units_d } }
      }
      key += roll_a + ',' + roll_d + '_'
    })
    while (winner === undefined && depth < 3) {
      // Need to extend rolls.
      const spread = Math.pow(dice_2, depth)
      indexes = indexes.concat(...mapRange(dice_2 - 1, value => index + spread * (value + 1)))
      units_a.roll = 1
      units_d.roll = 1
      winner = doPhase(depth, definitions, units_a, units_d, terrains, settings)
      if (winner === undefined) {
        storage[key + '1,1'] = { units_a: { ...units_a },  units_d: { ...units_d } }
      }
      key += '1,1' + '_'
      depth++
    }
    if (winner === Side.Attacker)
      wins_attacker += 1.0 / Math.pow(dice_2, depth)
    if (winner === Side.Defender)
      wins_defender += 1.0 / Math.pow(dice_2, depth)
    if (winner === null)
      draws += 1.0 / Math.pow(dice_2, depth)
    if (winner === undefined)
      incomplete += 1.0 / Math.pow(dice_2, depth)
    if (winner === undefined)
      todo.push(index)
  }
  wins_attacker = round(wins_attacker, 10000.0)
  wins_defender = round(wins_defender, 10000.0)
  draws = round(draws, 10000.0)
  incomplete = round(incomplete, 10000.0)
  //console.log(iterations + ' ' + rounds + ' ' + todo.length)
  //console.log('Attacker ' + wins_attacker + ' Defender ' + wins_defender + ' Draws ' + draws + ' Incomplete ' + incomplete)
  return { wins_attacker, wins_defender, draws, incomplete }
}

const doPhase = (roll: number, definitions: Units, units_a: W<ParticipantState>, units_d: W<ParticipantState>, terrains: TerrainDefinition[], settings: Settings) => {
  let winner: Side | null | undefined = undefined
  const phase = Math.floor(settings[CombatParameter.RollFrequency])
  for (let i = 0; i < phase; i++) {
    const [a, d] = doBattle(definitions, units_a, units_d, roll * phase + i + 1, terrains, settings)

    const alive_a = checkFightSub(a)
    const alive_d = checkFightSub(d)
    if (!alive_a && !alive_d)
      winner = null
    if (alive_a && !alive_d)
      winner = Side.Attacker
    if (!alive_a && alive_d)
      winner = Side.Defender
    if (winner !== undefined)
      break
    units_a.frontline = a.frontline
    units_a.reserve = a.reserve
    units_a.defeated = a.defeated
    units_d.frontline = d.frontline
    units_d.reserve = d.reserve
    units_d.defeated = d.defeated
  }
  return winner
}