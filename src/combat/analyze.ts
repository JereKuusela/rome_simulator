import { Setting, UnitAttribute, SideType, ResourceLosses, WinRateProgress, CasualtiesProgress, ResourceLossesProgress, Cohorts, CombatNode, Side, Environment, Frontline, Cohort, ArmyName, UnitDefinitions, UnitProperties, Reserve, Army } from 'types'
import { doCombatRound } from './combat'
import { mapRange, toObj } from 'utils'
import { getConfig } from 'data/config'

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

const createCombatNode = (environment: Environment, sideA: Side, sideB: Side, branchIndex: number = 0, combatPhase: number = 1, weightIndex: number = 1) => ({
  cohortsA: copyCohortState(sideA.cohorts), deployedA: copyArmiesState(sideA.deployed), armiesA: copyArmiesState(sideA.armies),
  cohortsB: copyCohortState(sideB.cohorts), deployedB: copyArmiesState(sideB.deployed), armiesB: copyArmiesState(sideB.armies),
  branchIndex, combatPhase, weightIndex, round: environment.round, day: environment.day, attacker: environment.attacker
})

const updateFromCombatNode = (node: CombatNode, environment: Environment, sideA: Side, sideB: Side) => {
  environment.day = node.day
  environment.attacker = node.attacker
  environment.round = node.round
  // Most of the data is expected to change, so it's better to deep clone which allows mutations.
  sideA.cohorts = copyCohortState(node.cohortsA)
  sideA.deployed = copyArmiesState(node.deployedA)
  sideA.armies = copyArmiesState(node.armiesA)
  sideB.cohorts = copyCohortState(node.cohortsB)
  sideB.deployed = copyArmiesState(node.deployedB)
  sideB.armies = copyArmiesState(node.armiesB)
}

/**
 * Calculates win rate for the given battle.
 * @param simulationSettings Settings for simulation accuracy and performance.
 * @param progressCallback Callback to receive progress updates.
 * @param definitions Unit definitions.
 * @param sideA Attacker information.
 * @param sideB Defender information.
 * @param terrains Current terrains.
 */
