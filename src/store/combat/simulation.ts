import { Units, Unit, UnitCalc, UnitType } from "../units"
import { ParticipantState, doBattle } from "."
import { TerrainDefinition, TerrainType } from "../terrains"
import { DeepReadonly as R, DeepWritable as W } from 'ts-essentials'
import { Settings, CombatParameter } from "../settings"
import { mapRange, round, values } from "../../utils"
import { Side } from "../battle"
import { createEntropy, MersenneTwister19937, Random } from "random-js"
import { doBattleFast, CalculatedUnit, FrontLine, totalDamageSource, UnitStatus, StatusLine } from "./combat_fast"
import { calculateValue } from "../../base_definition"
import { some } from "lodash"

export const getRolls = (index: number, dice: number): [number, number][] => {
  const dice_2 = dice * dice
  let rolls: [number, number][] = []
  let divider = dice_2
  while (index >= divider)
    divider = divider * dice_2
  divider = divider / dice_2
  while (divider > dice) {
    const result = Math.floor(index / divider)
    rolls.push([(result % dice) + 1, Math.floor(result / dice) + 1])
    index = index % divider
    divider = divider / dice_2
  }
  rolls.push([(index % dice) + 1, Math.floor(index / dice) + 1])
  return rolls.reverse()
}

const rolls = [
  [1, 1],
  [2, 1],
  [3, 1],
  [4, 1],
  [5, 1],
  [6, 1],
  [1, 2],
  [2, 2],
  [3, 2],
  [4, 2],
  [5, 2],
  [6, 2],
  [1, 3],
  [2, 3],
  [3, 3],
  [4, 3],
  [5, 3],
  [6, 3],
  [1, 4],
  [2, 4],
  [3, 4],
  [4, 4],
  [5, 4],
  [6, 4],
  [1, 5],
  [2, 5],
  [3, 5],
  [4, 5],
  [5, 5],
  [6, 5],
  [1, 6],
  [2, 6],
  [3, 6],
  [4, 6],
  [5, 6],
  [6, 6],
]

export const spread = (index: number, dice_2: number, depth: number) => {
  const spread = Math.pow(dice_2, depth)
  return mapRange(dice_2 - 1, value => index + spread * (value + 1))
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

    while (winner === undefined) {
      units_a.roll = rng.integer(1, 6)
      units_d.roll = rng.integer(1, 6)
      //winner = doPhase(round, definitions, units_a, units_d, terrains, settings)
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

const copyStatus = (status: StatusLine): StatusLine => {
  return status.map(value => value ? { ...value } : null)
}


export const calculateWinRate = (definitions: Units, attacker: R<ParticipantState>, defender: R<ParticipantState>, terrains: TerrainDefinition[], settings: Settings) => {
  const dice = settings[CombatParameter.DiceMaximum] - settings[CombatParameter.DiceMinimum] + 1
  const dice_2 = dice * dice

  const fractions = mapRange(10, value => 1.0 / Math.pow(dice_2, value))

  let wins_attacker = 0.0
  let wins_defender = 0.0
  let draws = 0.0
  let incomplete = 0.0

  // Deployment is shared for each iteration.
  const [a, d] = doBattle(definitions, attacker, defender, 0, terrains, settings)
  const orig_a = a.frontline.map(unit => calculateUnit(unit as Unit))
  const orig_d = d.frontline.map(unit => calculateUnit(unit as Unit))
  const status_a = a.frontline.map(unit => calculateState(unit as Unit))
  const status_d = d.frontline.map(unit => calculateState(unit as Unit))
  let iterations = 0

  const cache = [{ status_a, status_d, index: 0, depth: 1 }]
  while (cache.length) {
    iterations++
    const status = cache[cache.length - 1]
    // Copy once to allow mutations.
    const units_a = copyStatus(status.status_a)
    const units_d = copyStatus(status.status_d)

    const [roll_a, roll_d] = rolls[status.index]
    status.index++
    if (status.index === dice * dice)
      cache.pop()
    let winner = doPhase(units_a, orig_a, units_d, orig_d, roll_a, roll_d, terrains, settings)

    let depth = status.depth
    while (winner === undefined && depth < 5) {
      depth++
      cache.push({ status_a: copyStatus(units_a), status_d: copyStatus(units_d), index: 1, depth })
      winner = doPhase(units_a, orig_a, units_d, orig_d, 1, 1, terrains, settings)
    }
    if (winner === Side.Attacker)
      wins_attacker += fractions[depth]
    else if (winner === Side.Defender)
      wins_defender += fractions[depth]
    else if (winner === null)
      draws += fractions[depth]
    else
      incomplete += fractions[depth]
  }
  wins_attacker = round(wins_attacker, 10000.0)
  wins_defender = round(wins_defender, 10000.0)
  draws = round(draws, 10000.0)
  incomplete = round(incomplete, 10000.0)
  //console.log('Iterations ' + iterations + ' Attacker ' + wins_attacker + ' Defender ' + wins_defender + ' Draws ' + draws + ' Incomplete ' + incomplete)
  return { wins_attacker, wins_defender, draws, incomplete, iterations }
}

const unitCalcs = values(UnitCalc)
const terrainTypes = values(TerrainType)
const unitTypes = values(UnitType)

const calculateUnit = (unit: Unit | null): CalculatedUnit | null => {
  if (!unit)
    return null
  const calculated = {
    type: unit.type,
    is_loyal: !!unit.is_loyal
  } as CalculatedUnit
  unitCalcs.forEach(calc => { calculated[calc] = calculateValue(unit, calc) })
  terrainTypes.forEach(calc => { calculated[calc] = calculateValue(unit, calc) })
  unitTypes.forEach(calc => { calculated[calc] = calculateValue(unit, calc) })
  calculated['total'] = totalDamageSource(calculated)
  return calculated
}

const calculateState = (unit: Unit | null): UnitStatus | null => {
  if (!unit)
    return null
  const calculated = {
    [UnitCalc.Morale]: calculateValue(unit, UnitCalc.Morale),
    [UnitCalc.Strength]: calculateValue(unit, UnitCalc.Strength),
  } as UnitStatus
  return calculated
}

const doPhase = (units_a: StatusLine, orig_a: FrontLine, units_d: StatusLine, orig_d: FrontLine, roll_a: number, roll_d: number, terrains: TerrainDefinition[], settings: Settings) => {
  let winner: Side | null | undefined = undefined
  const phase = settings[CombatParameter.RollFrequency]
  for (let i = 0; i < phase; i++) {
    doBattleFast(units_a, units_d, orig_a, orig_d, roll_a, roll_d, terrains, settings)

    const alive_a = some(units_a, value => value)
    const alive_d = some(units_d, value => value)
    if (!alive_a && !alive_d)
      winner = null
    if (alive_a && !alive_d)
      winner = Side.Attacker
    if (!alive_a && alive_d)
      winner = Side.Defender
    if (winner !== undefined)
      break
  }
  return winner
}