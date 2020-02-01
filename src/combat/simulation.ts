import { ArmyForCombat } from 'state'
import { TerrainDefinition, UnitType, Setting, TacticCalc, BaseUnits, Unit, UnitCalc, Side, Settings } from 'types'
import { calculateTotalRoll } from './combat_utils'
import { calculateValue } from 'definition_values'
import { CombatParticipant, getCombatUnit, CombatUnits, Frontline, Defeated, doBattleFast, Reserve, getUnitDefinition, CombatUnitTypes } from './combat'
import { mapRange, map } from 'utils'
import { deploy } from './deployment'

/**
 * Status of the win rate calculation. Most values are percents, only iterations is integer.
 */
export interface WinRateProgress {
  calculating: boolean
  attacker: number
  defender: number
  draws: number
  incomplete: number
  progress: number
  iterations: number
  average_rounds: number,
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

export interface ResourceLossesProgress {
  losses_a: ResourceLosses
  losses_d: ResourceLosses
}

export const initResourceLosses = (): ResourceLosses => ({
  repair_maintenance: 0,
  destroyed_cost: 0,
  captured_cost: 0,
  seized_cost :0,
  seized_repair_maintenance: 0,
})

export type ResourceLosses = {
  repair_maintenance: number
  destroyed_cost: number
  captured_cost: number
  seized_cost :number
  seized_repair_maintenance: number
}

let interruptSimulation = false


export const doConversion = (attacker: ArmyForCombat, defender: ArmyForCombat, terrains: TerrainDefinition[], unit_types: UnitType[], settings: Settings) => {
  const dice = settings[Setting.DiceMaximum] - settings[Setting.DiceMinimum] + 1
  const base_damages_a = getBaseDamages(settings, dice, calculateTotalRoll(0, terrains, attacker.general, defender.general))
  const base_damages_d = getBaseDamages(settings, dice, calculateTotalRoll(0, [], defender.general, attacker.general))
  const tactic_casualties = calculateValue(attacker.tactic, TacticCalc.Casualties) + calculateValue(defender.tactic, TacticCalc.Casualties)
  const status_a = convertUnits(attacker, settings, tactic_casualties, base_damages_a, terrains, unit_types)
  const status_d = convertUnits(defender, settings, tactic_casualties, base_damages_d, terrains, unit_types)
  const participant_a: CombatParticipant = {
    army: status_a,
    roll: 0,
    flank: attacker.flank_size,
    tactic: attacker.tactic!,
    unit_preferences: attacker.unit_preferences,
    unit_types: map(attacker.definitions, unit => getUnitDefinition(settings, terrains, unit_types, { ...unit, id: -1 }))
  }
  const participant_d: CombatParticipant = {
    army: status_d,
    roll: 0,
    flank: defender.flank_size,
    tactic: defender.tactic!,
    unit_preferences: defender.unit_preferences,
    unit_types: map(defender.definitions, unit => getUnitDefinition(settings, terrains, unit_types, { ...unit, id: -1 }))
  }
  return [participant_a, participant_d]
}

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
    draws: 0.0,
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
  const dice = settings[Setting.DiceMaximum] - settings[Setting.DiceMinimum] + 1
  const dice_2 = dice * dice
  const rolls = getRolls(settings[Setting.DiceMinimum], settings[Setting.DiceMaximum])
  const fractions = mapRange(10, value => 1.0 / Math.pow(dice_2, value))
  const phaseLength = Math.floor(settings[Setting.RollFrequency] * settings[Setting.PhaseLengthMultiplier])
  const chunkSize = settings[Setting.ChunkSize]
  const maxDepth = settings[Setting.MaxDepth]

  // Deployment is shared for each iteration.
  deploy(attacker, defender, settings)

  const total_a: State = { morale: 0, strength: 0 }
  const current_a: State = { morale: 0, strength: 0 }
  sumState(total_a, attacker.army)
  const total_d: State = { morale: 0, strength: 0 }
  const current_d: State = { morale: 0, strength: 0 }
  sumState(total_d, defender.army)

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
  const nodes = [{ status_a: attacker.army, status_d: defender.army, branch: 0, depth: 1 }]

  progressCallback(progress, casualties, resurce_losses)

