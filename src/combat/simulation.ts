import { Units, Unit } from "../store/units"
import { TerrainDefinition } from "../store/terrains"
import { CombatSettings, CombatParameter, SimulationSettings, SimulationParameter } from "../store/settings"
import { Side } from "../store/battle"

import { doBattleFast, StaticLine, DynamicLine, getStaticUnit, getDynamicUnit, ParticipantState } from "./combat_fast"
import { doBattle } from "./combat"

import { mapRange } from "../utils"

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
export const calculateWinRate = (simulationSettings: SimulationSettings, progressCallback: (progress: WinRateProgress) => void, definitions: Units, attacker: ParticipantState, defender: ParticipantState, terrains: TerrainDefinition[], combatSettings: CombatSettings) => {
  const progress: WinRateProgress = {
    attacker: 0.0,
    defender: 0.0,
    draws: 0.0,
    incomplete: 0.0,
    progress: 0.0,
    iterations: 0
  }
  interruptSimulation = false

  // Performance is critical. Precalculate as many things as possible.
  const dice = combatSettings[CombatParameter.DiceMaximum] - combatSettings[CombatParameter.DiceMinimum] + 1
  const dice_2 = dice * dice
  const rolls = getRolls(combatSettings[CombatParameter.DiceMinimum], combatSettings[CombatParameter.DiceMaximum])
  const fractions = mapRange(10, value => 1.0 / Math.pow(dice_2, value))
  const phaseLength = Math.floor(combatSettings[CombatParameter.RollFrequency] * simulationSettings[SimulationParameter.PhaseLengthMultiplier])
  const chunkSize = simulationSettings[SimulationParameter.ChunkSize]
  const maxDepth = simulationSettings[SimulationParameter.MaxDepth]

  // Deployment is shared for each iteration.
  const [a, d] = doBattle(definitions, attacker, defender, 0, terrains, combatSettings)
  const orig_a = a.frontline.map(unit => getStaticUnit(unit as Unit))
  const orig_d = d.frontline.map(unit => getStaticUnit(unit as Unit))
  const status_a = a.frontline.map(unit => getDynamicUnit(unit as Unit))
  const status_d = d.frontline.map(unit => getDynamicUnit(unit as Unit))


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
      let winner = doPhase(phaseLength, units_a, orig_a, units_d, orig_d, roll_a, roll_d, terrains, combatSettings)

      node.branch++
      if (node.branch === dice_2)
        nodes.pop()

      let depth = node.depth
      while (winner === undefined && depth < maxDepth) {
        depth++
        // Current node will be still used so the cache must be deep cloned.  
        // Branch starts at 1 because the current execution is 0.
        nodes.push({ status_a: copyStatus(units_a), status_d: copyStatus(units_d), branch: 1, depth })
        const [roll_a, roll_d] = rolls[0]
        winner = doPhase(phaseLength, units_a, orig_a, units_d, orig_d, roll_a, roll_d, terrains, combatSettings)
      }
      updateProgress(progress, fractions[depth], winner)
    }
    if (!nodes.length || interruptSimulation)
      progress.progress = 1
    progressCallback(progress)
    if (nodes.length && !interruptSimulation)
      worker()
  }

  const worker = () => setTimeout(work, 0)
  worker()
}

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
const copyStatus = (status: DynamicLine): DynamicLine => status.map(value => value ? { ...value } : null)

type Winner = Side | null | undefined

/**
 * Simulates one dice roll phase.
 */
const doPhase = (rounds: number, units_a: DynamicLine, orig_a: StaticLine, units_d: DynamicLine, orig_d: StaticLine, roll_a: number, roll_d: number, terrains: TerrainDefinition[], combatSettings: CombatSettings) => {
  let winner: Winner = undefined
  for (let round = 0; round < rounds; round++) {
    doBattleFast(units_a, units_d, orig_a, orig_d, roll_a, roll_d, terrains, combatSettings)

    const alive_a = checkAlive(units_a)
    const alive_d = checkAlive(units_d)
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

/**
 * Custom some function. Probably could use Lodash but better safe than sorry (since performance is so critical).
 */
const checkAlive = (units: DynamicLine) => {
  for (let i = 0; i < units.length; i++) {
    if (units[i])
      return true
  }
  return false
}

/**
 * Updates progress of the calculation.
 */
const updateProgress = (progress: WinRateProgress, amount: number, winner: Winner) => {
  progress.progress += amount
  if (winner === Side.Attacker)
    progress.attacker += amount
  else if (winner === Side.Defender)
    progress.defender += amount
  else if (winner === null)
    progress.draws += amount
  else
    progress.incomplete += amount
}
