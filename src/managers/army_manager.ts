import { General } from "../store/countries"
import { GeneralCalc, UnitDefinitionValues, UnitType, UnitDefinitionValue, UnitDefinition, UnitCalc } from "../store/units"
import { calculateValue, clearAllValues, mergeValues, calculateBase } from "../definition_values"
import { Mode, DefinitionType } from "../base_definition"
import { map, filterKeys } from "../utils"

export type GeneralStats = {
  enabled: boolean
  martial: number
  base_martial: number
  trait_martial: number
}

/**
 * Returns how much capture chance given martial skill gives.
 * @param martial 
 */
export const martialToCaptureChance = (martial: number) => 0.002 * martial

const BASE_MARTIAL_KEY = 'Base stat'

export const getGeneralStats = (general: General): GeneralStats => {
  const martial = calculateValue(general, GeneralCalc.Martial)
  const trait_martial = calculateValue(clearAllValues(general, BASE_MARTIAL_KEY), GeneralCalc.Martial)
  return {
    enabled: general.enabled,
    martial: general.enabled ? martial : 0,
    base_martial: martial - trait_martial,
    trait_martial
  }
}

export const getGeneralDefinitions = (general: General, mode: Mode): UnitDefinitionValues => {
  const base = mergeValues(general.definitions[DefinitionType.Global], general.definitions[mode])
  const unit_definitions = filterKeys(general.definitions, type => !(type in DefinitionType)) as UnitDefinitionValues
  return map(unit_definitions, definition => mergeValues(base, definition))
}

export const getGeneralDefinition = (general: General, mode: Mode, type: UnitType): UnitDefinitionValue => {
  const base = mergeValues(general.definitions[DefinitionType.Global], general.definitions[mode])
  return mergeValues(base, general.definitions[type])
}

export const getGeneralBaseDefinition = (general: General, mode: Mode): UnitDefinitionValue => {
  return mergeValues(general.definitions[DefinitionType.Global], general.definitions[mode])
}

export const unitSorter = (definition: UnitDefinition, mode: Mode) => {
  if (mode === DefinitionType.Naval)
    return calculateBase(definition, UnitCalc.Cost)
  return definition.type
}
