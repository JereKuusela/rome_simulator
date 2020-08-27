import { Setting, UnitAttribute, SideType, ResourceLosses, WinRateProgress, CasualtiesProgress, ResourceLossesProgress, Cohorts, CombatNode, Side, Environment, Frontline, Cohort, ArmyName, UnitDefinitions, UnitProperties } from 'types'
import { doCombatRound } from './combat'
import { mapRange, toObj } from 'utils'
import { deploy } from './deployment'

export const initResourceLosses = (): ResourceLosses => ({
  repairMaintenance: 0,
  destroyedCost: 0,
  capturedCost: 0,
  seizedCost: 0,
  seizedRepairMaintenance: 0,
})

const getParticipantIndexToProperties = (side: Side): { [key: number]: UnitProperties } => toObj(side.armies, army => army.participantIndex, army => army.unitProperties)

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
 * @param sideA Attacker information.
 * @param sideB Defender information.
 * @param terrains Current terrains.
 */
export const calculateWinRate = (progressCallback: (progress: WinRateProgress, casualties: CasualtiesProgress, losses: ResourceLossesProgress) => void, field: Environment, sideA: Side, sideB: Side) => {
  const progress: WinRateProgress = {
    calculating: true,
    attacker: 0.0,
    defender: 0.0,
    incomplete: 0.0,
    draws: 0.0,
    progress: 0.0,
    battles: 0,
    averageRounds: 0,
    stackWipes: 0,
    rounds: {}
  }
  interruptSimulation = false

  const settings = field.settings

  const lossesA = initResourceLosses()
  const lossesB = initResourceLosses()
  const resourceLosses: ResourceLossesProgress = { lossesA,  lossesB }
  const unitPropertiesA = getParticipantIndexToProperties(sideA)
  const unitPropertiesB = getParticipantIndexToProperties(sideB)

  //// Performance is critical. Precalculate as many things as possible.
  const rolls = getRolls(settings[Setting.DiceMinimum], settings[Setting.DiceMaximum], settings[Setting.ReduceRolls])
  const dice2 = rolls.length
  const phasesPerRoll = Math.floor(settings[Setting.PhasesPerRoll])
  const chunkSize = settings[Setting.ChunkSize]
  const maxPhase = settings[Setting.MaxPhases]
  const weights = mapRange(maxPhase + 1, value => 1.0 / Math.pow(dice2, value))

  const totalA: State = { morale: 0, strength: 0 }
  const currentA: State = { morale: 0, strength: 0 }
  sumState(totalA, sideA.cohorts)
  const totalB: State = { morale: 0, strength: 0 }
  const currentB: State = { morale: 0, strength: 0 }
  sumState(totalB, sideB.cohorts)

  const casualties: CasualtiesProgress = {
    avgMoraleA: 0,
    avgMoraleB: 0,
    avgStrengthA: 0,
    avgStrengthB: 0,
    maxMoraleA: totalA.morale,
    maxMoraleB: totalB.morale,
    maxStrengthA: totalA.strength,
    maxStrengthB: totalB.strength,
    moraleA: {},
    moraleB: {},
    strengthA: {},
    strengthB: {},
    winRateA: 0,
    winRateB: 0
  }

  // Initial deployment is shared for each iteration.
  doCombatRound(field, sideA, sideB, false)

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
  const nodes: CombatNode[] = [{ cohortsA: sideA.cohorts, cohortsB: sideB.cohorts, branchIndex: 0, combatPhase: 1, weightIndex: 1 }]

  progressCallback(progress, casualties, resourceLosses)

  const work = () => {
    for (let i = 0; (i < chunkSize) && nodes.length && !interruptSimulation; i++) {
      progress.battles = progress.battles + 1
      const node = nodes[nodes.length - 1]
      // Most of the data is expected to change, so it's better to deep clone which allows mutations.
      const cohortsA = copyCohortState(node.cohortsA)
      const cohortsB = copyCohortState(node.cohortsB)

      const [rollA, rollB] = rolls[node.branchIndex]
      sideA.results.dice = rollA
      sideB.results.dice = rollB
      sideA.cohorts = cohortsA
      sideB.cohorts = cohortsB
      let result = doPhase(field, sideA, sideB, node.combatPhase)

      let combatPhase = node.combatPhase
      let branchIndex = node.branchIndex
      let weightIndex = node.weightIndex

      node.branchIndex++
      if (node.branchIndex === dice2)
        nodes.pop()
      while (result.winner === undefined && combatPhase < maxPhase) {
        let doBranch = true
        if (combatPhase % phasesPerRoll === 1) {
          doBranch = false
        }
        combatPhase++
        // Current node will be still used so the cache must be deep cloned.  
        // Branch starts at 1 because the current execution is 0.
        if (doBranch && dice2 > 1) {
          branchIndex = 0
          weightIndex++
          nodes.push({ cohortsA: copyCohortState(cohortsA), cohortsB: copyCohortState(cohortsB), branchIndex: 1, combatPhase, weightIndex })
        }
        const [rollA, rollB] = rolls[branchIndex]
        sideA.results.dice = rollA
        sideB.results.dice = rollB
        sideA.cohorts = cohortsA
        sideB.cohorts = cohortsB
        result = doPhase(field, sideA, sideB, combatPhase)
      }
      sumState(currentA, sideA.cohorts)
      sumState(currentB, sideB.cohorts)
      if (settings[Setting.CalculateCasualties])
        updateCasualties(casualties, weights[weightIndex], totalA, totalB, currentA, currentB)
      if (settings[Setting.CalculateResourceLosses]) {
        calculateResourceLoss(sideA.cohorts.frontline, sideA.cohorts.defeated, weights[weightIndex], lossesA, lossesB, unitPropertiesB)
        calculateResourceLoss(sideB.cohorts.frontline, sideB.cohorts.defeated, weights[weightIndex], lossesB, lossesA, unitPropertiesA)
      }
      updateProgress(progress, weights[weightIndex], result, currentA.strength === 0 || currentB.strength === 0)
    }
    if (!nodes.length) {
      progress.calculating = false
      progress.progress = 1
    }
    if (interruptSimulation)
      progress.calculating = false
    progressCallback(progress, casualties, resourceLosses)
    if (nodes.length && !interruptSimulation)
      worker()
  }

  const worker = () => setTimeout(work, 0)
  worker()
}

