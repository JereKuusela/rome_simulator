import { General } from "reducers/countries"
import { calculateValue, clearAllValues, mergeValues, calculateBase } from "definition_values"
import { GeneralCalc, UnitDefinitionValues, UnitType, UnitDefinitionValue, UnitDefinition, UnitCalc } from "types"
import { filterKeys } from "utils"
import { DefinitionType, Mode } from "base_definition"

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

export const getGeneralDefinitions = (general: General): UnitDefinitionValues => filterKeys(general.definitions, type => !(type in DefinitionType))

export const getGeneralDefinition = (general: General, type: UnitType): UnitDefinitionValue => general.definitions[type]

export const getGeneralBaseDefinition = (general: General, mode: Mode): UnitDefinitionValue => {
  return mergeValues(general.definitions[DefinitionType.Global], general.definitions[mode])
}

export const unitSorter = (definition: UnitDefinition, mode: Mode) => {
  if (mode === DefinitionType.Naval)
    return calculateBase(definition, UnitCalc.Cost)
  return definition.type
}
