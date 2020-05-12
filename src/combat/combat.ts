
import { TacticDefinition, UnitAttribute, Setting, UnitRole, Settings, CombatPhase, Cohorts, Cohort, Frontline, Defeated, Side, Terrain, Environment, TacticCalc } from 'types'
import { noZero } from 'utils'
import { calculateValue } from 'definition_values'
import { getCombatPhase, calculateCohortPips, getDailyIncrease, iterateCohorts, removeDefeated, calculateTotalStrength, stackWipe, reserveSize, reinforce, calculateGeneralPips, getTerrainPips } from 'combat'
import { deploy } from './deployment'
import { getLeadingGeneral } from 'managers/battle'

/**
 * Makes given armies attach each other.
 */
export const doBattle = (field: Environment, a: Side, d: Side, markDefeated: boolean) => {
  const settings = field.settings
  const phase = getCombatPhase(field.round, settings)
  if (markDefeated) {
    removeDefeated(a.cohorts.frontline)
    removeDefeated(d.cohorts.frontline)
  }
  deploy(field, a, d)
  reinforce(field, a)
  if (!settings[Setting.DefenderAdvantage])
    reinforce(field, d)
  pickTargets(a.cohorts.frontline, d.cohorts.frontline, settings)
  if (settings[Setting.DefenderAdvantage])
    reinforce(field, d)
  pickTargets(d.cohorts.frontline, a.cohorts.frontline, settings)

  // Tactic bonus changes dynamically when units lose strength so it can't be precalculated.
  // If this is a problem a fast mode can be implemeted where to bonus is only calculated once.
  a.results.round = field.round
  d.results.round = field.round
  const dailyMultiplier = 1 + getDailyIncrease(field.round, settings)
  const generalA = getLeadingGeneral(a)
  const generalD = getLeadingGeneral(d)
  const tacticStrengthDamageMultiplier = generalA && generalD && settings[Setting.Tactics] ? 1.0 + calculateValue(generalA.tactic, TacticCalc.Casualties) + calculateValue(generalD.tactic, TacticCalc.Casualties) : 1.0
  a.results.dailyMultiplier = dailyMultiplier
  d.results.dailyMultiplier = dailyMultiplier
  attack(a, d, dailyMultiplier, tacticStrengthDamageMultiplier, field.terrains, phase, settings)
  attack(d, a, dailyMultiplier, tacticStrengthDamageMultiplier, field.terrains, phase, settings)

  applyLosses(a.cohorts.frontline)
  applyLosses(d.cohorts.frontline)

  a.alive = moveDefeated(a.cohorts.frontline, a.cohorts.defeated, markDefeated, field.round, settings) || reserveSize(a.cohorts.reserve) > 0
  d.alive = moveDefeated(d.cohorts.frontline, d.cohorts.defeated, markDefeated, field.round, settings) || reserveSize(d.cohorts.reserve) > 0
  if (settings[Setting.Stackwipe] && !d.alive)
    checkHardStackWipe(d, a.cohorts, settings, field.round < settings[Setting.StackwipeRounds])
  else if (settings[Setting.Stackwipe] && !a.alive)
    checkHardStackWipe(a, d.cohorts, settings, field.round < settings[Setting.StackwipeRounds])
  if (!a.alive || !d.alive)
    field.duration = 0
  // Check if a new battle can started.
  a.alive = a.alive || a.armies.length > 0
  d.alive = d.alive || d.armies.length > 0
}

const checkHardStackWipe = (side: Side, enemy: Cohorts, settings: Settings, soft: boolean) => {
  const total = calculateTotalStrength(side.cohorts)
  const totalEnemy = calculateTotalStrength(enemy)
  if (totalEnemy / total > (soft ? settings[Setting.SoftStackWipeLimit] : settings[Setting.HardStackWipeLimit])) {}
    stackWipe(side)
}

const getBackTarget = (target: Frontline, index: number) => target.length > 1 ? target[1][index] : null

/**
 * Selects targets for units.
 */