  const work = () => {
    for (let i = 0; (i < chunkSize) && nodes.length && !interruptSimulation; i++) {
      progress.iterations = progress.iterations + 1
      const node = nodes[nodes.length - 1]
      // Most of the data is expected to change, so it's better to deep clone which allows mutations.
      const units_a = copyStatus(node.status_a)
      const units_d = copyStatus(node.status_d)

      const [roll_a, roll_d] = rolls[node.branch]
      attacker.roll = roll_a
      defender.roll = roll_d
      attacker.army = units_a
      defender.army = units_d
      let result = doPhase(phaseLength, attacker, defender, settings)

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
        attacker.roll = roll_a
        defender.roll = roll_d
        attacker.army = units_a
        defender.army = units_d
        result = doPhase(phaseLength, attacker, defender, settings)
      }
      sumState(current_a, attacker.army)
      sumState(current_d, defender.army)
      if (settings[Setting.CalculateCasualties])
        updateCasualties(casualties, fractions[depth], total_a, total_d, current_a, current_d)
      if (settings[Setting.CalculateResourceLosses]) {
        calculateResourceLoss(attacker.army.frontline, attacker.army.defeated, fractions[depth], losses_a, losses_d, attacker.unit_types, defender.unit_types)
        calculateResourceLoss(defender.army.frontline, defender.army.defeated, fractions[depth], losses_d, losses_a, defender.unit_types, attacker.unit_types)
      }
      result.round += (depth - 1) * phaseLength
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

export const convertUnits = (units: BaseUnits, settings: Settings, casualties_multiplier: number, base_damages: number[], terrains: TerrainDefinition[], unit_types: UnitType[]) => ({
  frontline: units.frontline.map(unit => getCombatUnit(settings, casualties_multiplier, base_damages, terrains, unit_types, unit as Unit)),
  reserve: units.reserve.map(unit => getCombatUnit(settings, casualties_multiplier, base_damages, terrains, unit_types, unit as Unit)!),
  defeated: units.defeated.map(unit => getCombatUnit(settings, casualties_multiplier, base_damages, terrains, unit_types, unit as Unit)!),
  tactic_bonus: 0
})


/**
 * Precalculates base damage values for each roll.
 */
export const getBaseDamages = (settings: Settings, dice: number, modifier: number) => mapRange(dice + 1, roll => Math.min(settings[Setting.MaxBaseDamage], settings[Setting.BaseDamage] + settings[Setting.RollDamage] * (roll + modifier)))

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
 * Custom clone function to only copy state and keep references to constant data same.
 */
const copyStatus = (status: CombatUnits): CombatUnits => ({
  frontline: status.frontline.map(value => value ? { ...value } : null),
  reserve: status.reserve.map(value => ({ ...value })),
  defeated: status.defeated.map(value => ({ ...value })),
  tactic_bonus: status.tactic_bonus
})

const REPAIR_PER_MONTH = 0.1

/**
 * Calculates repair and other resource losses.
 */
const calculateResourceLoss = (frontline: Frontline, defeated: Defeated, amount: number, own: ResourceLosses, enemy: ResourceLosses, own_types: CombatUnitTypes, enemy_types: CombatUnitTypes) => {
  for (let i = 0; i < frontline.length; i++) {
    const unit = frontline[i]
    if (!unit)
      continue
    own.repair_maintenance += amount * (unit.definition.max_strength - unit[UnitCalc.Strength]) * unit.definition[UnitCalc.Maintenance] * unit.definition[UnitCalc.Cost] / REPAIR_PER_MONTH
  }
  for (let i = 0; i < defeated.length; i++) {
    const unit = defeated[i]
    const unit_cost = amount * unit.definition[UnitCalc.Cost]
    if (unit.state.is_destroyed) {
      own.destroyed_cost += unit_cost
      continue
    }
    const capture = (unit.state.capture_chance ?? 0.0) - unit.definition[UnitCalc.CaptureResist]
    const repair = (unit.definition.max_strength - unit[UnitCalc.Strength]) * unit.definition[UnitCalc.Maintenance] * unit_cost / REPAIR_PER_MONTH
    if (capture <= 0.0) {
      own.repair_maintenance += repair
      continue
    }
    // If captured then the unit doesn't have to be repaired.
    own.repair_maintenance += (1 - capture) * repair
    // If captured then the full cost of unit is lost.
    own.captured_cost += capture * unit_cost
    const enemy_unit_cost = amount * (unit.definition[UnitCalc.Cost] - own_types[unit.definition.type][UnitCalc.Cost] + enemy_types[unit.definition.type][UnitCalc.Cost])
    const enemy_repair = (unit.definition.max_strength - unit[UnitCalc.Strength]) * (unit.definition[UnitCalc.Maintenance] - own_types[unit.definition.type][UnitCalc.Maintenance] + enemy_types[unit.definition.type][UnitCalc.Maintenance]) * enemy_unit_cost / REPAIR_PER_MONTH
    // If captured then the enemy gainst full cost of the unit.
    enemy.seized_cost -= capture * enemy_unit_cost
    // But enemy also has to repair the unit.
    enemy.seized_repair_maintenance += capture * enemy_repair
  }
}


type Winner = Side | null | undefined

/**
 * Simulates one dice roll phase.
 */
const doPhase = (rounds_per_phase: number, attacker: CombatParticipant, defender: CombatParticipant, settings: Settings) => {
  let winner: Winner = undefined
  let round = 0
  for (round = 0; round < rounds_per_phase;) {
    doBattleFast(attacker, defender, false, settings)
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
  if (winner === Side.Attacker)
    progress.attacker += amount
  else if (winner === Side.Defender)
    progress.defender += amount
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

  const morale_a = (Math.max(0, current_a.morale)).toFixed(1)
  const morale_d = (Math.max(0, current_d.morale)).toFixed(1)
  const strength_a = (Math.max(0, current_a.strength)).toFixed(2)
  const strength_d = (Math.max(0, current_d.strength)).toFixed(2)
  casualties.morale_a[morale_a] = (casualties.morale_a[morale_a] || 0) + amount
  casualties.morale_d[morale_d] = (casualties.morale_d[morale_d] || 0) + amount
  casualties.strength_a[strength_a] = (casualties.strength_a[strength_a] || 0) + amount
  casualties.strength_d[strength_d] = (casualties.strength_d[strength_d] || 0) + amount
}