import { Setting, UnitAttribute, Side, Settings, ResourceLosses, WinRateProgress, CasualtiesProgress, ResourceLossesProgress, CombatParticipant, CombatCohorts, CombatUnitTypes, CombatFrontline, CombatDefeated } from 'types'
import { doBattle } from './combat'
import { mapRange } from 'utils'
import { deploy } from './deployment'

export const initResourceLosses = (): ResourceLosses => ({
  repair_maintenance: 0,
  destroyed_cost: 0,
  captured_cost: 0,
  seized_cost: 0,
  seized_repair_maintenance: 0,
})

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
 */
export const calculateWinRate = (settings: Settings, progressCallback: (progress: WinRateProgress, casualties: CasualtiesProgress, losses: ResourceLossesProgress) => void, attacker: CombatParticipant, defender: CombatParticipant) => {
  const progress: WinRateProgress = {
    calculating: true,
    attacker: 0.0,
    defender: 0.0,
    incomplete: 0.0,
    progress: 0.0,
    iterations: 0,
    average_rounds: 0,
    rounds: {}
  }
  interruptSimulation = false

  const losses_a = initResourceLosses()
  const losses_d = initResourceLosses()
  const resurce_losses: ResourceLossesProgress = {
    losses_a,
    losses_d
  }

  // Performance is critical. Precalculate as many things as possible.
  const rolls = getRolls(settings[Setting.DiceMinimum], settings[Setting.DiceMaximum], settings[Setting.ReduceRolls])
  const dice_2 = rolls.length
  const phaseLength = Math.floor(settings[Setting.RollFrequency] * settings[Setting.PhaseLengthMultiplier])
  const chunkSize = settings[Setting.ChunkSize]
  const maxDepth = settings[Setting.MaxDepth]
  const fractions = mapRange(maxDepth + 1, value => 1.0 / Math.pow(dice_2, value))

  const total_a: State = { morale: 0, strength: 0 }
  const current_a: State = { morale: 0, strength: 0 }
  sumState(total_a, attacker.cohorts)
  const total_d: State = { morale: 0, strength: 0 }
  const current_d: State = { morale: 0, strength: 0 }
  sumState(total_d, defender.cohorts)

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

  // Deployment is shared for each iteration.
  deploy(attacker, defender, settings)

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
  const nodes = [{ status_a: attacker.cohorts, status_d: defender.cohorts, branch: 0, depth: 1 }]

  progressCallback(progress, casualties, resurce_losses)

  const work = () => {
    for (let i = 0; (i < chunkSize) && nodes.length && !interruptSimulation; i++) {
      progress.iterations = progress.iterations + 1
      const node = nodes[nodes.length - 1]
      // Most of the data is expected to change, so it's better to deep clone which allows mutations.
      const cohorts_a = copyStatus(node.status_a)
      const cohorts_d = copyStatus(node.status_d)

      const [roll_a, roll_d] = rolls[node.branch]
      attacker.dice = roll_a
      defender.dice = roll_d
      attacker.cohorts = cohorts_a
      defender.cohorts = cohorts_d
      let result = doPhase(node.depth, phaseLength, attacker, defender, settings)

      node.branch++
      if (node.branch === dice_2)
        nodes.pop()

      let depth = node.depth
      while (result.winner === undefined && depth < maxDepth) {
        depth++
        // Current node will be still used so the cache must be deep cloned.  
        // Branch starts at 1 because the current execution is 0.
        if (dice_2 > 1)
          nodes.push({ status_a: copyStatus(cohorts_a), status_d: copyStatus(cohorts_d), branch: 1, depth })
        const [roll_a, roll_d] = rolls[0]
        attacker.dice = roll_a
        defender.dice = roll_d
        attacker.cohorts = cohorts_a
        defender.cohorts = cohorts_d
        result = doPhase(depth, phaseLength, attacker, defender, settings)
      }
      sumState(current_a, attacker.cohorts)
      sumState(current_d, defender.cohorts)
      if (settings[Setting.CalculateCasualties])
        updateCasualties(casualties, fractions[depth], total_a, total_d, current_a, current_d)
      if (settings[Setting.CalculateResourceLosses]) {
        calculateResourceLoss(attacker.cohorts.frontline, attacker.cohorts.defeated, fractions[depth], losses_a, losses_d, attacker.unit_types, defender.unit_types)
        calculateResourceLoss(defender.cohorts.frontline, defender.cohorts.defeated, fractions[depth], losses_d, losses_a, defender.unit_types, attacker.unit_types)
      }
      updateProgress(progress, fractions[depth], result)
    }
    if (!nodes.length) {
      progress.calculating = false
      progress.progress = 1
    }
    if (interruptSimulation)
      progress.calculating = false
    progressCallback(progress, casualties, resurce_losses)
    if (nodes.length && !interruptSimulation)
      worker()
  }

  const worker = () => setTimeout(work, 0)
  worker()
}

