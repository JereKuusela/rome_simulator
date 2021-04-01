import {
  Mode,
  UnitValues,
  ArmyPart,
  SideType,
  UnitsData,
  UnitType,
  UnitDefinitions,
  UnitDefinition,
  Cohorts,
  CombatSharedSettings,
  ReserveDefinition,
  CohortDefinition,
  CohortData
} from 'types'
import { mergeValues, shrinkValues } from 'data_values'
import { map, filter } from 'utils'
import { applyDynamicAttributes } from 'managers/units'

/** Merges cohort definitions with their units to get actual cohorts. */
export const convertReserveDefinitions = (
  settings: CombatSharedSettings,
  reserve: ReserveDefinition,
  units: UnitDefinitions
): ReserveDefinition => reserve.map(cohort => convertCohortDefinition(settings, cohort, units))

export const convertCohortDefinition = (
  settings: CombatSharedSettings,
  cohort: CohortData,
  units: UnitDefinitions
): CohortDefinition => applyDynamicAttributes(mergeValues(units[cohort.type], cohort), settings)

/** Shrinks definition values under name of the unit, preventing values being overwritten when merging definitions. */
export const shrinkUnits = <T extends UnitsData | UnitDefinitions>(definitions: T) =>
  map(definitions, unit => shrinkValues(unit, unit.type)) as T

export const convertUnitDefinitions = (
  settings: CombatSharedSettings,
  definitions: UnitsData,
  general: UnitValues
): UnitDefinitions => {
  return map(definitions, (_, type) =>
    convertUnitDefinition(settings, definitions, shrinkUnits(definitions), general, type)
  )
}

export const convertUnitDefinition = (
  settings: CombatSharedSettings,
  definitions: UnitsData,
  parents: UnitsData,
  general: UnitValues,
  type: UnitType
): UnitDefinition => {
  let unit = mergeValues(definitions[type], general[type])
  let parent = unit.parent
  const merged = [type]
  while (parent && !merged.includes(parent)) {
    merged.push(parent)
    unit = mergeValues(mergeValues(unit, parents[parent]), general[parent])
    parent = parents[parent]?.parent
  }
  return applyDynamicAttributes(unit, settings) as UnitDefinition
}

/**
 * Returns unit definitions for current battle mode.
 * @param mode
 * @param definitions
 */
export const filterUnitDefinitions = (mode: Mode, definitions: UnitDefinitions): UnitDefinitions =>
  filter(definitions, unit => unit.mode === mode)

export const getArmyPart = (units: Cohorts, type: ArmyPart) => {
  if (type === ArmyPart.Frontline) return units.frontline
  if (type === ArmyPart.Reserve) return [units.reserve.front.concat(units.reserve.flank).concat(units.reserve.support)]
  if (type === ArmyPart.Defeated) return [units.defeated]
  return [units.retreated]
}

export const getOpponent = (side: SideType) => (side === SideType.A ? SideType.B : SideType.A)
