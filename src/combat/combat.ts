
import { TacticDefinition, UnitAttribute, Setting, UnitRole, Settings, CombatPhase, Cohorts, Cohort, Frontline, Defeated, Side, Environment, TacticCalc } from 'types'
import { noZero } from 'utils'
import { calculateValue } from 'definition_values'
import { getCombatPhase, calculateCohortPips, getDailyIncrease, iterateCohorts, removeDefeated, reserveSize, reinforce, calculateGeneralPips, getTerrainPips, checkStackWipe, defeatCohort, isAlive } from 'combat'
import { deploy, undeploy } from './deployment'
import { getLeadingArmy } from 'managers/battle'

/**
 * Makes given armies attach each other.
 */
export const doCombatRound = (env: Environment, sideA: Side, sideB: Side, markDefeated: boolean) => {
  env.round++
  const { round } = env
  const settings = env.settings
  const phase = getCombatPhase(env.round, settings)
  // Defender advantage requires detecting which one is the defender.
  const a = sideA.type === env.attacker ? sideA : sideB
  const d = sideA.type === env.attacker ? sideB : sideA
  if (markDefeated) {
    removeDefeated(a.cohorts.frontline)
    removeDefeated(d.cohorts.frontline)
  }
  clearState(a.cohorts.frontline)
  clearState(d.cohorts.frontline)
  if (round === 0) {
    undeploy(a)
    undeploy(d)
  }
  deploy(env, a, d)
  if (round > 0) {
    reinforce(env, a)
    if (!settings[Setting.DefenderAdvantage])
      reinforce(env, d)
    pickTargets(env, a.cohorts.frontline, d.cohorts.frontline)
    if (settings[Setting.DefenderAdvantage])
      reinforce(env, d)
    pickTargets(env, d.cohorts.frontline, a.cohorts.frontline)

    // Tactic bonus changes dynamically when units lose strength so it can't be precalculated.
    // If this is a problem a fast mode can be implemeted where to bonus is only calculated once.
    a.results.round = env.round
    d.results.round = env.round
    const dailyMultiplier = 1 + getDailyIncrease(env.round, settings)
    const generalA = getLeadingArmy(a)
    const generalD = getLeadingArmy(d)
    const tacticStrengthDamageMultiplier = generalA && generalD && settings[Setting.Tactics] ? 1.0 + calculateValue(generalA.tactic, TacticCalc.Casualties) + calculateValue(generalD.tactic, TacticCalc.Casualties) : 1.0
    a.results.dailyMultiplier = dailyMultiplier
    d.results.dailyMultiplier = dailyMultiplier
    attack(env, a, d, dailyMultiplier, tacticStrengthDamageMultiplier, phase)
    attack(env, d, a, dailyMultiplier, tacticStrengthDamageMultiplier, phase)

    applyLosses(a.cohorts.frontline)
    applyLosses(d.cohorts.frontline)
  }
  a.alive = moveDefeated(env, a.cohorts.frontline, a.cohorts.defeated, markDefeated) || reserveSize(a.cohorts.reserve) > 0
  d.alive = moveDefeated(env, d.cohorts.frontline, d.cohorts.defeated, markDefeated) || reserveSize(d.cohorts.reserve) > 0

  const defenderWiped = checkStackWipe(env, d, a.cohorts)
  if (!defenderWiped)
    checkStackWipe(env, a, d.cohorts)
  if (!a.alive) {
    a.deployed = []
    env.round = -1
    if (d.alive)
      env.attacker = a.type
  }
  if (!d.alive) {
    d.deployed = []
    env.round = -1
    if (a.alive)
      env.attacker = d.type
  }
  // Check if a new battle can started.
  a.alive = a.alive || a.armies.length > 0
  d.alive = d.alive || d.armies.length > 0
}

const getBackTarget = (target: Frontline, index: number) => target.length > 1 ? target[1][index] : null