/** Returns an array of valid dice numbers. */
const getValidRolls = (minimum: number, maximum: number, halve_times: number) => {
  let valid_rolls = mapRange(maximum - minimum + 1, value => value + 1)
  for (let i = 0; i < halve_times; i++) {
    const length = valid_rolls.length
    if (length % 2)
      valid_rolls = valid_rolls.filter((_, index) => index % 2 === 0)
    else
      valid_rolls = valid_rolls.filter((_, index) => index < length / 2 ? index % 2 === 0 : (length - index) % 2 === 1)
  }
  return valid_rolls
}

/**
 * Returns a balanced set of rolls. Higher rolls are prioritized to give results faster.
 */
const getRolls = (minimum: number, maximum: number, halve_times: number) => {
  let valid_rolls = getValidRolls(minimum, maximum, halve_times)
  const rolls: number[][] = []
  for (let roll = maximum; roll >= minimum; roll--) {
    if (!valid_rolls.includes(roll))
      continue
    rolls.push([roll, roll])
    for (let roll2 = roll - 1; roll2 >= minimum; roll2--) {
      if (!valid_rolls.includes(roll2))
        continue
      rolls.push([roll2, roll])
      rolls.push([roll, roll2])
    }
  }
  return rolls
}

/**
 * Custom clone function to only copy state and keep references to constant data same.
 */
const copyStatus = (status: CombatCohorts): CombatCohorts => ({
  frontline: status.frontline.map(row => row.map(value => value ? { ...value } : null)),
  reserve: {
    front: status.reserve.front.map(value => ({ ...value })),
    flank: status.reserve.flank.map(value => ({ ...value })),
    support: status.reserve.support.map(value => ({ ...value }))
  },
  defeated: status.defeated.map(value => ({ ...value })),
  left_flank: status.left_flank,
  right_flank: status.right_flank
})

const REPAIR_PER_MONTH = 0.1

/**
 * Calculates repair and other resource losses.
 */
const calculateResourceLoss = (frontline: CombatFrontline, defeated: CombatDefeated, amount: number, own: ResourceLosses, enemy: ResourceLosses, own_types: CombatUnitTypes, enemy_types: CombatUnitTypes) => {
  for (let i = 0; i < frontline.length; i++) {
    for (let j = 0; j < frontline[i].length; j++) {
      const unit = frontline[i][j]
      if (!unit)
        continue
      own.repair_maintenance += amount * (unit.definition.max_strength - unit[UnitAttribute.Strength]) * unit.definition[UnitAttribute.Maintenance] * unit.definition[UnitAttribute.Cost] / REPAIR_PER_MONTH
    }
  }
  for (let i = 0; i < defeated.length; i++) {
    const unit = defeated[i]
    const unit_cost = amount * unit.definition[UnitAttribute.Cost]
    if (unit.state.is_destroyed) {
      own.destroyed_cost += unit_cost
      continue
    }
    const capture = (unit.state.capture_chance ?? 0.0) - unit.definition[UnitAttribute.CaptureResist]
    const repair = (unit.definition.max_strength - unit[UnitAttribute.Strength]) * unit.definition[UnitAttribute.Maintenance] * unit_cost / REPAIR_PER_MONTH
    if (capture <= 0.0) {
      own.repair_maintenance += repair
      continue
    }
    // If captured then the unit doesn't have to be repaired.
    own.repair_maintenance += (1 - capture) * repair
    // If captured then the full cost of unit is lost.
    own.captured_cost += capture * unit_cost
    const enemy_unit_cost = amount * (unit.definition[UnitAttribute.Cost] - own_types[unit.definition.type][UnitAttribute.Cost] + enemy_types[unit.definition.type][UnitAttribute.Cost])
    const enemy_repair = (unit.definition.max_strength - unit[UnitAttribute.Strength]) * (unit.definition[UnitAttribute.Maintenance] - own_types[unit.definition.type][UnitAttribute.Maintenance] + enemy_types[unit.definition.type][UnitAttribute.Maintenance]) * enemy_unit_cost / REPAIR_PER_MONTH
    // If captured then the enemy gainst full cost of the unit.
    enemy.seized_cost -= capture * enemy_unit_cost
    // But enemy also has to repair the unit.
    enemy.seized_repair_maintenance += capture * enemy_repair
  }
}


