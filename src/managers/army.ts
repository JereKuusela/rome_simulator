import { calculateValue, clearAllValues, mergeValues, calculateBase, addValues, regenerateValues } from 'definition_values'
import { DefinitionType, Mode, GeneralCalc, UnitDefinitionValues, UnitType, UnitDefinitionValue, Unit, UnitCalc, General, Army, ArmyType, BaseCohort, ValuesType, UnitValueType, TacticType, UnitPreferenceType, GeneralStats, BaseReserve, ScopeType, Modifier, BaseDefeated, BaseFrontLine } from 'types'
import { filterKeys, map, forEach, keys } from 'utils'
import { findLastIndex } from 'lodash'

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

export const unitSorter = (definition: Unit, mode: Mode) => {
  if (mode === DefinitionType.Naval)
    return calculateBase(definition, UnitCalc.Cost)
  return definition.type === UnitType.BaseLand ? '' : definition.type
}

export const getBaseUnitType = (mode: Mode) => mode === DefinitionType.Land ? UnitType.BaseLand : UnitType.BaseNaval


const findFromFrontline = (frontline: BaseFrontLine, id: number): [number, number] | undefined => {
  let ret: [number, number] | undefined = undefined
  forEach(frontline, (row, row_index) => forEach(row, (unit, column_index) => {
    if (unit.id === id)
      ret = [Number(row_index), Number(column_index)]
  }))
  return ret
}

const findFromReserve = (reserve: BaseReserve, id: number) => reserve.findIndex(unit => unit.id === id)
const findFromDefeated = (defeated: BaseDefeated, id: number) => defeated.findIndex(unit => unit.id === id)


const update = (army: Army, id: number, updater: (unit: BaseCohort) => BaseCohort): void => {
  let index = findFromReserve(army.reserve, id)
  if (index > -1) {
    army.reserve[index] = updater(army.reserve[index])
    return
  }
  const location = findFromFrontline(army.frontline, id)
  if (location) {
    const [row, column] = location
    army.frontline[row][column] = updater(army.frontline[row][column])
    return
  }
  index = findFromDefeated(army.defeated, id)
  if (index > -1) {
    army.defeated[index] = updater(army.defeated[index])
    return
  }
}

export const selectCohort = (army: Army, type: ArmyType, row: number, column: number, cohort: BaseCohort) => {
  if (type === ArmyType.Frontline) {
    if (!army.frontline[row])
      army.frontline[row] = {}
    army.frontline[row][column] = cohort
  }
  else if (type === ArmyType.Reserve && cohort && column > army.reserve.length)
    army.reserve.push(cohort)
  else if (type === ArmyType.Reserve && cohort)
    army.reserve[column] = cohort
  else if (type === ArmyType.Defeated && cohort)
    army.defeated[column] = cohort
  else if (type === ArmyType.Defeated && cohort && column > army.defeated.length)
    army.defeated.push(cohort)
}

export const toggleCohortLoyality = (army: Army, id: number) => {
  update(army, id, unit => ({ ...unit, is_loyal: !unit.is_loyal }))
}

export const setCohortValue = (army: Army, id: number, values_type: ValuesType, key: string, attribute: UnitValueType, value: number) => {
  update(army, id, unit => addValues(unit, values_type, key, [[attribute, value]]))
}

export const changeCohortType = (army: Army, id: number, type: UnitType) => {
  update(army, id, unit => ({ ...unit, type }))
}

export const editCohort = (army: Army, unit: BaseCohort) => {
  let index = findFromReserve(army.reserve, unit.id)
  if (index > -1) {
    army.reserve[index] = unit
    return
  }
  const location = findFromFrontline(army.frontline, unit.id)
  if (location) {
    const [row, column] = location
    army.frontline[row][column] = unit
    return
  }
  index = findFromDefeated(army.defeated, unit.id)
  if (index > -1) {
    army.defeated[index] = unit
    return
  }
}

export const deleteCohort = (army: Army, id: number) => {
  let index = findFromReserve(army.reserve, id)
  if (index > -1) {
    army.reserve.splice(index, 1)
    return
  }
  const location = findFromFrontline(army.frontline, id)
  if (location) {
    const [row, column] = location
    delete army.frontline[row][column]
    if (!keys(army.frontline[row]).length)
      delete army.frontline[row]
    return
  }
  index = findFromDefeated(army.defeated, id)
  if (index > -1) {
    army.defeated.splice(index, 1)
    return
  }
}

export const removeFromReserve = (army: { reserve: BaseReserve }, types: UnitType[]) => {
  for (const type of types) {
    const index = findLastIndex(army.reserve, value => value.type === type)
    army.reserve = army.reserve.filter((_, i) => i !== index)
  }
}

export const addToReserve = (army: { reserve: BaseReserve }, cohorts: BaseCohort[]) => {
  army.reserve = army.reserve.concat(cohorts)
}

export const clearCohorts = (army: Army) => {
  army.frontline = {}
  army.reserve = []
  army.defeated = []
}

export const selectTactic = (army: Army, tactic: TacticType) => {
  army.tactic = tactic
}

export const setUnitPreference = (army: Army, preference_type: UnitPreferenceType, unit: UnitType | null) => {
  army.unit_preferences[preference_type] = unit
}

export const setFlankSize = (army: Army, flank_size: number) => {
  army.flank_size = flank_size
}

export const setGeneralMartial = (army: Army, value: number) => {
  enableGeneralModifiers(army, BASE_MARTIAL_KEY, [{
    target: 'General',
    type: ValuesType.Base,
    scope: ScopeType.Army,
    attribute: GeneralCalc.Martial,
    value
  }])
}

export const enableGeneralModifiers = (army: Army, key: string, modifiers: Modifier[]) => {

  modifiers = modifiers.filter(value => value.scope === ScopeType.Army)
  const definitions = map(army.general.definitions, definition => clearAllValues(definition, key))
  const otherModifiers = modifiers.filter(value => value.attribute !== GeneralCalc.Martial)

  otherModifiers.forEach(modifier => {
    const type = modifier.target as UnitType | DefinitionType
    if (!definitions[type])
      definitions[type] = {}
    if (modifier.type === ValuesType.Modifier)
      definitions[type] = addValues(definitions[type], ValuesType.Modifier, key, [[modifier.attribute, modifier.value]])
    else
      definitions[type] = addValues(definitions[type], ValuesType.Base, key, [[modifier.attribute, modifier.value]])
  })

  let definition = clearAllValues(army.general, key)
  const generalModifiers = modifiers.filter(value => value.attribute === GeneralCalc.Martial)
  const generalValues = generalModifiers.map(value => [value.attribute, value.value] as [UnitValueType, number])
  definition = regenerateValues(definition, ValuesType.Base, key, generalValues)
  const martial = calculateValue(definition, GeneralCalc.Martial)
  if (!definitions[DefinitionType.Naval])
    definitions[DefinitionType.Naval] = {}
  definitions[DefinitionType.Naval] = addValues(definitions[DefinitionType.Naval], ValuesType.Base, GeneralCalc.Martial, [[UnitCalc.CaptureChance, 0.002 * martial]])
  definition.definitions = definitions
  army.general = definition
}

export const clearGeneralModifiers = (army: Army, key: string) => {
  const definition = clearAllValues(army.general, key)
  const definitions = map(army.general.definitions, definition => clearAllValues(definition, key))
  definition.definitions = definitions
  army.general = definition
}

export const setHasGeneral = (army: Army, has_general: boolean) => {
  army.general.enabled = has_general
}