export const calculateWinRate = (progressCallback: (progress: WinRateProgress, casualties: CasualtiesProgress, losses: ResourceLossesProgress) => void, environment: Environment, sideA: Side, sideB: Side) => {
  const progress: WinRateProgress = {
    calculating: true,
    attacker: 0.0,
    defender: 0.0,
    incomplete: 0.0,
    draws: 0.0,
    progress: 0.0,
    battles: 0,
    averageDays: 0,
    stackWipes: 0,
    days: {}
  }
  interruptSimulation = false
  const settings = environment.settings

  const lossesA = initResourceLosses()
  const lossesB = initResourceLosses()
  const resourceLosses: ResourceLossesProgress = { lossesA, lossesB }
  const unitPropertiesA = getParticipantIndexToProperties(sideA)
  const unitPropertiesB = getParticipantIndexToProperties(sideB)

  //// Performance is critical. Precalculate as many things as possible.
  const rolls = getRolls(settings[Setting.DiceMinimum], settings[Setting.DiceMaximum], settings[Setting.ReduceRolls])
  const dice2 = rolls.length
  const phasesPerRoll = Math.floor(settings[Setting.PhasesPerRoll])
  const chunkSize = settings[Setting.ChunkSize]
  const maxPhase = settings[Setting.MaxPhases]
  const weights = mapRange(maxPhase + 1, value => 1.0 / Math.pow(dice2, value))


  // Simulation is always done from the beginning.
  environment.day = 0
  environment.round = -1
  // Initial deployment is shared for each iteration.
  doCombatRound(environment, sideA, sideB, false)
  const totalA: State = { morale: 0, strength: 0 }
  const currentA: State = { morale: 0, strength: 0 }
  sumState(totalA, sideA)
  const totalB: State = { morale: 0, strength: 0 }
  const currentB: State = { morale: 0, strength: 0 }
  sumState(totalB, sideB)
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
  const nodes: CombatNode[] = [createCombatNode(environment, sideA, sideB)]

  progressCallback(progress, casualties, resourceLosses)

  const work = () => {
    for (let i = 0; (i < chunkSize) && nodes.length && !interruptSimulation; i++) {
      progress.battles = progress.battles + 1
      const node = nodes[nodes.length - 1]
      updateFromCombatNode(node, environment, sideA, sideB)
      const [rollA, rollB] = rolls[node.branchIndex]
      sideA.results.dice = rollA
      sideB.results.dice = rollB
      let winner = doPhase(environment, sideA, sideB)

      let combatPhase = node.combatPhase
      let branchIndex = node.branchIndex
      let weightIndex = node.weightIndex

      node.branchIndex++
      if (node.branchIndex === dice2)
        nodes.pop()
      while (winner === undefined && combatPhase < maxPhase) {
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
          nodes.push(createCombatNode(environment, sideA, sideB, 1, combatPhase, weightIndex))
        }
        const [rollA, rollB] = rolls[branchIndex]
        sideA.results.dice = rollA
        sideB.results.dice = rollB
        winner = doPhase(environment, sideA, sideB)
      }
      sumState(currentA, sideA)
      sumState(currentB, sideB)
      if (settings[Setting.CalculateCasualties])
        updateCasualties(casualties, weights[weightIndex], totalA, totalB, currentA, currentB)
      if (settings[Setting.CalculateResourceLosses]) {
        calculateResourceLoss(sideA.cohorts, weights[weightIndex], lossesA, lossesB, unitPropertiesB)
        calculateResourceLoss(sideB.cohorts, weights[weightIndex], lossesB, lossesA, unitPropertiesA)
      }
      updateProgress(progress, weights[weightIndex], winner, environment, settings[Setting.Stackwipe] && (currentA.strength === 0 || currentB.strength === 0))
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
const copyCohortState = (cohorts: Cohorts): Cohorts => ({
  frontline: cohorts.frontline.map(row => row.map(value => value ? { ...value } : null)),
  reserve: copyReserveState(cohorts.reserve),
  defeated: cohorts.defeated.map(value => ({ ...value })),
  retreated: cohorts.retreated.map(value => ({ ...value }))
})
const copyReserveState = (reserve: Reserve): Reserve => ({
  front: reserve.front.map(value => ({ ...value })),
  flank: reserve.flank.map(value => ({ ...value })),
  support: reserve.support.map(value => ({ ...value }))
})
const copyArmiesState = (armies: Army[]): Army[] => armies.map(army => ({ ...army, reserve: copyReserveState(army.reserve) }))

const calculateCaptureLoss = (cohort: Cohort, weight: number, own: ResourceLosses, enemy: ResourceLosses, enemyDefinitions: { [key: number]: UnitProperties }) => {
  const enemyIndex = cohort.state.defeatedBy?.properties.participantIndex ?? cohort.state.stackWipedBy?.participantIndex
  if (enemyIndex === undefined) {
    throw 'Defeated should always get defeated by something.'
  }
  const cohortCost = weight * cohort.properties[UnitAttribute.Cost]
  if (cohort.state.isDestroyed) {
    own.destroyedCost += cohortCost
    return
  }
  const capture = (cohort.state.captureChance ?? 0.0)
  const repair = (cohort.properties.maxStrength - cohort[UnitAttribute.Strength]) * cohort.properties[UnitAttribute.Maintenance] * cohortCost / getConfig().ShipRepair
  if (capture <= 0.0) {
    own.repairMaintenance += repair
    return
  }
  // If captured then the unit doesn't have to be repaired.
  own.repairMaintenance += (1 - capture) * repair
  // If captured then the full cost of unit is lost.
  own.capturedCost += capture * cohortCost
  const enemyProperties = enemyDefinitions[enemyIndex][cohort.properties.type]
  const enemyUnitCost = weight * (cohort.properties[UnitAttribute.Cost] - cohort.properties[UnitAttribute.Cost] + enemyProperties[UnitAttribute.Cost])
  const enemyRepairCost = (cohort.properties.maxStrength - cohort[UnitAttribute.Strength]) * (cohort.properties[UnitAttribute.Maintenance] - cohort.properties[UnitAttribute.Maintenance] + enemyProperties[UnitAttribute.Maintenance]) * enemyUnitCost / getConfig().ShipRepair
  // If captured then the enemy gainst full cost of the unit.
  enemy.seizedCost -= capture * enemyUnitCost
  // But enemy also has to repair the unit.
  enemy.seizedRepairMaintenance += capture * enemyRepairCost
}

/**
 * Calculates repair and other resource losses.
 */
const calculateResourceLoss = (cohorts: Cohorts, weight: number, own: ResourceLosses, enemy: ResourceLosses, enemyDefinitions: { [key: number]: UnitProperties }) => {
  const { frontline, defeated, retreated } = cohorts
  for (let i = 0; i < frontline.length; i++) {
    for (let j = 0; j < frontline[i].length; j++) {
      const cohort = frontline[i][j]
      if (!cohort)
        continue
      own.repairMaintenance += weight * (cohort.properties.maxStrength - cohort[UnitAttribute.Strength]) * cohort.properties[UnitAttribute.Maintenance] * cohort.properties[UnitAttribute.Cost] / getConfig().ShipRepair
    }
  }
  for (let i = 0; i < defeated.length; i++) {
    const cohort = defeated[i]
    calculateCaptureLoss(cohort, weight, own, enemy, enemyDefinitions)
  }
  for (let i = 0; i < retreated.length; i++) {
    const cohort = retreated[i]
    calculateCaptureLoss(cohort, weight, own, enemy, enemyDefinitions)
  }
}

type Winner = SideType | null | undefined

/**
 * Simulates one dice roll phase.
 */
const doPhase = (environment: Environment, sideA: Side, sideB: Side) => {
  const phaseLength = environment.settings[Setting.PhaseLength]
  // This is only called when combat is happening.
  sideA.armiesRemaining = true
  sideA.isDefeated = false
  sideB.armiesRemaining = true
  sideB.isDefeated = false
  for (let i = 0; i < phaseLength; i++) {
    environment.day++
    doCombatRound(environment, sideA, sideB, false)
    if (sideA.isDefeated || sideB.isDefeated)
      break
  }
  if (environment.round === -1 && sideA.armiesRemaining && sideB.armiesRemaining)
    skipUntilNextCombatDay(environment, sideA, sideB)
  return getWinner(sideA, sideB)
}

const getWinner = (sideA: Side, sideB: Side) => {
  let winner: Winner = undefined
  if (!sideA.armiesRemaining && !sideB.armiesRemaining)
    winner = null
  else if (!sideA.armiesRemaining)
    winner = SideType.B
  else if (!sideB.armiesRemaining)
    winner = SideType.A
  return winner
}

const skipUntilNextCombatDay = (environment: Environment, sideA: Side, sideB: Side) => {
  while (environment.round === -1 && environment.day < 10000) {
    environment.day++
    doCombatRound(environment, sideA, sideB, false)
  }
}

type State = {
  morale: number
  strength: number
}

const sumReserve = (state: State, reserve: Reserve) => {
  for (let i = 0; i < reserve.front.length; i++) {
    const cohort = reserve.front[i]
    state.strength += cohort[UnitAttribute.Strength]
    state.morale += cohort[UnitAttribute.Morale]
  }
  for (let i = 0; i < reserve.flank.length; i++) {
    const cohort = reserve.flank[i]
    state.strength += cohort[UnitAttribute.Strength]
    state.morale += cohort[UnitAttribute.Morale]
  }
  for (let i = 0; i < reserve.support.length; i++) {
    const cohort = reserve.support[i]
    state.strength += cohort[UnitAttribute.Strength]
    state.morale += cohort[UnitAttribute.Morale]
  }
}

const sumCohorts = (state: State, cohorts: Cohorts) => {
  for (let i = 0; i < cohorts.frontline.length; i++) {
    for (let j = 0; j < cohorts.frontline[i].length; j++) {
      const cohort = cohorts.frontline[i][j]
      if (!cohort)
        continue
      state.strength += cohort[UnitAttribute.Strength]
      state.morale += cohort[UnitAttribute.Morale]
    }
  }
  sumReserve(state, cohorts.reserve)
  for (let i = 0; i < cohorts.defeated.length; i++) {
    const cohort = cohorts.defeated[i]
    state.strength += cohort[UnitAttribute.Strength]
    state.morale += cohort[UnitAttribute.Morale]
  }
  for (let i = 0; i < cohorts.retreated.length; i++) {
    const cohort = cohorts.retreated[i]
    state.strength += cohort[UnitAttribute.Strength]
    state.morale += cohort[UnitAttribute.Morale]
  }
}

/**
 * Counts total morale and strength of units.
 */
const sumState = (state: State, side: Side) => {
  state.strength = 0
  state.morale = 0
  sumCohorts(state, side.cohorts)
  side.deployed.forEach(army => sumReserve(state, army.reserve))
  side.armies.forEach(army => sumReserve(state, army.reserve))
}

/**
 * Updates progress of the calculation.
 */
const updateProgress = (progress: WinRateProgress, weight: number, winner: Winner, environment: Environment, stackWipe: boolean) => {
  progress.progress += weight
  if (winner === SideType.A)
    progress.attacker += weight
  else if (winner === SideType.B)
    progress.defender += weight
  else if (winner === null)
    progress.draws += weight
  else
    progress.incomplete += weight
  if (stackWipe)
    progress.stackWipes += weight
  // Environment tracks start day of the current round. +1 for the end day.
  const days = environment.day + 1
  progress.averageDays += weight * days
  progress.days[days] = (progress.days[days] || 0) + weight
}

/**
 * Updates casualties of the calculation.
 */
const updateCasualties = (casualties: CasualtiesProgress, amount: number, totalA: State, totalB: State, currentA: State, currentB: State) => {
  const lossA = totalA.strength - currentA.strength
  const lossB = totalB.strength - currentB.strength
  casualties.avgMoraleA += (totalA.morale - currentA.morale) * amount
  casualties.avgMoraleB += (totalB.morale - currentB.morale) * amount
  casualties.avgStrengthA += lossA * amount
  casualties.avgStrengthB += lossB * amount
  if (lossA < lossB)
    casualties.winRateA += amount
  if (lossA > lossB)
    casualties.winRateB += amount

  const moraleA = (Math.max(0, currentA.morale)).toFixed(1)
  const moraleB = (Math.max(0, currentB.morale)).toFixed(1)
  const strengthA = (Math.max(0, currentA.strength)).toFixed(2)
  const strengthB = (Math.max(0, currentB.strength)).toFixed(2)
  casualties.moraleA[moraleA] = (casualties.moraleA[moraleA] || 0) + amount
  casualties.moraleB[moraleB] = (casualties.moraleB[moraleB] || 0) + amount
  casualties.strengthA[strengthA] = (casualties.strengthA[strengthA] || 0) + amount
  casualties.strengthB[strengthB] = (casualties.strengthB[strengthB] || 0) + amount
}