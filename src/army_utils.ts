import { Cohorts, Mode, UnitDefinitionValues, ArmyType, Side, BaseUnits, UnitType, Units, Unit, Settings } from 'types'
import { mergeValues } from 'definition_values'
import { map, filter } from 'utils'
import { CombatCohorts } from 'combat'
import { applyDynamicAttributes } from 'managers/units'

/**
 * Merges base units with their definitions resulting in real units.
 * @param cohorts Base units to merge. 
 * @param units Definitions to merge.
 */
export const mergeBaseUnitsWithDefinitions = (settings: Settings, cohorts: Cohorts, units: Units): Cohorts => ({
  frontline: cohorts.frontline.map(row => row.map(cohort => cohort && applyDynamicAttributes(mergeValues(units[cohort.type], cohort), settings))),
  reserve: cohorts.reserve.map(cohort => cohort && applyDynamicAttributes(mergeValues(units[cohort.type], cohort), settings)),
  defeated: cohorts.defeated.map(cohort => cohort && applyDynamicAttributes(mergeValues(units[cohort.type], cohort), settings))
})

export const mergeDefinitions = (settings: Settings, units: BaseUnits, general: UnitDefinitionValues): Units => {
  return map(units, (_, type) => mergeDefinition(settings, units, general, type))
}

export const mergeDefinition = (settings: Settings, units: BaseUnits, general: UnitDefinitionValues, type: UnitType): Unit => {
  let unit = mergeValues(units[type], general[type])
  let base = unit.base
  const merged = [type]
  while (base && !merged.includes(base)) {
    merged.push(base)
    unit = mergeValues(mergeValues(unit, units[base]), general[base])
    base = units[base].base
  }
  return applyDynamicAttributes(unit, settings) as Unit
}

/**
 * Returns unit definitions for current battle mode.
 * @param mode
 * @param definitions 
 */
export const filterUnitDefinitions = (mode: Mode, definitions: Units): Units => filter(definitions, unit => unit.mode === mode)

let unit_id = 0
/**
 * Returns a new id.
 * This is only meant for non-persisted ids because any existing ids are not considered.
 */
export const getNextId = () => ++unit_id

export const getArmyPart = (units: CombatCohorts, type: ArmyType) => {
  if (type === ArmyType.Frontline)
    return units.frontline
  if (type === ArmyType.Reserve)
    return [units.reserve.front.concat(units.reserve.flank).concat(units.reserve.support)]
  return [units.defeated]
}

export const getOpponent = (side: Side) => side === Side.Attacker ? Side.Defender : Side.Attacker
