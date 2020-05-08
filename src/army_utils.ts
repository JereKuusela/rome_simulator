import { Cohorts, Mode, UnitDefinitionValues, ArmyType, SideType, UnitDefinitions, UnitType, Units, Unit, CombatCohorts, SiteSettings } from 'types'
import { mergeValues, shrinkValues } from 'definition_values'
import { map, filter } from 'utils'
import { applyDynamicAttributes } from 'managers/units'

/** Merges cohort definitions with their units to get actual cohorts. */
export const convertCohortDefinitions = (settings: SiteSettings, cohorts: Cohorts, units: Units): Cohorts => {
  units = shrinkUnits(units)
  return {
    frontline: cohorts.frontline.map(row => row.map(cohort => cohort && applyDynamicAttributes(mergeValues(units[cohort.type], cohort), settings))),
    reserve: cohorts.reserve.map(cohort => cohort && applyDynamicAttributes(mergeValues(units[cohort.type], cohort), settings)),
    defeated: cohorts.defeated.map(cohort => cohort && applyDynamicAttributes(mergeValues(units[cohort.type], cohort), settings))
  }
}

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

let unitId = 0
/**
 * Returns a new id.
 * This is only meant for non-persisted ids because any existing ids are not considered.
 */
export const getNextId = () => ++unitId

export const getArmyPart = (units: CombatCohorts, type: ArmyType) => {
  if (type === ArmyType.Frontline)
    return units.frontline
  if (type === ArmyType.Reserve)
    return [units.reserve.front.concat(units.reserve.flank).concat(units.reserve.support)]
  return [units.defeated]
}

export const getOpponent = (side: SideType) => side === SideType.Attacker ? SideType.Defender : SideType.Attacker
