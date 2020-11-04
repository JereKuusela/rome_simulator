import {
  TacticDefinition,
  UnitAttribute,
  Setting,
  UnitRole,
  Settings,
  CombatPhase,
  Cohorts,
  Cohort,
  Frontline,
  Side,
  Environment,
  TacticCalc,
  UnitType,
  TacticMatch,
  Army,
  FlankRatioPenalty
} from 'types'
import { keys, map, multiplyChance, noZero, toArr, toObj } from 'utils'
import { calculateValue } from 'definition_values'
import {
  getCombatPhase,
  calculateCohortPips,
  getDailyIncrease,
  iterateCohorts,
  removeDefeated,
  reserveSize,
  reinforce,
  calculateGeneralPips,
  getTerrainPips,
  checkStackWipe,
  defeatCohort,
  isAlive,
  iterateFrontline
} from 'combat'
import { deploy, undeploy, moveDefeatedToRetreated } from './deployment'
import { getLeadingArmy, getDefaultCombatResults } from 'managers/battle'
import { getConfig } from 'data/config'
import { clamp, sum } from 'lodash'

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
  if (round === 0) {
    undeploy(env, a)
    a.results = getDefaultCombatResults()
    undeploy(env, d)
    d.results = getDefaultCombatResults()
  }
  deploy(env, a, d)
  clearState(a.cohorts.frontline)
  clearState(d.cohorts.frontline)
  if (round > 0) {
    reinforce(env, a)
    if (!settings[Setting.DefenderAdvantage]) reinforce(env, d)
    pickTargets(env, a.cohorts.frontline, d.cohorts.frontline)
    if (settings[Setting.DefenderAdvantage]) reinforce(env, d)
    pickTargets(env, d.cohorts.frontline, a.cohorts.frontline)

    a.results.round = env.round
    d.results.round = env.round
    const dailyMultiplier = 1 + getDailyIncrease(env.round, settings)
    const generalA = getLeadingArmy(a)
    const generalD = getLeadingArmy(d)
    const tacticStrengthDamageMultiplier =
      generalA && generalD && settings[Setting.Tactics]
        ? 1.0 +
          calculateValue(generalA.tactic, TacticCalc.Casualties) +
          calculateValue(generalD.tactic, TacticCalc.Casualties)
        : 1.0
    a.results.dailyMultiplier = dailyMultiplier
    d.results.dailyMultiplier = dailyMultiplier
    calculateArmyPips(env, a, d, phase)
    calculateArmyPips(env, d, a, phase)
    if (settings[Setting.RelativePips]) {
      a.results.actualBonusPips = Math.max(0, a.results.totalBonusPips - d.results.totalBonusPips)
      d.results.actualBonusPips = Math.max(0, d.results.totalBonusPips - a.results.totalBonusPips)
    }
    attack(env, a, d, dailyMultiplier, tacticStrengthDamageMultiplier, phase)
    attack(env, d, a, dailyMultiplier, tacticStrengthDamageMultiplier, phase)

    applyLosses(a.cohorts.frontline)
    applyLosses(d.cohorts.frontline)
  }
  a.isDefeated =
    moveDefeated(env, a.cohorts.frontline, a.cohorts.defeated, markDefeated) && reserveSize(a.cohorts.reserve) === 0
  d.isDefeated =
    moveDefeated(env, d.cohorts.frontline, d.cohorts.defeated, markDefeated) && reserveSize(d.cohorts.reserve) === 0
  const noCombat = a.isDefeated && d.isDefeated

  const defenderWiped = checkStackWipe(env, d, a)
  if (!defenderWiped) checkStackWipe(env, a, d)
  a.armiesRemaining = !a.isDefeated || a.armies.length > 0
  d.armiesRemaining = !d.isDefeated || d.armies.length > 0
  if (a.isDefeated) {
    moveDefeatedToRetreated(a.cohorts)
    env.round = -1
    if (!noCombat && settings[Setting.AttackerSwapping]) env.attacker = a.type
  }
  if (d.isDefeated) {
    moveDefeatedToRetreated(d.cohorts)
    env.round = -1
    if (!noCombat && settings[Setting.AttackerSwapping]) env.attacker = d.type
  }
}

const getBackTarget = (target: Frontline, index: number) => (target.length > 1 ? target[1][index] : null)

