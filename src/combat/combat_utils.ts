
import { sumBy, sum } from 'lodash'
import { Terrain, TerrainCalc, Setting, UnitAttribute, UnitData, CombatPhase, GeneralAttribute, SideType, LocationType, CohortProperties, SiteSettings, Cohorts, Cohort, Frontline, Reserve, Side, GeneralValues, Environment } from 'types'
import { calculateValue } from 'definition_values'

/**
 * Calculates the roll modifier based on skill level difference of generals.
 * Every two levels increase dice roll by one (rounded down).
 */
export const calculateGeneralPips = (values: GeneralValues, enemy: GeneralValues, phase: CombatPhase): number => {
  const martialPip = Math.floor((values[GeneralAttribute.Martial] - enemy[GeneralAttribute.Martial]) / 2.0)
  const phasePip = values[phase] - enemy[phase]
  return Math.max(0, martialPip + phasePip)
}

export const getTerrainPips = (terrains: Terrain[], side: SideType, values: GeneralValues, enemy: GeneralValues) => {
  const enableTiles = side === SideType.Attacker
  const enableBorders = side === SideType.Attacker || values[GeneralAttribute.Maneuver] <= enemy[GeneralAttribute.Maneuver]
  terrains = terrains.filter(terrain => terrain.location === LocationType.Border ? enableBorders : enableTiles)
  return sumBy(terrains, terrain => calculateValue(terrain, TerrainCalc.Roll))
}

/**
 * Calculates the roll modifier from unit pips.
 */
export const calculateCohortPips = (source: CohortProperties, target: CohortProperties, targetSupport: CohortProperties | null, type: UnitAttribute.Strength | UnitAttribute.Morale, phase?: CombatPhase): number => {
  return getOffensiveCohortPips(source, type, phase) + getDefensiveCohortPips(target, type, phase) + getDefensiveSupportCohortPips(targetSupport, type, phase)
}

export const getOffensiveCohortPips = (cohort: CohortProperties, type: UnitAttribute.Strength | UnitAttribute.Morale, phase?: CombatPhase): number => {
  if (type === UnitAttribute.Morale)
    return cohort[UnitAttribute.OffensiveMoralePips]
  if (phase === CombatPhase.Shock)
    return cohort[UnitAttribute.OffensiveShockPips]
  if (phase === CombatPhase.Fire)
    return cohort[UnitAttribute.OffensiveFirePips]
  return 0
}

export const getDefensiveCohortPips = (cohort: CohortProperties, type: UnitAttribute.Strength | UnitAttribute.Morale, phase?: CombatPhase): number => {
  if (type === UnitAttribute.Morale)
    return -cohort[UnitAttribute.DefensiveMoralePips]
  if (phase === CombatPhase.Shock)
    return -cohort[UnitAttribute.DefensiveShockPips]
  if (phase === CombatPhase.Fire)
    return -cohort[UnitAttribute.DefensiveFirePips]
  return 0
}

export const getDefensiveSupportCohortPips = (cohort: CohortProperties | null, type: UnitAttribute.Strength | UnitAttribute.Morale, phase?: CombatPhase): number => {
  return cohort ? Math.ceil(cohort[UnitAttribute.DefensiveSupport] * getDefensiveCohortPips(cohort, type, phase)) : 0
}

export const calculateExperienceReduction = (settings: SiteSettings, target: UnitData) => {
  let damageReductionPerExperience = settings[Setting.ExperienceDamageReduction]
  // Bug in game which makes morale damage taken and strength damage taken affect damage reduction from experience.
  if (!settings[Setting.FixExperience])
    damageReductionPerExperience *= (2.0 + calculateValue(target, UnitAttribute.MoraleDamageTaken) + calculateValue(target, UnitAttribute.StrengthDamageTaken)) * 0.5
  return -damageReductionPerExperience * calculateValue(target, UnitAttribute.Experience)
}

export const getCombatPhase = (round: number, settings: SiteSettings) => {
  if (settings[Setting.FireAndShock]) {
    const phase = getCombatPhaseNumber(round, settings)
    if (phase)
      return phase % 2 ? CombatPhase.Fire : CombatPhase.Shock
  }
  return CombatPhase.Default
}

export const getCombatPhaseByPhaseNumber = (phase: number, settings: SiteSettings) => {
  if (settings[Setting.FireAndShock]) {
    if (phase)
      return phase % 2 ? CombatPhase.Fire : CombatPhase.Shock
  }
  return CombatPhase.Default
}


export const getCombatPhaseNumber = (round: number, settings: SiteSettings) => Math.ceil(round / settings[Setting.PhaseLength])

export const getDailyIncrease = (round: number, settings: SiteSettings) => settings[Setting.DailyDamageIncrease] * round

export const calculateTotalStrength = (cohorts: Cohorts, includeDefeated: boolean) => {
  let strength = 0.0
  const addRatio = (cohort: Cohort) => {
    if (includeDefeated || !cohort.state.isDefeated)
      strength += cohort[UnitAttribute.Strength]
  }
  iterateCohorts(cohorts, addRatio)
  return strength
}

/** Calls a function for every cohort.  */
export const iterateCohorts = (cohorts: Cohorts, func: (cohort: Cohort) => void) => {
  let i = 0, j = 0
  let length = cohorts.frontline.length
  let length2 = cohorts.frontline[0].length
  for (; i < length; i++) {
    for (; j < length2; j++) {
      if (cohorts.frontline[i][j])
        func(cohorts.frontline[i][j]!)
    }
  }
  cohorts.reserve.front.forEach(func)
  cohorts.reserve.front.forEach(func)
  cohorts.reserve.flank.forEach(func)
  cohorts.reserve.support.forEach(func)
  cohorts.defeated.forEach(func)
}

/**
 * Removes temporary defeated units from frontline.
 */
export const removeDefeated = (frontline: Frontline) => {
  for (let i = 0; i < frontline.length; i++) {
    for (let j = 0; j < frontline[i].length; j++) {
      const unit = frontline[i][j]
      if (!unit)
        continue
      if (unit.state.isDefeated)
        frontline[i][j] = null
    }
  }
}

/**
 * Calculates the next index when the order is from center to edges.
 */
export const nextIndex = (index: number, center: number) => index < center ? index + 2 * (center - index) : index - 2 * (index - center) - 1

export const reserveSize = (reserve: Reserve) => reserve.front.length + reserve.flank.length + reserve.support.length

export const armySize = (side: Side, round: number) => {
  return sum(side.armies.map(army => (round === -1 || army.arrival <= round) ? reserveSize(army.reserve) : 0))
    + side.cohorts.frontline[0].filter(unit => unit).length + reserveSize(side.cohorts.reserve)
}

export const defeatCohort = (environment: Environment, cohort: Cohort) => {
  // Defeating a defeated cohort shouldn't change the time of defeat.
  if (!cohort.state.isDefeated)
    cohort.state.defeatedRound = environment.day
  cohort.state.isDefeated = true
  cohort.state.isDestroyed = cohort[UnitAttribute.Strength] <= 0
}

export const wipeCohort = (environment: Environment, cohort: Cohort) => {
  cohort[UnitAttribute.Morale] = 0
  cohort[UnitAttribute.Strength] = 0
  defeatCohort(environment, cohort)
}