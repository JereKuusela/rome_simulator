import {
  calculateValue,
  calculateBase,
  addValuesWithMutate,
  filterValues,
  addValue,
  clearAllValuesWithMutate
} from 'definition_values'
import {
  Mode,
  CharacterAttribute,
  UnitType,
  UnitAttribute,
  GeneralData,
  ArmyData,
  CohortData,
  ValuesType,
  UnitValueType,
  TacticType,
  UnitPreferenceType,
  GeneralDefinition,
  ReserveData,
  GeneralValueType,
  CombatPhase,
  isAttributeEnabled,
  UnitDefinitions,
  Setting,
  UnitRole,
  UnitDefinition,
  SiteSettings,
  ModifierWithKey,
  ModifierType,
  Selections,
  SelectionType,
  TacticDefinitions
} from 'types'
import { toObj, toArr, toSet, ObjSet, values } from 'utils'
import { findLastIndex, sortBy } from 'lodash'
import { getRootParent } from './units'

const BASE_STAT_KEY = 'Custom'

export const convertGeneralDefinition = (
  settings: SiteSettings,
  general: GeneralData,
  tactics: TacticDefinitions
): GeneralDefinition => {
  const base = filterValues(general, BASE_STAT_KEY)
  const attributes = [
    CharacterAttribute.Maneuver,
    CharacterAttribute.Martial,
    CombatPhase.Fire,
    CombatPhase.Shock,
    CombatPhase.Default
  ]
  const baseValues = toObj(
    attributes,
    attribute => attribute,
    attribute => (isAttributeEnabled(attribute, settings) ? calculateValue(base, attribute) : 0)
  )
  const extraValues = toObj(
    attributes,
    attribute => attribute,
    attribute =>
      isAttributeEnabled(attribute, settings) && general.enabled
        ? calculateValue(general, attribute) - calculateValue(base, attribute)
        : 0
  )
  const totalValues = toObj(
    attributes,
    attribute => attribute,
    attribute =>
      isAttributeEnabled(attribute, settings) && general.enabled
        ? Math.min(calculateValue(general, attribute), settings[Setting.MaxGeneral])
        : 0
  )
  return {
    tactic: tactics[general.tactic],
    enabled: general.enabled,
    baseValues,
    values: totalValues,
    extraValues,
    selections: general.selections
  }
}

export const overrideRoleWithPreferences = (
  army: ArmyData,
  units: UnitDefinitions,
  latest: { [key in UnitRole]: UnitType | undefined }
) => {
  const preferences = army.unitPreferences
  return army.reserve.map(cohort => {
    const role = units[cohort.type]?.role
    let override = role && preferences[role]
    if (role && override === UnitType.Latest) override = latest[role]
    if (override) return { ...cohort, type: override }
    return cohort
  })
}

export const getUnitList = (units: UnitDefinitions, mode: Mode, filterParents: boolean, settings: SiteSettings) => {
  const parents = getParents(units)
  let list = settings[Setting.Tech]
    ? [units[UnitType.Land]].concat(getArchetypes(units, mode))
    : sortBy(toArr(units), unit => unitSorter(unit, mode, parents))
  list = filterParents ? list.filter(unit => !parents[unit.type]) : list
  return list
}

export const getAllUnitList = (units: UnitDefinitions, mode: Mode) => {
  const parents = getParents(units)
  return sortBy(toArr(units), unit => unitSorter(unit, mode, parents))
}

/** Returns latest available unit for each role. */
export const getLatestUnits = (units: UnitDefinitions, tech: number) => {
  const sorted = sortBy(filterByTech(toArr(units), tech), techSorter)
  return toObj(
    values(UnitRole),
    role => role,
    role => sorted.find(unit => unit.role === role)?.type
  )
}

export const getChildUnits = (units: UnitDefinitions, tech: number, parent: UnitType) => {
  return sortBy(
    filterByTech(
      toArr(units).filter(unit => unit.parent === parent),
      tech
    ),
    techSorter
  )
}

const techSorter = (unit: { tech?: number; type: UnitType }) => {
  return 99 - (unit.tech ?? 0) + unit.type
}

const unitSorter = (unit: UnitDefinition, mode: Mode, parents?: ObjSet) => {
  if (parents && parents[unit.type]) return ''
  if (mode === Mode.Naval) return calculateBase(unit, UnitAttribute.Cost)
  return techSorter(unit)
}

