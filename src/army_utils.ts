import { Cohorts, Mode, UnitDefinitionValues, ArmyType, Side, BaseUnits, UnitType, Units, Unit } from 'types'
import { mergeValues } from 'definition_values'
import { map, filter } from 'utils'
import { CombatUnits } from 'combat'

/**
 * Merges base units with their definitions resulting in real units.
 * @param units Base units to merge. 
 * @param definitions Definitions to merge.
 */
export const mergeBaseUnitsWithDefinitions = (units: Cohorts, definitions: Units): Cohorts => ({
  frontline: units.frontline.map(row => row.map(unit => unit && mergeValues(definitions[unit.type], unit))),
  reserve: units.reserve.map(value => value && mergeValues(definitions[value.type], value)),
  defeated: units.defeated.map(value => value && mergeValues(definitions[value.type], value))
})

export const mergeDefinitions = (units: BaseUnits, general: UnitDefinitionValues): Units => {
  return map(units, (_, type) => mergeDefinition(units, general, type))
}

export const mergeDefinition = (units: BaseUnits, general: UnitDefinitionValues, type: UnitType): Unit => {
  let unit = mergeValues(units[type], general[type])
  let base = unit.base
  const merged = [type]
  while (base && !merged.includes(base)) {
    merged.push(base)
    unit = mergeValues(mergeValues(unit, units[base]), general[base])
    base = units[base].base
  }
  return unit as Unit
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

export const getArmyPart = (units: CombatUnits, type: ArmyType) => {
  if (type === ArmyType.Frontline)
    return units.frontline
  if (type === ArmyType.Reserve)
    return [units.reserve]
  return [units.defeated]
}

export const getOpponent = (side: Side) => side === Side.Attacker ? Side.Defender : Side.Attacker