type Winner = Side | undefined

/**
 * Simulates one dice roll phase.
 */
const doPhase = (depth: number, rounds_per_phase: number, attacker: CombatParticipant, defender: CombatParticipant, settings: Settings) => {
  let winner: Winner = undefined
  let round = 1
  for (; round <= rounds_per_phase; round++) {
    doBattle(attacker, defender, false, settings, round + (depth - 1) * rounds_per_phase)
    if (!defender.alive)
      winner = Side.Attacker
    else if (!attacker.alive)
      winner = Side.Defender
    // Custom check to prevent round going over phase limit.
    if (winner !== undefined || round === rounds_per_phase)
      break
  }
  return { winner, round: round + (depth - 1) * rounds_per_phase }
}

type State = {
  morale: number
  strength: number
}

/**
 * Counts total morale and strength of units.
 */
const sumState = (state: State, units: CombatCohorts) => {
  state.strength = 0
  state.morale = 0
  for (let i = 0; i < units.frontline.length; i++) {
    for (let j = 0; j < units.frontline[i].length; j++) {
      const unit = units.frontline[i][j]
      if (!unit)
        continue
      state.strength += unit[UnitAttribute.Strength]
      state.morale += unit[UnitAttribute.Morale]
    }
  }
  for (let i = 0; i < units.reserve.front.length; i++) {
    const unit = units.reserve.front[i]
    state.strength += unit[UnitAttribute.Strength]
    state.morale += unit[UnitAttribute.Morale]
  }
  for (let i = 0; i < units.reserve.flank.length; i++) {
    const unit = units.reserve.flank[i]
    state.strength += unit[UnitAttribute.Strength]
    state.morale += unit[UnitAttribute.Morale]
  }
  for (let i = 0; i < units.reserve.support.length; i++) {
    const unit = units.reserve.support[i]
    state.strength += unit[UnitAttribute.Strength]
    state.morale += unit[UnitAttribute.Morale]
  }
  for (let i = 0; i < units.defeated.length; i++) {
    const unit = units.defeated[i]
    state.strength += unit[UnitAttribute.Strength]
    state.morale += unit[UnitAttribute.Morale]
  }
}

/**
 * Updates progress of the calculation.
 */
const updateProgress = (progress: WinRateProgress, amount: number, result: { winner: Winner, round: number }) => {
  const { winner, round } = result
  progress.progress += amount
  if (winner === Side.Attacker)
    progress.attacker += amount
  else if (winner === Side.Defender)
    progress.defender += amount
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

  const morale_a = (Math.max(0, current_a.morale)).toFixed(1)
  const morale_d = (Math.max(0, current_d.morale)).toFixed(1)
  const strength_a = (Math.max(0, current_a.strength)).toFixed(2)
  const strength_d = (Math.max(0, current_d.strength)).toFixed(2)
  casualties.morale_a[morale_a] = (casualties.morale_a[morale_a] || 0) + amount
  casualties.morale_d[morale_d] = (casualties.morale_d[morale_d] || 0) + amount
  casualties.strength_a[strength_a] = (casualties.strength_a[strength_a] || 0) + amount
  casualties.strength_d[strength_d] = (casualties.strength_d[strength_d] || 0) + amount
}