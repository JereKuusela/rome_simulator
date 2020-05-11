import { Mode, UnitDefinitionValues, ArmyPart, SideType, UnitDefinitions, UnitType, Units, Unit, CombatCohorts, SiteSettings, Reserve, Cohort, CohortDefinition } from 'types'
import { mergeValues, shrinkValues } from 'definition_values'
import { map, filter } from 'utils'
import { applyDynamicAttributes } from 'managers/units'

/** Merges cohort definitions with their units to get actual cohorts. */
export const convertReserveDefinitions = (settings: SiteSettings, reserve: Reserve, units: Units): Reserve => reserve.map(cohort => convertCohortDefinition(settings, cohort, units))

export const convertCohortDefinition = (settings: SiteSettings, cohort: CohortDefinition, units: Units): Cohort => applyDynamicAttributes(mergeValues(units[cohort.type], cohort), settings)

/** Shrinks definition values under name of the unit, preventing values being overwritten when merging definitions. */
export const shrinkUnits = <T extends UnitDefinitions | Units>(definitions: T) => map(definitions, unit => shrinkValues(unit, unit.type)) as T

export const convertUnitDefinitions = (settings: SiteSettings, definitions: UnitDefinitions, general: UnitDefinitionValues): Units => {
  return map(definitions, (_, type) => convertUnitDefinition(settings, definitions, shrinkUnits(definitions), general, type))
}

export const convertUnitDefinition = (settings: SiteSettings, definitions: UnitDefinitions, parents: UnitDefinitions, general: UnitDefinitionValues, type: UnitType): Unit => {
  let unit = mergeValues(definitions[type], general[type])
  let parent = unit.parent
  const merged = [type]
  while (parent && !merged.includes(parent)) {
    merged.push(parent)
    unit = mergeValues(mergeValues(unit, parents[parent]), general[parent])
    parent = parents[parent]?.parent
  }
  return applyDynamicAttributes(unit, settings) as Unit
}

/**
 * Returns unit definitions for current battle mode.
 * @param mode
 * @param definitions 
 */
export const filterUnitDefinitions = (mode: Mode, definitions: Units): Units => filter(definitions, unit => unit.mode === mode)

export const getArmyPart = (units: CombatCohorts, type: ArmyPart) => {
  if (type === ArmyPart.Frontline)
    return units.frontline
  if (type === ArmyPart.Reserve)
    return [units.reserve.front.concat(units.reserve.flank).concat(units.reserve.support)]
  return [units.defeated]
}

export const getOpponent = (side: SideType) => side === SideType.Attacker ? SideType.Defender : SideType.Attacker