const pickTargets = (source: Frontline, target: Frontline, settings: Settings) => {
  const sourceLength = source[0].length
  const targetLength = target[0].length
  for (let i = 0; i < source.length; i++) {
    for (let j = 0; j < source[i].length; j++) {
      const unit = source[i][j]
      if (!unit)
        continue
      const state = unit.state
      state.damageMultiplier = 0
      state.moraleDealt = 0
      state.strengthDealt = 0
      state.moraleLoss = settings[Setting.DailyMoraleLoss] * (1 - unit.properties[UnitAttribute.DailyLossResist])
      state.strengthLoss = 0
      state.target = null
      state.flanking = false
      // No need to select targets for units without effect.
      if (i > 0 && !unit.properties[UnitAttribute.OffensiveSupport])
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
        const maneuver = Math.floor(unit.properties[UnitAttribute.Maneuver])
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
      if (!cohort.state.isDefeated) {
        totalStrength += cohort[UnitAttribute.Strength]
        totalWeight += calculateValue(tactic, cohort.properties.type) * cohort[UnitAttribute.Strength]
      }
    }
    iterateCohorts(army, addWeight)
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
    if (cohort.state.isDefeated)
      return
    if (cohort.properties.role === UnitRole.Front)
      infantry += cohort[UnitAttribute.Strength]
    if (cohort.properties.role === UnitRole.Flank)
      flank += cohort[UnitAttribute.Strength]
  }
  iterateCohorts(army, addRatio)
  return flank / noZero(flank + infantry)
}

/**
 * Applies stored losses to units.
 */
const applyLosses = (frontline: Frontline) => {
  for (let i = 0; i < frontline.length; i++) {
    for (let j = 0; j < frontline[i].length; j++) {
      const unit = frontline[i][j]
      if (!unit)
        continue
      unit[UnitAttribute.Morale] = Math.max(0, unit[UnitAttribute.Morale] - unit.state.moraleLoss)
      unit[UnitAttribute.Strength] = Math.max(0, unit[UnitAttribute.Strength] - unit.state.strengthLoss)
    }
  }
}

/**
 * Moves defeated units from a frontline to defeated.
 */
const moveDefeated = (frontline: Frontline, defeated: Defeated, markDefeated: boolean, round: number, settings: Settings) => {
  const minimumMorale = settings[Setting.MinimumMorale]
  const minimumStrength = settings[Setting.MinimumStrength]
  let alive = false
  for (let i = 0; i < frontline.length; i++) {
    for (let j = 0; j < frontline[i].length; j++) {
      const unit = frontline[i][j]
      if (!unit)
        continue
      if (unit[UnitAttribute.Strength] > minimumStrength && unit[UnitAttribute.Morale] > minimumMorale) {
        alive = true
        continue
      }
      if (i > 0 && !settings[Setting.BackRowRetreat]) {
        alive = true
        continue
      }
      if (settings[Setting.DynamicTargeting])
        unit.isWeak = true
      if (settings[Setting.RetreatRounds] > round + 1) {
        alive = true
        continue
      }
      unit.state.isDestroyed = unit[UnitAttribute.Strength] <= 0
      if (markDefeated)
        frontline[i][j] = { ...unit, state: { ...unit.state, isDefeated: true } } // Temporary copy for UI purposes.
      else
        frontline[i][j] = null
      unit.state.target = null
      defeated.push(unit)
    }
  }
  return alive
}

const attack = (source: Side, target: Side, dailyMultiplier: number, tacticStrengthDamageMultiplier: number, terrains: Terrain[], phase: CombatPhase, settings: Settings) => {
  // Tactic bonus changes dynamically when units lose strength so it can't be precalculated.
  // If this is a problem a fast mode can be implemeted where to bonus is only calculated once.
  const generalS = getLeadingGeneral(source)
  const generalT = getLeadingGeneral(target)
  const generalPips = generalS && generalT ? calculateGeneralPips(generalS.values, generalT.values, phase) : 0
  const terrainPips = generalS && generalT ? getTerrainPips(terrains, source.type, generalS.values, generalT.values) : 0

  source.results.generalPips = generalPips
  source.results.terrainPips = terrainPips
  source.results.tacticStrengthDamageMultiplier = tacticStrengthDamageMultiplier
  source.results.tacticBonus = settings[Setting.Tactics] && generalS && generalT ? calculateTactic(source.cohorts, generalS.tactic, generalT.tactic) : 0.0
  source.results.flankRatioBonus = calculateFlankRatioPenalty(target.cohorts, target.flankRatio, settings)
  const multiplier = (1 + source.results.tacticBonus) * dailyMultiplier * (1 + source.results.flankRatioBonus)
  attackSub(source.cohorts.frontline, source.results.dice + generalPips + terrainPips, multiplier, tacticStrengthDamageMultiplier, phase, settings)
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