const clearState = (source: Frontline) => {
  for (let i = 0; i < source.length; i++) {
    for (let j = 0; j < source[i].length; j++) {
      const cohort = source[i][j]
      if (!cohort)
        continue
        const state = cohort.state
        state.damageMultiplier = 0
        state.moraleDealt = 0
        state.strengthDealt = 0
        state.moraleLoss = 0
        state.strengthLoss = 0
        state.target = null
        state.flanking = false
    }
  }
}

/**
 * Selects targets for units.
 */
const pickTargets = (environment: Environment, source: Frontline, target: Frontline) => {
  const settings = environment.settings
  const sourceLength = source[0].length
  const targetLength = target[0].length
  for (let i = 0; i < source.length; i++) {
    for (let j = 0; j < source[i].length; j++) {
      const cohort = source[i][j]
      if (!cohort)
        continue
      const state = cohort.state
      state.moraleLoss = settings[Setting.DailyMoraleLoss] * (1 - cohort.properties[UnitAttribute.DailyLossResist])
      // No need to select targets for units without effect.
      if (i > 0 && !cohort.properties[UnitAttribute.OffensiveSupport])
        continue

      // Targets are prioritised based two things.
      // 1st: Is target considered primary (healthy).
      // 2nd: Is target directly on front.
      let primaryTarget: number | null = null
      let secondaryTarget: number | null = null
      if (target[0][j]) {
        if (target[0][j]?.isWeak)
          secondaryTarget = j
        else
          primaryTarget = j
      }
      // Primary target on front has the highest priority so no need to check flanks.
      if (primaryTarget === null) {
        const maneuver = Math.floor(cohort.properties[UnitAttribute.Maneuver])
        let direction = -1
        let min = Math.max(0, j - maneuver)
        let max = Math.min(targetLength - 1, j + maneuver)
        if (!settings[Setting.FixFlankTargeting] || (settings[Setting.FixTargeting] ? j < sourceLength / 2 : j <= sourceLength / 2)) {
          direction = 1
        }
        for (let index = direction > 0 ? min : max; min <= index && index <= max; index += direction) {
          const isWeak = target[0][index]?.isWeak
          if (target[0][index] && (isWeak ? !secondaryTarget : !primaryTarget)) {
            if (isWeak)
              secondaryTarget = index
            else
              primaryTarget = index
            state.flanking = true
          }
        }
      }
      const targetIndex = primaryTarget ?? secondaryTarget
      if (targetIndex !== null) {
        state.target = target[0][targetIndex]
        state.targetSupport = getBackTarget(target, targetIndex)
      }
    }
  }
}

/**
 * Calculates effectiveness of a tactic against another tactic with a given army.
 */
export const calculateTactic = (army: Cohorts, tactic: TacticDefinition, counterTactic?: TacticDefinition): number => {
  const effectiveness = counterTactic ? calculateValue(tactic, counterTactic.type) : 1.0
  let averageWeight = 1.0
  if (effectiveness > 0 && tactic && army) {
    let totalStrength = 0
    let totalWeight = 0.0

    const addWeight = (cohort: Cohort) => {
      totalStrength += cohort[UnitAttribute.Strength]
      totalWeight += calculateValue(tactic, cohort.properties.type) * cohort[UnitAttribute.Strength]
    }
    iterateCohorts(army, true, addWeight)
    if (totalStrength)
      averageWeight = totalWeight / totalStrength
  }

  return effectiveness * Math.min(1.0, averageWeight)
}

const calculateFlankRatioPenalty = (army: Cohorts, ratio: number, setting: Settings) => {
  return ratio && calculateFlankRatio(army) > ratio ? setting[Setting.InsufficientSupportPenalty] / (1 - setting[Setting.InsufficientSupportPenalty]) : 0.0
}

