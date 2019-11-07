import { Units, Unit, UnitType, UnitCalc } from "../store/units"
import { TerrainDefinition } from "../store/terrains"
import { CombatSettings, CombatParameter, SimulationSettings, SimulationParameter } from "../store/settings"
import { Side, BaseUnits } from "../store/battle"

import { doBattleFast, getCombatUnit, CombatParticipant, CombatUnits, Frontline, Reserve } from "./combat_fast"
import { doBattle, calculateTotalRoll, ParticipantState as Temp } from "./combat"

import { mapRange } from "../utils"
import { calculateValue } from "../base_definition"
import { TacticCalc } from "../store/tactics"

/**
 * Status of the win rate calculation. Most values are percents, only iterations is integer.
 */
export interface WinRateProgress {
  attacker: number
  defender: number
  draws: number
  incomplete: number
  progress: number
  iterations: number
  average_rounds: number,
  attacker_rounds: number
  defender_rounds: number,
  rounds: { [key: number]: number }
}

export interface CasualtiesProgress {
  avg_morale_a: number
  avg_strength_a: number
  avg_morale_d: number
  avg_strength_d: number
  max_morale_a: number
  max_strength_a: number
  max_morale_d: number
  max_strength_d: number
  morale_a: { [key: string]: number }
  morale_d: { [key: string]: number }
  strength_a: { [key: string]: number }
  strength_d: { [key: string]: number }
}


let interruptSimulation = false

/**
 * Interrupts current win rate calculation.
 */
export const interrupt = () => interruptSimulation = true

/**
 * Calculates win rate for the given battle.
 * @param simulationSettings Settings for simulation accuracy and performance.
 * @param progressCallback Callback to receive progress updates.
 * @param definitions Unit definitions.
 * @param attacker Attacker information.
 * @param defender Defender information.
 * @param terrains Current terrains.
 * @param combatSettings Settings for combat.
 */