const clearState = (source: Frontline) => {
  for (let i = 0; i < source.length; i++) {
    for (let j = 0; j < source[i].length; j++) {
      const cohort = source[i][j]
      if (!cohort) continue
      const state = cohort.state
      state.damageMultiplier = 0
      state.moraleDealt = 0
      state.strengthDealt = 0
      state.moraleLoss = 0
      state.strengthLoss = 0
      state.target = null
      state.flanking = false
      state.targetedBy = null
      state.flankRatioPenalty = 0
      state.captureChance = 0
      // Enemies in front should never be already defeated.
      // This kind of state can come from Analyze tool because it doesn't reset the state.
      state.isDefeated = false
      state.defeatedBy = null
      state.isDestroyed = false
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
      if (!cohort) continue
      const state = cohort.state
      state.moraleLoss = settings[Setting.DailyMoraleLoss] * (1 - cohort.properties[UnitAttribute.DailyLossResist])
      // No need to select targets for units without effect.
      if (i > 0 && !cohort.properties[UnitAttribute.OffensiveSupport]) continue

      // Targets are prioritised based two things.
      // 1st: Is target considered primary (healthy).
      // 2nd: Is target directly on front.
      let primaryTarget: number | null = null
      let secondaryTarget: number | null = null
      if (target[0][j]) {
        if (target[0][j]?.isWeak) secondaryTarget = j
        else primaryTarget = j
      }
      // Primary target on front has the highest priority so no need to check flanks.
      if (primaryTarget === null) {
        const maneuver = Math.floor(cohort.properties[UnitAttribute.Maneuver])
        let direction = -1
        const min = Math.max(0, j - maneuver)
        const max = Math.min(targetLength - 1, j + maneuver)
        if (!settings[Setting.FixFlankTargeting] || j < sourceLength / 2) {
          direction = 1
        }
        for (let index = direction > 0 ? min : max; min <= index && index <= max; index += direction) {
          const isWeak = target[0][index]?.isWeak
          if (target[0][index] && (isWeak ? !secondaryTarget : !primaryTarget)) {
            if (isWeak) secondaryTarget = index
            else primaryTarget = index
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
  const versusDamage = counterTactic ? calculateValue(tactic, counterTactic.type) : 1.0
  let averageEffectiveness = 1.0
  if (versusDamage > 0 && tactic && army) {
    let totalStrength = 0
    let totalEffectiveness = 0.0

    const addEffectiveness = (cohort: Cohort) => {
      totalStrength += cohort[UnitAttribute.Strength]
      totalEffectiveness += calculateValue(tactic, cohort.properties.type) * cohort[UnitAttribute.Strength]
    }
    iterateCohorts(army, true, addEffectiveness)
    if (totalStrength) averageEffectiveness = totalEffectiveness / totalStrength
  }

  return (
    versusDamage *
    Math.max(getConfig().TacticMin, Math.min(getConfig().TacticMax, getConfig().TacticBase + averageEffectiveness))
  )
}

export const getTacticMatch = (tactic: TacticDefinition, counterTactic?: TacticDefinition): TacticMatch => {
  const effectiveness = counterTactic ? calculateValue(tactic, counterTactic.type) : 1.0
  if (effectiveness > 0) return TacticMatch.Positive
  if (effectiveness < 0) return TacticMatch.Negative
  return TacticMatch.Neutral
}

const calculateFlankRatioPenalty = (armies: Army[], cohorts: Cohorts, ratio: number, setting: Settings) => {
  const ratios = calculateFlankRatios(cohorts)
  return toObj(
    armies,
    army => army.participantIndex,
    army =>
      army.flankRatio && ratios[army.participantIndex] > army.flankRatio
        ? setting[Setting.InsufficientSupportPenalty] / (1 - setting[Setting.InsufficientSupportPenalty])
        : 0.0
  )
}

const calculateFlankRatios = (cohorts: Cohorts): { [key: string]: number } => {
  const infantry = <{ [key: string]: number }>{}
  const flank = <{ [key: string]: number }>{}

  const addRatio = (cohort: Cohort) => {
    if (infantry[cohort.properties.participantIndex] === undefined) infantry[cohort.properties.participantIndex] = 0
    if (flank[cohort.properties.participantIndex] === undefined) flank[cohort.properties.participantIndex] = 0
    if (cohort.properties.role === UnitRole.Front)
      infantry[cohort.properties.participantIndex] += cohort[UnitAttribute.Strength]
    if (cohort.properties.role === UnitRole.Flank)
      flank[cohort.properties.participantIndex] += cohort[UnitAttribute.Strength]
  }
  iterateCohorts(cohorts, true, addRatio)
  return toObj(
    Object.keys(infantry),
    key => key,
    key => flank[key] / noZero(flank[key] + infantry[key])
  )
}

/**
 * Applies stored losses to units.
 */
const applyLosses = (frontline: Frontline) => {
  for (let i = 0; i < frontline.length; i++) {
    for (let j = 0; j < frontline[i].length; j++) {
      const cohort = frontline[i][j]
      if (!cohort) continue
      cohort[UnitAttribute.Morale] = Math.max(0, cohort[UnitAttribute.Morale] - cohort.state.moraleLoss)
      cohort[UnitAttribute.Strength] = Math.max(0, cohort[UnitAttribute.Strength] - cohort.state.strengthLoss)
    }
  }
}

/**
 * Moves defeated units from a frontline to defeated.
 */
const moveDefeated = (environment: Environment, frontline: Frontline, defeated: Cohort[], markDefeated: boolean) => {
  const settings = environment.settings
  let cohortsAlive = false
  for (let i = 0; i < frontline.length; i++) {
    for (let j = 0; j < frontline[i].length; j++) {
      const cohort = frontline[i][j]
      if (!cohort) continue
      if (isAlive(cohort, environment.settings)) {
        cohortsAlive = true
        continue
      }
      if (i > 0 && !settings[Setting.BackRowRetreat]) {
        cohortsAlive = true
        continue
      }
      if (settings[Setting.DynamicTargeting]) cohort.isWeak = true
      if (settings[Setting.RetreatRounds] > environment.round + 1) {
        cohortsAlive = true
        continue
      }
      if (cohort.state.targetedBy) {
        cohort.state.defeatedBy = cohort.state.targetedBy
        cohort.state.captureChance = multiplyChance(
          cohort.state.captureChance,
          cohort.state.targetedBy.properties[UnitAttribute.CaptureChance] -
            cohort.properties[UnitAttribute.CaptureResist]
        )
      }
      defeatCohort(environment, cohort)
      if (!markDefeated) frontline[i][j] = null
      defeated.push(cohort)
    }
  }
  return !cohortsAlive
}

const calculateArmyPips = (environment: Environment, source: Side, target: Side, phase: CombatPhase) => {
  const { terrains, attacker } = environment
  const armyS = getLeadingArmy(source)
  const armyT = getLeadingArmy(target)
  const generalPips = armyS && armyT ? calculateGeneralPips(armyS.general, armyT.general, phase) : 0
  const terrainPips =
    armyS && armyT ? getTerrainPips(terrains, source.type === attacker, armyS.general, armyT.general) : 0
  source.results.generalPips = generalPips
  source.results.terrainPips = terrainPips
  source.results.totalBonusPips = source.results.dice + source.results.generalPips + source.results.terrainPips
  source.results.actualBonusPips = source.results.totalBonusPips
}

const attack = (
  environment: Environment,
  source: Side,
  target: Side,
  dailyMultiplier: number,
  tacticStrengthDamageMultiplier: number,
  phase: CombatPhase
) => {
  const { settings } = environment
  // Tactic bonus changes dynamically when units lose strength so it can't be precalculated.
  // If this is a problem a fast mode can be implemeted where to bonus is only calculated once.
  const armyS = getLeadingArmy(source)
  const armyT = getLeadingArmy(target)
  source.results.tacticStrengthDamageMultiplier = tacticStrengthDamageMultiplier
  source.results.tacticBonus =
    settings[Setting.Tactics] && armyS && armyT ? calculateTactic(source.cohorts, armyS.tactic, armyT.tactic) : 0.0
  const flankRatioPenalty = calculateFlankRatioPenalty(target.deployed, target.cohorts, target.flankRatio, settings)
  const multiplier = (1 + source.results.tacticBonus) * dailyMultiplier
  attackSub(
    source.cohorts.frontline,
    settings[Setting.BasePips] + source.results.totalBonusPips,
    multiplier,
    tacticStrengthDamageMultiplier,
    phase,
    flankRatioPenalty,
    settings
  )
}

/**
 * Calculates losses when units attack their targets.
 */
const attackSub = (
  frontline: Frontline,
  roll: number,
  dynamicMultiplier: number,
  strengthMultiplier: number,
  phase: CombatPhase,
  flankRatioPenalty: FlankRatioPenalty,
  settings: Settings
) => {
  for (let i = 0; i < frontline.length; i++) {
    for (let j = 0; j < frontline[i].length; j++) {
      const source = frontline[i][j]
      if (!source) continue
      const target = source.state.target
      if (!target) continue
      target.state.targetedBy = source
      target.state.flankRatioPenalty = 1.0 + (flankRatioPenalty[target.properties.participantIndex] ?? 0.0)
      const multiplier = calculateDamageMultiplier(source, target, dynamicMultiplier, i > 0, phase, settings)
      calculateMoraleLosses(source, target, source.state.targetSupport, roll, multiplier, phase, settings)
      calculateStrengthLosses(
        source,
        target,
        source.state.targetSupport,
        roll,
        multiplier * strengthMultiplier,
        phase,
        settings
      )
    }
  }
}

const calculateCohortDamageMultiplier = (source: Cohort, target: Cohort, isSupport: boolean, settings: Settings) => {
  const definitionS = source.properties
  const definitionT = target.properties

  return (
    source[UnitAttribute.Strength] *
    (settings[Setting.AttributeOffenseDefense]
      ? 1.0 + definitionS[UnitAttribute.Offense] - definitionT[UnitAttribute.Defense]
      : 1.0) *
    (isSupport ? definitionS[UnitAttribute.OffensiveSupport] : 1.0) *
    target.state.flankRatioPenalty
  )
}

const calculateDamageMultiplier = (
  source: Cohort,
  target: Cohort,
  dynamicMultiplier: number,
  isSupport: boolean,
  phase: CombatPhase,
  settings: Settings
) => {
  dynamicMultiplier *= calculateCohortDamageMultiplier(source, target, isSupport, settings)
  if (settings[Setting.DamageLossForMissingMorale]) {
    const morale = source[UnitAttribute.Morale] / source.properties.maxMorale
    dynamicMultiplier *= 1 + (morale - 1) * settings[Setting.DamageLossForMissingMorale]
  }
  source.state.damageMultiplier =
    (dynamicMultiplier *
      source.properties.damage['Damage'][target.properties.type][phase] *
      target.properties.damageTakenMultiplier) /
    settings[Setting.Precision]
  return dynamicMultiplier
}

const calculateTotalPips = (
  roll: number,
  maxPips: number,
  source: Cohort,
  target: Cohort,
  targetSupport: Cohort | null,
  type: UnitAttribute.Morale | UnitAttribute.Strength,
  phase?: CombatPhase
) => {
  return Math.min(
    maxPips,
    Math.max(
      0,
      roll +
        calculateCohortPips(
          source.properties,
          target.properties,
          targetSupport ? targetSupport.properties : null,
          type,
          phase
        )
    )
  )
}

const calculateMoraleLosses = (
  source: Cohort,
  target: Cohort,
  targetSupport: Cohort | null,
  roll: number,
  dynamicMultiplier: number,
  phase: CombatPhase,
  settings: Settings
) => {
  const pips = calculateTotalPips(roll, settings[Setting.MaxPips], source, target, targetSupport, UnitAttribute.Morale)
  const morale = settings[Setting.UseMaxMorale] ? source.properties.maxMorale : source[UnitAttribute.Morale]
  let damage =
    pips *
    dynamicMultiplier *
    source.properties.damage[UnitAttribute.Morale][target.properties.type][phase] *
    morale *
    target.properties.moraleTakenMultiplier
  if (settings[Setting.MoraleDamageBasedOnTargetStrength]) damage /= target[UnitAttribute.Strength]

  source.state.moraleDealt = Math.floor(damage) / settings[Setting.Precision]
  source.state.totalMoraleDealt += source.state.moraleDealt
  target.state.moraleLoss += source.state.moraleDealt
  // Morale damage seems to carry over only when not flanking (but this can be wrong).
  if (!source.state.flanking && targetSupport) targetSupport.state.moraleLoss += source.state.moraleDealt
}

const calculateStrengthLosses = (
  source: Cohort,
  target: Cohort,
  targetSupport: Cohort | null,
  roll: number,
  dynamicMultiplier: number,
  phase: CombatPhase,
  settings: Settings
) => {
  const pips = calculateTotalPips(
    roll,
    settings[Setting.MaxPips],
    source,
    target,
    targetSupport,
    UnitAttribute.Strength,
    phase
  )
  const damage =
    pips *
    dynamicMultiplier *
    source.properties.damage[UnitAttribute.Strength][target.properties.type][phase] *
    target.properties.strengthTakenMultiplier[phase]

  source.state.strengthDealt = Math.floor(damage) / settings[Setting.Precision]
  source.state.totalStrengthDealt += source.state.strengthDealt
  target.state.strengthLoss += source.state.strengthDealt
}

// Global targeting

const sumArchetypeStrength = (frontline: Frontline) => {
  const archetypes = <{ [key in UnitType]: number }>{}

  const add = (cohort: Cohort) => {
    const archetype = cohort.properties.parent ?? cohort.properties.type
    archetypes[archetype] = (archetypes[archetype] ?? 0) + cohort[UnitAttribute.Strength]
  }
  iterateFrontline(frontline, add)
  return archetypes
}

const sumArchetypeCounter = (frontline: Frontline, archetypes: UnitType[]) => {
  const archetypeCounters = toObj(
    archetypes,
    key => key,
    () => 0
  )

  const add = (cohort: Cohort) => {
    const add2 = (type: UnitType) => {
      archetypeCounters[type] += cohort.properties[type] * cohort[UnitAttribute.Strength]
      archetypes.forEach(add2)
    }
  }
  iterateFrontline(frontline, add)
  return archetypeCounters
}

const calculateCounterPenalty = (
  archetypes: { [key in UnitType]: number },
  counters: { [key in UnitType]: number },
  settings: Settings
) => {
  return map(
    archetypes,
    (strength, type) =>
      strength &&
      clamp(counters[type] / strength, -settings[Setting.MaxCountering], settings[Setting.MaxCountering]) *
        settings[Setting.CounteringDamage]
  )
}

const calculateDamages = (
  frontline: Frontline,
  counterPenalties: { [key in UnitType]: number },
  pips: number,
  settings: Settings
) => {
  const multiplier = pips * settings[Setting.StrengthLostMultiplier]
  let total = 0
  const calculateDamage = (cohort: Cohort) => {
    const damage =
      cohort.properties[UnitAttribute.Damage] *
      cohort[UnitAttribute.Strength] *
      multiplier *
      (1 - counterPenalties[cohort.properties.type])
    cohort.state.damageDealt = damage
    total += damage
  }
  iterateFrontline(frontline, calculateDamage)
  return total
}

const calculateLosses = (frontline: Frontline, totalStrength: number, totalDamage: number) => {
  let total = 0
  const calculateLoss = (cohort: Cohort) => {
    const loss =
      (totalDamage * cohort[UnitAttribute.Strength]) / totalStrength / cohort.properties[UnitAttribute.Toughness]
    cohort.state.strengthLoss = loss
    total += loss
  }
  iterateFrontline(frontline, calculateLoss)
  return total
}

const calculateKills = (frontline: Frontline, totalKills: number, totalDamage: number) => {
  const calculateLoss = (cohort: Cohort) => {
    const kills = (totalKills * cohort.state.damageDealt) / totalDamage
    cohort.state.strengthDealt = kills
  }
  iterateFrontline(frontline, calculateLoss)
}

/**
 * CK3 damage formula. Only uses CK3 stuff.
 */
const attackGlobalSub = (a: Frontline, b: Frontline, pipsA: number, pipsB: number, settings: Settings) => {
  const archetypesA = sumArchetypeStrength(a)
  const strengthA = sum(toArr(archetypesA))
  const archetypesB = sumArchetypeStrength(b)
  const strengthB = sum(toArr(archetypesA))
  const counterPenaltyA = calculateCounterPenalty(archetypesA, sumArchetypeCounter(b, keys(archetypesA)), settings)
  const counterPenaltyB = calculateCounterPenalty(archetypesB, sumArchetypeCounter(a, keys(archetypesB)), settings)
  const totalDamageA = calculateDamages(a, counterPenaltyA, pipsA, settings)
  const totalDamageB = calculateDamages(b, counterPenaltyB, pipsB, settings)
  const totalLossA = calculateLosses(a, strengthA, totalDamageB)
  const totalLossB = calculateLosses(b, strengthB, totalDamageA)
  calculateKills(a, totalLossB, totalDamageA)
  calculateKills(b, totalLossA, totalDamageB)
}