export const getArchetypes = (units: UnitDefinitions, mode: Mode) =>
  toArr(units).filter(unit => unit.parent === getRootParent(mode))

export const getActualUnits = (units: UnitDefinitions, mode: Mode) => {
  const parents = getParents(units)
  return sortBy(
    toArr(units).filter(unit => !parents[unit.type]),
    unit => unitSorter(unit, mode)
  )
}

const getParents = (units: UnitDefinitions) => toSet(units, unit => unit.parent || unit.type)

export const getRootUnit = (units: UnitDefinitions, mode: Mode) =>
  mode === Mode.Naval ? units[UnitType.Naval] : units[UnitType.Land]

const filterByTech = (units: UnitDefinition[], tech: number) =>
  units.filter(unit => unit.tech === undefined || unit.tech <= tech)

export const selectCohort = (army: ArmyData, index: number, cohort: CohortData) => {
  if (cohort && index > army.reserve.length) army.reserve.push(cohort)
  else if (cohort) army.reserve[index] = cohort
}

export const toggleCohortLoyality = (army: ArmyData, index: number) => {
  army.reserve[index].isLoyal = !army.reserve[index].isLoyal
}

export const setCohortValue = (
  army: ArmyData,
  index: number,
  valuesType: ValuesType,
  key: string,
  attribute: UnitValueType,
  value: number
) => {
  addValuesWithMutate(army.reserve[index], valuesType, key, [[attribute, value]])
}

export const changeCohortType = (army: ArmyData, index: number, type: UnitType) => {
  army.reserve[index].type = type
}

export const deleteCohort = (army: ArmyData, index: number) => {
  army.reserve.splice(index, 1)
}

export const removeFromReserve = (army: { reserve: ReserveData }, types: UnitType[]) => {
  for (const type of types) {
    const index = findLastIndex(army.reserve, value => value.type === type)
    army.reserve = army.reserve.filter((_, i) => i !== index)
  }
}

export const addToReserve = (army: { reserve: ReserveData }, cohorts: CohortData[]) => {
  army.reserve = army.reserve.concat(cohorts)
}

export const clearCohorts = (army: ArmyData) => {
  army.reserve = []
}

export const selectTactic = (army: ArmyData, tactic: TacticType) => {
  army.general.tactic = tactic
}

export const setUnitPreference = (
  army: ArmyData,
  preferenceType: UnitPreferenceType | UnitRole,
  unit: UnitType | null
) => {
  army.unitPreferences[preferenceType] = unit
}

export const setFlankSize = (army: ArmyData, flankFize: number) => {
  army.flankSize = flankFize
}

export const setGeneralAttribute = (army: ArmyData, attribute: GeneralValueType, value: number) => {
  addValuesWithMutate(army.general, ValuesType.Base, 'Custom', [[attribute, value]])
}

export const clearGeneralAttributes = (army: ArmyData) => {
  clearAllValuesWithMutate(army.general, 'Custom')
}

export const setHasGeneral = (army: ArmyData, hasGeneral: boolean) => {
  army.general.enabled = hasGeneral
}

export const enableGeneralSelection = (army: ArmyData, type: SelectionType, key: string) => {
  if (!army.general.selections[type]) army.general.selections[type] = {}
  army.general.selections[type][key] = true
}

export const enableGeneralSelections = (army: ArmyData, type: SelectionType, keys: string[]) => {
  keys.forEach(key => enableGeneralSelection(army, type, key))
}

export const clearGeneralSelection = (army: ArmyData, type: SelectionType, key: string) => {
  if (army.general.selections[type]) delete army.general.selections[type][key]
}

export const clearGeneralSelections = (army: ArmyData, type?: SelectionType, keys?: string[]) => {
  if (keys && type) keys.forEach(key => clearGeneralSelection(army, type, key))
  else if (type) delete army.general.selections[type]
  else army.general.selections = {} as Selections
}

export const applyGeneralModifiers = (general: GeneralData, modifiers: ModifierWithKey[]): GeneralData => {
  modifiers
    .filter(value => value.target === ModifierType.General)
    .forEach(value => {
      general = addValue(general, value.type, value.key, value.attribute, value.value)
    })
  return general
}