export const calculateWinRate = (simulationSettings: SimulationSettings, progressCallback: (progress: WinRateProgress, casualties: CasualtiesProgress) => void, definitions: Units, attacker: Temp, defender: Temp, terrains: TerrainDefinition[], unit_types: UnitType[], combatSettings: CombatSettings) => {
  const progress: WinRateProgress = {
    attacker: 0.0,
    defender: 0.0,
    draws: 0.0,
    incomplete: 0.0,
    progress: 0.0,
    iterations: 0,
    average_rounds: 0,
    attacker_rounds: 0,
    defender_rounds: 0,
    rounds: {}
  }
  interruptSimulation = false

  // Performance is critical. Precalculate as many things as possible.
  const dice = combatSettings[CombatParameter.DiceMaximum] - combatSettings[CombatParameter.DiceMinimum] + 1
  const base_damages_a = getBaseDamages(combatSettings, dice, calculateTotalRoll(0, terrains, attacker.general, defender.general))
  const base_damages_d = getBaseDamages(combatSettings, dice, calculateTotalRoll(0, [], defender.general, attacker.general))
  const dice_2 = dice * dice
  const tactic_casualties = calculateValue(attacker.tactic, TacticCalc.Casualties) + calculateValue(defender.tactic, TacticCalc.Casualties)
  const rolls = getRolls(combatSettings[CombatParameter.DiceMinimum], combatSettings[CombatParameter.DiceMaximum])
  const fractions = mapRange(10, value => 1.0 / Math.pow(dice_2, value))
  const phaseLength = Math.floor(combatSettings[CombatParameter.RollFrequency] * simulationSettings[SimulationParameter.PhaseLengthMultiplier])
  const chunkSize = simulationSettings[SimulationParameter.ChunkSize]
  const maxDepth = simulationSettings[SimulationParameter.MaxDepth]

  // Deployment is shared for each iteration.
  const [a, d] = doBattle(definitions, attacker, defender, 0, terrains, combatSettings)

  const status_a = convertUnits(a, combatSettings, tactic_casualties, base_damages_a, terrains, unit_types)
  const status_d = convertUnits(d, combatSettings, tactic_casualties, base_damages_d, terrains, unit_types)

  const participant_a: CombatParticipant = {
    army: status_a,
    roll: 0,
    tactic: attacker.tactic!,
    row_types: attacker.row_types
  }
  const participant_d: CombatParticipant = {
    army: status_d,
    roll: 0,
    tactic: defender.tactic!,
    row_types: defender.row_types
  }

  const total_a: State = { morale: 0, strength: 0}
  const current_a: State = { morale: 0, strength: 0}
  sumState(total_a, status_a)
  const total_d: State = { morale: 0, strength: 0}
  const current_d: State = { morale: 0, strength: 0}
  sumState(total_d, status_d)

  const casualties: CasualtiesProgress = {
    avg_morale_a: 0,
    avg_morale_d: 0,
    avg_strength_a: 0,
    avg_strength_d: 0,
    max_morale_a: total_a.morale,
    max_morale_d: total_d.morale,
    max_strength_a: total_a.strength,
    max_strength_d: total_d.strength,
    morale_a: {},
    morale_d: {},
    strength_a: {},
    strength_d: {}
  }

  // Overview of the algorithm:
  // Initial state is the first node.
  // Nodes have a branch for each possible dice roll.
  // A branch is terminated if the battle ends before the next dice roll.
  // Otherwise end of the phase is added as a node, and set as the new starting point.
  // A node is removed when all its branches are terminated.
  // The previous node is set as the new starting point.
  // Nodes keep a track of the next branch so they know where to continue.
  // Nodes know their depth which determines their weight for win rate.

  // Nodes also cache state of units, only store what is absolutely necessary.
  const nodes = [{ status_a, status_d, branch: 0, depth: 1 }]

  const work = () => {
    for (let i = 0; (i < chunkSize) && nodes.length && !interruptSimulation; i++) {
      progress.iterations = progress.iterations + 1
      const node = nodes[nodes.length - 1]
      // Most of the data is expected to change, so it's better to deep clone which allows mutations.
      const units_a = copyStatus(node.status_a)
      const units_d = copyStatus(node.status_d)

      const [roll_a, roll_d] = rolls[node.branch]
      participant_a.roll = roll_a
      participant_d.roll = roll_d
      participant_a.army = units_a
      participant_d.army = units_d
      let result = doPhase(phaseLength, participant_a, participant_d, combatSettings)

      node.branch++
      if (node.branch === dice_2)
        nodes.pop()

      let depth = node.depth
      while (result.winner === undefined && depth < maxDepth) {
        depth++
        // Current node will be still used so the cache must be deep cloned.  
        // Branch starts at 1 because the current execution is 0.
        nodes.push({ status_a: copyStatus(units_a), status_d: copyStatus(units_d), branch: 1, depth })
        const [roll_a, roll_d] = rolls[0];
        participant_a.roll = roll_a
        participant_d.roll = roll_d
        participant_a.army = units_a
        participant_d.army = units_d
        result = doPhase(phaseLength, participant_a, participant_d, combatSettings)
      }
      sumState(current_a, participant_a.army)
      sumState(current_d, participant_d.army)
      updateCasualties(casualties, fractions[depth], total_a, total_d, current_a, current_d)
      result.round += (depth - 1) * phaseLength
      updateProgress(progress, fractions[depth], result)
    }
    if (!nodes.length || interruptSimulation)
      progress.progress = 1
    progressCallback(progress, casualties)
    if (nodes.length && !interruptSimulation)
      worker()
  }

  const worker = () => setTimeout(work, 0)
  worker()
}

const convertUnits = (units: BaseUnits, combatSettings: CombatSettings, casualties_multiplier: number, base_damages: number[], terrains: TerrainDefinition[], unit_types: UnitType[]) => ({
  frontline: units.frontline.map(unit => getCombatUnit(combatSettings, casualties_multiplier, base_damages, terrains, unit_types, unit as Unit)),
  reserve: units.reserve.map(unit => getCombatUnit(combatSettings, casualties_multiplier, base_damages, terrains, unit_types, unit as Unit)!),
  defeated: units.defeated.map(unit => getCombatUnit(combatSettings, casualties_multiplier, base_damages, terrains, unit_types, unit as Unit)!)
})

/**
 * Precalculates base damage values for each roll.
 */
const getBaseDamages = (combatSettings: CombatSettings, dice: number, modifier: number) => mapRange(dice + 1, roll => Math.min(combatSettings[CombatParameter.MaxBaseDamage], combatSettings[CombatParameter.BaseDamage] + combatSettings[CombatParameter.RollDamage] * (roll + modifier)))

/**
 * Returns a balanced set of rolls. Higher rolls are prioritized to give results faster.
 */
const getRolls = (minimum: number, maximum: number) => {
  const rolls: number[][] = []
  for (let roll = maximum; roll >= minimum; roll--) {
    rolls.push([roll, roll])
    for (let roll2 = roll - 1; roll2 >= minimum; roll2--) {
      rolls.push([roll2, roll])
      rolls.push([roll, roll2])
    }
  }
  return rolls
}

