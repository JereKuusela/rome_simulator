
import { TacticDefinition, UnitAttribute, Setting, UnitRole, Settings, CombatPhase, CombatCohorts, CombatCohort, CombatFrontline, CombatDefeated, CombatSide, TerrainDefinition, CombatField, TacticCalc } from 'types'
import { noZero } from 'utils'
import { calculateValue } from 'definition_values'
import { getCombatPhase, calculateCohortPips, getDailyIncrease, iterateCohorts, removeDefeated, calculateTotalStrength, stackWipe, reserveSize, reinforce, calculateGeneralPips, getTerrainPips } from 'combat'

/**
 * Makes given armies attach each other.
 */
export const doBattle = (field: CombatField, a: CombatSide, d: CombatSide, markDefeated: boolean) => {
  const settings = field.settings
  const phase = getCombatPhase(field.round, settings)
  if (markDefeated) {
    removeDefeated(a.cohorts.frontline)
    removeDefeated(d.cohorts.frontline)
  }
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
  const tacticStrengthDamageMultiplier = settings[Setting.Tactics] ? 1.0 + calculateValue(a.generals[0].tactic, TacticCalc.Casualties) + calculateValue(d.generals[0].tactic, TacticCalc.Casualties) : 1.0
  a.results.dailyMultiplier = dailyMultiplier
  d.results.dailyMultiplier = dailyMultiplier
  attack(a, d, dailyMultiplier, tacticStrengthDamageMultiplier, field.terrains, phase, settings)
  attack(d, a, dailyMultiplier, tacticStrengthDamageMultiplier, field.terrains, phase, settings)

  applyLosses(a.cohorts.frontline)
  applyLosses(d.cohorts.frontline)
  a.alive = moveDefeated(a.cohorts.frontline, a.cohorts.defeated, markDefeated, field.round, settings) || reserveSize(a.cohorts.reserve) > 0
  d.alive = moveDefeated(d.cohorts.frontline, d.cohorts.defeated, markDefeated, field.round, settings) || reserveSize(d.cohorts.reserve) > 0
  if (settings[Setting.Stackwipe] && !d.alive)
    checkHardStackWipe(d.cohorts, a.cohorts, settings, field.round < settings[Setting.StackwipeRounds])
  else if (settings[Setting.Stackwipe] && !a.alive)
    checkHardStackWipe(a.cohorts, d.cohorts, settings, field.round < settings[Setting.StackwipeRounds])
}

const checkHardStackWipe = (defeated: CombatCohorts, enemy: CombatCohorts, settings: Settings, soft: boolean) => {
  const total = calculateTotalStrength(defeated)
  const totalEnemy = calculateTotalStrength(enemy)
  if (totalEnemy / total > (soft ? settings[Setting.SoftStackWipeLimit] : settings[Setting.HardStackWipeLimit]))
    stackWipe(defeated)
}

const getBackTarget = (target: CombatFrontline, index: number) => target.length > 1 ? target[1][index] : null

/**
 * Selects targets for units.
 */