/** Returns an array of valid dice numbers. */
const getValidRolls = (minimum: number, maximum: number, halveTimes: number) => {
  let validRolls = mapRange(maximum - minimum + 1, value => value + minimum)
  for (let i = 0; i < halveTimes; i++) {
    const length = validRolls.length
    if (length % 2)
      validRolls = validRolls.filter((_, index) => index % 2 === 0)
    else
      validRolls = validRolls.filter((_, index) => index < length / 2 ? index % 2 === 0 : (length - index) % 2 === 1)
  }
  return validRolls
}

/**
 * Returns a balanced set of rolls. Higher rolls are prioritized to give results faster.
 */
const getRolls = (minimum: number, maximum: number, halveTimes: number) => {
  let validRolls = getValidRolls(minimum, maximum, halveTimes)
  const rolls: number[][] = []
  for (let roll = maximum; roll >= minimum; roll--) {
    if (!validRolls.includes(roll))
      continue
    rolls.push([roll, roll])
    for (let roll2 = roll - 1; roll2 >= minimum; roll2--) {
      if (!validRolls.includes(roll2))
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
const copyCohortState = (status: Cohorts): Cohorts => ({
  frontline: status.frontline.map(row => row.map(value => value ? { ...value } : null)),
  reserve: {
    front: status.reserve.front.map(value => ({ ...value })),
    flank: status.reserve.flank.map(value => ({ ...value })),
    support: status.reserve.support.map(value => ({ ...value }))
  },
  defeated: status.defeated.map(value => ({ ...value })),
  retreated: status.retreated.map(value => ({ ...value }))
})

const REPAIR_PER_MONTH = 0.1

/**
 * Calculates repair and other resource losses.
 */
const calculateResourceLoss = (frontline: Frontline, defeated: Cohort[], amount: number, own: ResourceLosses, enemy: ResourceLosses, enemyDefinitions: { [key: number]: UnitProperties }) => {
  for (let i = 0; i < frontline.length; i++) {
    for (let j = 0; j < frontline[i].length; j++) {
      const cohort = frontline[i][j]
      if (!cohort)
        continue
      own.repairMaintenance += amount * (cohort.properties.maxStrength - cohort[UnitAttribute.Strength]) * cohort.properties[UnitAttribute.Maintenance] * cohort.properties[UnitAttribute.Cost] / REPAIR_PER_MONTH
    }
  }
  for (let i = 0; i < defeated.length; i++) {
    const cohort = defeated[i]
    const enemyCohort = cohort.state.defeatedBy
    if (!enemyCohort) {
      throw 'Defeated should always get defeated by something.'
    }
    const unitCost = amount * cohort.properties[UnitAttribute.Cost]
    if (cohort.state.isDestroyed) {
      own.destroyedCost += unitCost
      continue
    }
    const capture = (cohort.state.captureChance ?? 0.0)
    const repair = (cohort.properties.maxStrength - cohort[UnitAttribute.Strength]) * cohort.properties[UnitAttribute.Maintenance] * unitCost / REPAIR_PER_MONTH
    if (capture <= 0.0) {
      own.repairMaintenance += repair
      continue
    }
    // If captured then the unit doesn't have to be repaired.
    own.repairMaintenance += (1 - capture) * repair
    // If captured then the full cost of unit is lost.
    own.capturedCost += capture * unitCost
    const enemyProperties = enemyDefinitions[enemyCohort.properties.participantIndex][cohort.properties.type]
    const enemyUnitCost = amount * (cohort.properties[UnitAttribute.Cost] - cohort.properties[UnitAttribute.Cost] + enemyProperties[UnitAttribute.Cost])
    const enemyRepairCost = (cohort.properties.maxStrength - cohort[UnitAttribute.Strength]) * (cohort.properties[UnitAttribute.Maintenance] - cohort.properties[UnitAttribute.Maintenance] + enemyProperties[UnitAttribute.Maintenance]) * enemyUnitCost / REPAIR_PER_MONTH
    // If captured then the enemy gainst full cost of the unit.
    enemy.seizedCost -= capture * enemyUnitCost
    // But enemy also has to repair the unit.
    enemy.seizedRepairMaintenance += capture * enemyRepairCost
  }
}

type Winner = SideType | null | undefined

/**
 * Simulates one dice roll phase.
 */
const doPhase = (field: Environment, attacker: Side, defender: Side, phase: number) => {
  let winner: Winner = undefined
  const phaseLength = field.settings[Setting.PhaseLength]
  const maxRound = phase * phaseLength
  let round = (phase - 1) * phaseLength + 1
  for (; round <= maxRound; round++) {
    field.day = round
    doCombatRound(field, attacker, defender, false)
    if (!attacker.armiesRemaining && !defender.armiesRemaining)
      winner = null
    else if (!attacker.armiesRemaining)
      winner = SideType.B
    else if (!defender.armiesRemaining)
      winner = SideType.A
    // Custom check to prevent round going over phase limit.
    if (winner !== undefined || round === maxRound)
      break
  }
  if (round > maxRound)
    console.log('danger')
  return { winner, round }
}

type State = {
  morale: number
  strength: number
}

/**
 * Counts total morale and strength of units.
 */
const sumState = (state: State, units: Cohorts) => {
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
const updateProgress = (progress: WinRateProgress, amount: number, result: { winner: Winner, round: number }, stackWipe: boolean) => {
  const { winner, round } = result
  progress.progress += amount
  if (winner === SideType.A)
    progress.attacker += amount
  else if (winner === SideType.B)
    progress.defender += amount
  else if (winner === null)
    progress.draws += amount
  else
    progress.incomplete += amount
  if (stackWipe)
    progress.stackWipes += amount
  progress.averageRounds += amount * round
  progress.rounds[round] = (progress.rounds[round] || 0) + amount
}

/**
 * Updates casualties of the calculation.
 */
const updateCasualties = (casualties: CasualtiesProgress, amount: number, totalA: State, totalD: State, currentA: State, currentD: State) => {
  const lossA = totalA.strength - currentA.strength
  const lossB = totalD.strength - currentD.strength
  casualties.avgMoraleA += (totalA.morale - currentA.morale) * amount
  casualties.avgMoraleB += (totalD.morale - currentD.morale) * amount
  casualties.avgStrengthA += lossA * amount
  casualties.avgStrengthB += lossB * amount
  if (lossA < lossB)
    casualties.winRateA += amount
  if (lossA > lossB)
    casualties.winRateB += amount

  const moraleA = (Math.max(0, currentA.morale)).toFixed(1)
  const moraleB = (Math.max(0, currentD.morale)).toFixed(1)
  const strengthA = (Math.max(0, currentA.strength)).toFixed(2)
  const strengthB = (Math.max(0, currentD.strength)).toFixed(2)
  casualties.moraleA[moraleA] = (casualties.moraleA[moraleA] || 0) + amount
  casualties.moraleB[moraleB] = (casualties.moraleB[moraleB] || 0) + amount
  casualties.strengthA[strengthA] = (casualties.strengthA[strengthA] || 0) + amount
  casualties.strengthB[strengthB] = (casualties.strengthB[strengthB] || 0) + amount
}