/**
 * Custom deep clone function. Probably could use Lodash but better safe than sorry (since performance is so critical).
 */
const copyStatus = (status: CombatUnits): CombatUnits => ({
  frontline: status.frontline.map(value => value ? { ...value } : null),
  reserve: status.reserve.map(value => ({ ...value })),
  defeated: status.defeated.map(value => ({ ...value }))
})

type Winner = Side | null | undefined

/**
 * Simulates one dice roll phase.
 */
const doPhase = (rounds_per_phase: number, attacker: CombatParticipant, defender: CombatParticipant, combatSettings: CombatSettings) => {
  let winner: Winner = undefined
  let round = 0
  for (round = 0; round < rounds_per_phase;) {
    doBattleFast(attacker, defender, combatSettings)
    round++

    const alive_a = checkAlive(attacker.army.frontline, attacker.army.reserve)
    const alive_d = checkAlive(defender.army.frontline, defender.army.reserve)
    if (!alive_a && !alive_d)
      winner = null
    if (alive_a && !alive_d)
      winner = Side.Attacker
    if (!alive_a && alive_d)
      winner = Side.Defender
    if (winner !== undefined)
      break
  }
  return { winner, round }
}

/**
 * Custom some function. Probably could use Lodash but better safe than sorry (since performance is so critical).
 */
const checkAlive = (frontline: Frontline, reserve: Reserve) => {
  if (reserve.length)
    return true
  for (let i = 0; i < frontline.length; i++) {
    if (frontline[i])
      return true
  }
  return false
}

type State = {
  morale: number
  strength: number
}

/**
 * Counts total morale and strength of units.
 */
const sumState = (state: State, units: CombatUnits) => {
  state.strength = 0
  state.morale = 0
  for (let i = 0; i < units.frontline.length; i++) {
    const unit = units.frontline[i]
    if (!unit)
      continue
    state.strength += unit[UnitCalc.Strength]
    state.morale += unit[UnitCalc.Morale]
  }
  for (let i = 0; i < units.reserve.length; i++) {
    const unit = units.reserve[i]
    state.strength += unit[UnitCalc.Strength]
    state.morale += unit[UnitCalc.Morale]
  }
  for (let i = 0; i < units.defeated.length; i++) {
    const unit = units.defeated[i]
    state.strength += unit[UnitCalc.Strength]
    state.morale += unit[UnitCalc.Morale]
  }
}

/**
 * Updates progress of the calculation.
 */
const updateProgress = (progress: WinRateProgress, amount: number, result: { winner: Winner, round: number }) => {
  const { winner, round } = result
  progress.progress += amount
  if (winner === Side.Attacker) {
    progress.attacker += amount
    progress.attacker_rounds += amount * round
  }
  else if (winner === Side.Defender) {
    progress.defender += amount
    progress.defender_rounds += amount * round
  }
  else if (winner === null)
    progress.draws += amount
  else
    progress.incomplete += amount
  progress.average_rounds += amount * round
  progress.rounds[round] = (progress.rounds[round] || 0) + amount
}

/**
 * Updates casualties of the calculation.
 */
const updateCasualties = (casualties: CasualtiesProgress, amount: number, total_a: State, total_d: State, current_a: State, current_d: State) => {
  casualties.avg_morale_a += (total_a.morale - current_a.morale) * amount
  casualties.avg_morale_d += (total_d.morale - current_d.morale) * amount
  casualties.avg_strength_a += (total_a.strength - current_a.strength) * amount
  casualties.avg_strength_d += (total_d.strength - current_d.strength) * amount

  const morale_a = (Math.max(0, current_a.morale) / total_a.morale).toFixed(2)
  const morale_d = (Math.max(0, current_d.morale) / total_d.morale).toFixed(2)
  const strength_a = (Math.max(0, current_a.strength) / total_a.strength).toFixed(2)
  const strength_d = (Math.max(0, current_d.strength) / total_d.strength).toFixed(2)
  casualties.morale_a[morale_a] =  (casualties.morale_a[morale_a] || 0) + amount
  casualties.morale_d[morale_d] =  (casualties.morale_d[morale_d] || 0) + amount
  casualties.strength_a[strength_a] =  (casualties.strength_a[strength_a] || 0) + amount
  casualties.strength_d[strength_d] =  (casualties.strength_d[strength_d] || 0) + amount
}