const pickTargets = (source: CombatFrontline, target: CombatFrontline, settings: Settings) => {
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
      state.moraleLoss = settings[Setting.DailyMoraleLoss] * (1 - unit.definition[UnitAttribute.DailyLossResist])
      state.strengthLoss = 0
      state.target = null
      state.flanking = false
      // No need to select targets for units without effect.
      if (i > 0 && !unit.definition[UnitAttribute.OffensiveSupport])
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
        const maneuver = Math.floor(unit.definition[UnitAttribute.Maneuver])
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
export const calculateTactic = (army: CombatCohorts, tactic: TacticDefinition, counterTactic?: TacticDefinition): number => {
  const effectiveness = counterTactic ? calculateValue(tactic, counterTactic.type) : 1.0
  let averageWeight = 1.0
  if (effectiveness > 0 && tactic && army) {
    let totalStrength = 0
    let totalWeight = 0.0

    const addWeight = (cohorts: (CombatCohort | null)[]) => {
      for (let i = 0; i < cohorts.length; i++) {
        const cohort = cohorts[i]
        if (!cohort || cohort.state.isDefeated)
          continue
        totalStrength += cohort[UnitAttribute.Strength]
        totalWeight += calculateValue(tactic, cohort.definition.type) * cohort[UnitAttribute.Strength]
      }
    }
    iterateCohorts(army, addWeight)
    if (totalStrength)
      averageWeight = totalWeight / totalStrength
  }

  return effectiveness * Math.min(1.0, averageWeight)
}

const calculateFlankRatioPenalty = (army: CombatCohorts, ratio: number, setting: Settings) => {
  return ratio && calculateFlankRatio(army) > ratio ? setting[Setting.InsufficientSupportPenalty] / (1 - setting[Setting.InsufficientSupportPenalty]) : 0.0
}

const calculateFlankRatio = (army: CombatCohorts): number => {
  let infantry = 0.0
  let flank = 0.0

  const addRatio = (cohorts: (CombatCohort | null)[]) => {
    for (let i = 0; i < cohorts.length; i++) {
      const cohort = cohorts[i]
      if (!cohort || cohort.state.isDefeated)
        continue
      if (cohort.definition.role === UnitRole.Front)
        infantry += cohort[UnitAttribute.Strength]
      if (cohort.definition.role === UnitRole.Flank)
        flank += cohort[UnitAttribute.Strength]
    }
  }
  iterateCohorts(army, addRatio)
  return flank / noZero(flank + infantry)
}

/**
 * Applies stored losses to units.
 */
const applyLosses = (frontline: CombatFrontline) => {
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
const moveDefeated = (frontline: CombatFrontline, defeated: CombatDefeated, markDefeated: boolean, round: number, settings: Settings) => {
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

const attack = (source: CombatSide, target: CombatSide, dailyMultiplier: number, tacticStrengthDamageMultiplier: number, terrains: TerrainDefinition[], phase: CombatPhase, settings: Settings) => {
  // Tactic bonus changes dynamically when units lose strength so it can't be precalculated.
  // If this is a problem a fast mode can be implemeted where to bonus is only calculated once.
  const generalS = source.generals[0]
  const generalT = target.generals[0]
  const generalPips =  calculateGeneralPips(generalS.values, generalT.values, phase)
  const terrainPips = getTerrainPips(terrains, source.type, generalS.values, generalT.values)

  source.results.tacticStrengthDamageMultiplier = tacticStrengthDamageMultiplier
  source.results.tacticBonus = settings[Setting.Tactics] ? calculateTactic(source.cohorts, generalS.tactic, generalT.tactic) : 0.0
  source.results.flankRatioBonus = calculateFlankRatioPenalty(target.cohorts, target.flankRatio, settings)
  const multiplier = (1 + source.results.tacticBonus) * dailyMultiplier * (1 + source.results.flankRatioBonus)
  attackSub(source.cohorts.frontline, source.results.dice + generalPips + terrainPips, multiplier, tacticStrengthDamageMultiplier, phase, settings)
}

/**
 * Calculates losses when units attack their targets.
 */
const attackSub = (frontline: CombatFrontline, roll: number, dynamicMultiplier: number, strengthMultiplier: number, phase: CombatPhase, settings: Settings) => {
  for (let i = 0; i < frontline.length; i++) {
    for (let j = 0; j < frontline[i].length; j++) {
      const source = frontline[i][j]
      if (!source)
        continue
      const target = source.state.target
      if (!target)
        continue
      target.state.captureChance = source.definition[UnitAttribute.CaptureChance]
      const multiplier = calculateDamageMultiplier(source, target, dynamicMultiplier, i > 0, phase, settings)
      calculateMoraleLosses(source, target, source.state.targetSupport, roll, multiplier, phase, settings)
      calculateStrengthLosses(source, target, source.state.targetSupport, roll, multiplier * strengthMultiplier, phase, settings)
    }
  }
}

const calculateCohortDamageMultiplier = (source: CombatCohort, target: CombatCohort, isSupport: boolean, settings: Settings) => {
  const definitionS = source.definition
  const definitionT = target.definition

  return source[UnitAttribute.Strength]
    * (settings[Setting.AttributeOffenseDefense] ? 1.0 + definitionS[UnitAttribute.Offense] - definitionT[UnitAttribute.Defense] : 1.0)
    * (isSupport ? definitionS[UnitAttribute.OffensiveSupport] : 1.0)
}

const calculateDamageMultiplier = (source: CombatCohort, target: CombatCohort, dynamicMultiplier: number, isSupport: boolean, phase: CombatPhase, settings: Settings) => {
  dynamicMultiplier *= calculateCohortDamageMultiplier(source, target, isSupport, settings)
  if (settings[Setting.DamageLossForMissingMorale]) {
    const morale = source[UnitAttribute.Morale] / source.definition.maxMorale
    dynamicMultiplier *= 1 + (morale - 1) * settings[Setting.DamageLossForMissingMorale]
  }
  source.state.damageMultiplier = dynamicMultiplier * source.calculated.damage['Damage'][target.definition.type][phase] * target.calculated.damageTakenMultiplier / settings[Setting.Precision]
  return dynamicMultiplier
}


const calculatePips = (roll: number, maxPips: number, source: CombatCohort, target: CombatCohort, targetSupport: CombatCohort | null, type: UnitAttribute.Morale | UnitAttribute.Strength, phase?: CombatPhase) => {
  return Math.min(maxPips, Math.max(0, roll + calculateCohortPips(source.definition, target.definition, targetSupport ? targetSupport.definition : null, type, phase)))
}

const calculateMoraleLosses = (source: CombatCohort, target: CombatCohort, targetSupport: CombatCohort | null, roll: number, dynamicMultiplier: number, phase: CombatPhase, settings: Settings) => {
  const pips = calculatePips(roll, settings[Setting.MaxPips], source, target, targetSupport, UnitAttribute.Morale)
  const morale = settings[Setting.UseMaxMorale] ? source.definition.maxMorale : source[UnitAttribute.Morale]
  let damage = pips * dynamicMultiplier * source.calculated.damage[UnitAttribute.Morale][target.definition.type][phase] * morale * target.calculated.moraleTakenMultiplier
  if (settings[Setting.MoraleDamageBasedOnTargetStrength])
    damage /= target[UnitAttribute.Strength]

  source.state.moraleDealt = Math.floor(damage) / settings[Setting.Precision]
  source.state.totalMoraleDealt += source.state.moraleDealt
  target.state.moraleLoss += source.state.moraleDealt
  // Morale damage seems to carry over only when not flanking (but this can be wrong).
  if (!source.state.flanking && targetSupport)
    targetSupport.state.moraleLoss += source.state.moraleDealt
}

const calculateStrengthLosses = (source: CombatCohort, target: CombatCohort, targetSupport: CombatCohort | null, roll: number, dynamicMultiplier: number, phase: CombatPhase, settings: Settings) => {
  const pips = calculatePips(roll, settings[Setting.MaxPips], source, target, targetSupport, UnitAttribute.Strength, phase)
  const damage = pips * dynamicMultiplier * source.calculated.damage[UnitAttribute.Strength][target.definition.type][phase] * target.calculated.strengthTakenMultiplier[phase]

  source.state.strengthDealt = Math.floor(damage) / settings[Setting.Precision]
  source.state.totalStrengthDealt += source.state.strengthDealt
  target.state.strengthLoss += source.state.strengthDealt
}