const calculateFlankRatio = (army: Cohorts): number => {
  let infantry = 0.0
  let flank = 0.0

  const addRatio = (cohort: Cohort) => {
    if (cohort.properties.role === UnitRole.Front)
      infantry += cohort[UnitAttribute.Strength]
    if (cohort.properties.role === UnitRole.Flank)
      flank += cohort[UnitAttribute.Strength]
  }
  iterateCohorts(army, true, addRatio)
  return flank / noZero(flank + infantry)
}

/**
 * Applies stored losses to units.
 */
const applyLosses = (frontline: Frontline) => {
  for (let i = 0; i < frontline.length; i++) {
    for (let j = 0; j < frontline[i].length; j++) {
      const cohort = frontline[i][j]
      if (!cohort)
        continue
      cohort[UnitAttribute.Morale] = Math.max(0, cohort[UnitAttribute.Morale] - cohort.state.moraleLoss)
      cohort[UnitAttribute.Strength] = Math.max(0, cohort[UnitAttribute.Strength] - cohort.state.strengthLoss)
    }
  }
}

/**
 * Moves defeated units from a frontline to defeated.
 */
const moveDefeated = (environment: Environment, frontline: Frontline, defeated: Defeated, markDefeated: boolean) => {
  const settings = environment.settings
  let alive = false
  for (let i = 0; i < frontline.length; i++) {
    for (let j = 0; j < frontline[i].length; j++) {
      const cohort = frontline[i][j]
      if (!cohort)
        continue
      if (isAlive(cohort, environment.settings)) {
        alive = true
        continue
      }
      if (i > 0 && !settings[Setting.BackRowRetreat]) {
        alive = true
        continue
      }
      if (settings[Setting.DynamicTargeting])
        cohort.isWeak = true
      if (settings[Setting.RetreatRounds] > environment.round + 1) {
        alive = true
        continue
      }
      defeatCohort(environment, cohort)
      if (!markDefeated)
        frontline[i][j] = null
      cohort.state.target = null
      defeated.push(cohort)
    }
  }
  return alive
}

const attack = (environment: Environment, source: Side, target: Side, dailyMultiplier: number, tacticStrengthDamageMultiplier: number, phase: CombatPhase) => {
  const { settings, terrains, attacker } = environment
  // Tactic bonus changes dynamically when units lose strength so it can't be precalculated.
  // If this is a problem a fast mode can be implemeted where to bonus is only calculated once.
  const armyS = getLeadingArmy(source)
  const armyT = getLeadingArmy(target)
  const generalPips = armyS && armyT ? calculateGeneralPips(armyS.general, armyT.general, phase) : 0
  const terrainPips = armyS && armyT ? getTerrainPips(terrains, source.type === attacker, armyS.general, armyT.general) : 0

  source.results.generalPips = generalPips
  source.results.terrainPips = terrainPips
  source.results.tacticStrengthDamageMultiplier = tacticStrengthDamageMultiplier
  source.results.tacticBonus = settings[Setting.Tactics] && armyS && armyT ? calculateTactic(source.cohorts, armyS.tactic, armyT.tactic) : 0.0
  source.results.flankRatioBonus = calculateFlankRatioPenalty(target.cohorts, target.flankRatio, settings)
  const multiplier = (1 + source.results.tacticBonus) * dailyMultiplier * (1 + source.results.flankRatioBonus)
  attackSub(source.cohorts.frontline, settings[Setting.BasePips] + source.results.dice + generalPips + terrainPips, multiplier, tacticStrengthDamageMultiplier, phase, settings)
}

/**
 * Calculates losses when units attack their targets.
 */
const attackSub = (frontline: Frontline, roll: number, dynamicMultiplier: number, strengthMultiplier: number, phase: CombatPhase, settings: Settings) => {
  for (let i = 0; i < frontline.length; i++) {
    for (let j = 0; j < frontline[i].length; j++) {
      const source = frontline[i][j]
      if (!source)
        continue
      const target = source.state.target
      if (!target)
        continue
      target.state.captureChance = source.properties[UnitAttribute.CaptureChance]
      const multiplier = calculateDamageMultiplier(source, target, dynamicMultiplier, i > 0, phase, settings)
      calculateMoraleLosses(source, target, source.state.targetSupport, roll, multiplier, phase, settings)
      calculateStrengthLosses(source, target, source.state.targetSupport, roll, multiplier * strengthMultiplier, phase, settings)
    }
  }
}

