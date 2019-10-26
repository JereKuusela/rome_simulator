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
import { cloneDeep, some } from "lodash"

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

    let round = 0

    while (winner === undefined) {
      units_a.roll = rng.integer(1, 6)
      units_d.roll = rng.integer(1, 6)
      //winner = doPhase(round, definitions, units_a, units_d, terrains, settings)
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

const copyStatus = (status: StatusLine): StatusLine => {
  return status.map(value => value ? { ...value } : null)
}

export const calculateWinRate = (definitions: Units, attacker: R<ParticipantState>, defender: R<ParticipantState>, terrains: TerrainDefinition[], settings: Settings) => {
  const dice = settings[CombatParameter.DiceMaximum] - settings[CombatParameter.DiceMinimum] + 1
  const dice_2 = dice * dice
  let indexes = mapRange(dice_2, value => value)
  //windexes = [11]

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
  let storage: { [key: string]: any } = {}

  const todo: number[] = []
  let last_primary = 0
  let iterations = 0
  while (indexes.length) {
    iterations++
    // Copy once to allow mutations.
    let units_a: StatusLine = []
    let units_d: StatusLine = []
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

    for (let i = 0; i < rolls.length; i++) {
      const roll_a = rolls[i][0]
      const roll_d = rolls[i][1]
      const roll_index = i
      if (winner !== undefined)
        continue

      if (roll_index < rolls.length - 1) {
        key += '_' + roll_a + ',' + roll_d
        continue
      }
      if (key) {
        const valid = storage[key]
        units_a = copyStatus(valid.units_a)
        units_d = copyStatus(valid.units_d)
      }
      else {
        units_a = copyStatus(status_a)
        units_d = copyStatus(status_d)
      }
      
      winner = doPhase(units_a, orig_a, units_d, orig_d, roll_a, roll_d, terrains, settings)
      key += '_' + roll_a + ',' + roll_d
      if (winner === undefined) {
        storage[key] = { units_a: copyStatus(units_a), units_d: copyStatus(units_d) }
      }
    }
    while (winner === undefined && depth < 4) {
      // Need to extend rolls.
      indexes = indexes.concat(...spread(index, dice_2, depth))
      winner = doPhase(units_a, orig_a, units_d, orig_d, 1, 1, terrains, settings)
      key += '_1,1'
      if (winner === undefined) {
        storage[key] = { units_a: copyStatus(units_a), units_d: copyStatus(units_d) }
      }
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
  //console.log(iterations + ' ' + todo.length)
  //console.log('Attacker ' + wins_attacker + ' Defender ' + wins_defender + ' Draws ' + draws + ' Incomplete ' + incomplete)
  return { wins_attacker, wins_defender, draws, incomplete }
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
  const phase = Math.floor(settings[CombatParameter.RollFrequency])
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