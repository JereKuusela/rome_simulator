
import { sumBy, sum } from 'lodash'
import { TerrainDefinition, TerrainCalc, Setting, UnitAttribute, UnitDefinition, CombatPhase, GeneralAttribute, SideType, LocationType, CombatCohortDefinition, SiteSettings, CombatCohorts, CombatCohort, CombatFrontline, SortedReserve, CombatSide, GeneralValues } from 'types'
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

export const getTerrainPips = (terrains: TerrainDefinition[], side: SideType, values: GeneralValues, enemy: GeneralValues) => {
  const enableTiles = side === SideType.Attacker
  const enableBorders = side === SideType.Attacker || values[GeneralAttribute.Maneuver] <= enemy[GeneralAttribute.Maneuver]
  terrains = terrains.filter(terrain => terrain.location === LocationType.Border ? enableBorders : enableTiles)
  return sumBy(terrains, terrain => calculateValue(terrain, TerrainCalc.Roll))
}

/**
 * Calculates the roll modifier from unit pips.
 */
export const calculateCohortPips = (source: CombatCohortDefinition, target: CombatCohortDefinition, targetSupport: CombatCohortDefinition | null, type: UnitAttribute.Strength | UnitAttribute.Morale, phase?: CombatPhase): number => {
  return getOffensiveCohortPips(source, type, phase) + getDefensiveCohortPips(target, type, phase) + getDefensiveSupportCohortPips(targetSupport, type, phase)
}

export const getOffensiveCohortPips = (cohort: CombatCohortDefinition, type: UnitAttribute.Strength | UnitAttribute.Morale, phase?: CombatPhase): number => {
  if (type === UnitAttribute.Morale)
    return cohort[UnitAttribute.OffensiveMoralePips]
  if (phase === CombatPhase.Shock)
    return cohort[UnitAttribute.OffensiveShockPips]
  if (phase === CombatPhase.Fire)
    return cohort[UnitAttribute.OffensiveFirePips]
  return 0
}

export const getDefensiveCohortPips = (cohort: CombatCohortDefinition, type: UnitAttribute.Strength | UnitAttribute.Morale, phase?: CombatPhase): number => {
  if (type === UnitAttribute.Morale)
    return -cohort[UnitAttribute.DefensiveMoralePips]
  if (phase === CombatPhase.Shock)
    return -cohort[UnitAttribute.DefensiveShockPips]
  if (phase === CombatPhase.Fire)
    return -cohort[UnitAttribute.DefensiveFirePips]
  return 0
}

export const getDefensiveSupportCohortPips = (cohort: CombatCohortDefinition | null, type: UnitAttribute.Strength | UnitAttribute.Morale, phase?: CombatPhase): number => {
  return cohort ? Math.ceil(cohort[UnitAttribute.DefensiveSupport] * getDefensiveCohortPips(cohort, type, phase)) : 0
}

export const calculateExperienceReduction = (settings: SiteSettings, target: UnitDefinition) => {
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

export const stackWipe = (cohorts: CombatCohorts) => {
  const { frontline, reserve, defeated } = cohorts

  for (let i = 0; i < defeated.length; i++) {
    defeated[i][UnitAttribute.Strength] = 0
    defeated[i][UnitAttribute.Morale] = 0

  }

  const removeFromReserve = (part: CombatCohort[]) => {
    for (let i = 0; i < part.length; i++) {
      const cohort = part[i]
      cohort[UnitAttribute.Strength] = 0
      cohort[UnitAttribute.Morale] = 0
      defeated.push(cohort)
    }
    part.length = 0
  }

  for (let i = 0; i < frontline.length; i++) {
    for (let j = 0; j < frontline[i].length; j++) {
      const cohort = frontline[i][j]
      if (!cohort)
        continue
      cohort[UnitAttribute.Strength] = 0
      cohort[UnitAttribute.Morale] = 0
      if (!cohort.state.isDefeated)
        defeated.push(cohort)
      frontline[i][j] = null
    }
  }
  removeFromReserve(reserve.front)
  removeFromReserve(reserve.flank)
  removeFromReserve(reserve.support)
}

export const calculateTotalStrength = (cohorts: CombatCohorts) => {
  let strength = 0.0
  const addRatio = (cohorts: (CombatCohort | null)[]) => {
    for (let i = 0; i < cohorts.length; i++) {
      const cohort = cohorts[i]
      if (!cohort || cohort.state.isDefeated)
        continue
      strength += cohort[UnitAttribute.Strength]
    }
  }
  iterateCohorts(cohorts, addRatio)
  return strength
}

export const iterateCohorts = (cohorts: CombatCohorts, func: (cohorts: (CombatCohort | null)[]) => void) => {
  for (let i = 0; i < cohorts.frontline.length; i++)
    func(cohorts.frontline[i])
  func(cohorts.reserve.front)
  func(cohorts.reserve.flank)
  func(cohorts.reserve.support)
  func(cohorts.defeated)
}

/**
 * Removes temporary defeated units from frontline.
 */
export const removeDefeated = (frontline: CombatFrontline) => {
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

export const reserveSize = (reserve: SortedReserve) => reserve.front.length + reserve.flank.length + reserve.support.length

export const armySize = (side: CombatSide, round: number) => {
  return sum(side.armies.map(army => (round === -1 || army.arrival <= round) ? reserveSize(army.reserve) : 0))
    + side.cohorts.frontline[0].filter(unit => unit).length + reserveSize(side.cohorts.reserve)
}