const calculateCohortDamageMultiplier = (source: Cohort, target: Cohort, isSupport: boolean, settings: Settings) => {
  const definitionS = source.properties
  const definitionT = target.properties

  return source[UnitAttribute.Strength]
    * (settings[Setting.AttributeOffenseDefense] ? 1.0 + definitionS[UnitAttribute.Offense] - definitionT[UnitAttribute.Defense] : 1.0)
    * (isSupport ? definitionS[UnitAttribute.OffensiveSupport] : 1.0)
}

const calculateDamageMultiplier = (source: Cohort, target: Cohort, dynamicMultiplier: number, isSupport: boolean, phase: CombatPhase, settings: Settings) => {
  dynamicMultiplier *= calculateCohortDamageMultiplier(source, target, isSupport, settings)
  if (settings[Setting.DamageLossForMissingMorale]) {
    const morale = source[UnitAttribute.Morale] / source.properties.maxMorale
    dynamicMultiplier *= 1 + (morale - 1) * settings[Setting.DamageLossForMissingMorale]
  }
  source.state.damageMultiplier = dynamicMultiplier * source.properties.damage['Damage'][target.properties.type][phase] * target.properties.damageTakenMultiplier / settings[Setting.Precision]
  return dynamicMultiplier
}


const calculatePips = (roll: number, maxPips: number, source: Cohort, target: Cohort, targetSupport: Cohort | null, type: UnitAttribute.Morale | UnitAttribute.Strength, phase?: CombatPhase) => {
  return Math.min(maxPips, Math.max(0, roll + calculateCohortPips(source.properties, target.properties, targetSupport ? targetSupport.properties : null, type, phase)))
}

const calculateMoraleLosses = (source: Cohort, target: Cohort, targetSupport: Cohort | null, roll: number, dynamicMultiplier: number, phase: CombatPhase, settings: Settings) => {
  const pips = calculatePips(roll, settings[Setting.MaxPips], source, target, targetSupport, UnitAttribute.Morale)
  const morale = settings[Setting.UseMaxMorale] ? source.properties.maxMorale : source[UnitAttribute.Morale]
  let damage = pips * dynamicMultiplier * source.properties.damage[UnitAttribute.Morale][target.properties.type][phase] * morale * target.properties.moraleTakenMultiplier
  if (settings[Setting.MoraleDamageBasedOnTargetStrength])
    damage /= target[UnitAttribute.Strength]

  source.state.moraleDealt = Math.floor(damage) / settings[Setting.Precision]
  source.state.totalMoraleDealt += source.state.moraleDealt
  target.state.moraleLoss += source.state.moraleDealt
  // Morale damage seems to carry over only when not flanking (but this can be wrong).
  if (!source.state.flanking && targetSupport)
    targetSupport.state.moraleLoss += source.state.moraleDealt
}

const calculateStrengthLosses = (source: Cohort, target: Cohort, targetSupport: Cohort | null, roll: number, dynamicMultiplier: number, phase: CombatPhase, settings: Settings) => {
  const pips = calculatePips(roll, settings[Setting.MaxPips], source, target, targetSupport, UnitAttribute.Strength, phase)
  const damage = pips * dynamicMultiplier * source.properties.damage[UnitAttribute.Strength][target.properties.type][phase] * target.properties.strengthTakenMultiplier[phase]

  source.state.strengthDealt = Math.floor(damage) / settings[Setting.Precision]
  source.state.totalStrengthDealt += source.state.strengthDealt
  target.state.strengthLoss += source.state.strengthDealt
}
