import { calculateValue, calculateBase, addValues, addValuesWithMutate, filterValues, addValue, clearAllValuesWithMutate } from 'definition_values'
import { Mode, GeneralAttribute, UnitType, UnitAttribute, GeneralDefinition, Army, ArmyType, CohortDefinition, ValuesType, UnitValueType, TacticType, UnitPreferenceType, General, ReserveDefinition, DefeatedDefinition, FrontlineDefinition, GeneralValueType, CombatPhase, isAttributeEnabled, Units, Setting, UnitRole, Unit, CombatUnitTypes, CombatCohortDefinition, SiteSettings, ModifierWithKey, ModifierType, Selections, SelectionType } from 'types'
import { map, forEach, keys, toObj, toArr, toSet, ObjSet, values } from 'utils'
import { findLastIndex, sortBy } from 'lodash'

/**
 * Returns how much capture chance given martial skill gives.
 * @param martial 
 */
export const martialToCaptureChance = (martial: number) => 0.002 * martial

const BASE_STAT_KEY = 'Custom'

export const convertGeneralDefinition = (settings: SiteSettings, general: GeneralDefinition): General => {
  const base = filterValues(general, BASE_STAT_KEY)
  const attributes = [GeneralAttribute.Maneuver, GeneralAttribute.Martial, CombatPhase.Fire, CombatPhase.Shock, CombatPhase.Default]
  const base_values = toObj(attributes, attribute => attribute, attribute => isAttributeEnabled(attribute, settings) ? calculateValue(base, attribute) : 0)
  const extra_values = toObj(attributes, attribute => attribute, attribute => isAttributeEnabled(attribute, settings) && general.enabled ? calculateValue(general, attribute) - calculateValue(base, attribute) : 0)
  const total_values = toObj(attributes, attribute => attribute, attribute => isAttributeEnabled(attribute, settings) && general.enabled ? Math.min(calculateValue(general, attribute), settings[Setting.MaxGeneral]) : 0)
  return {
    enabled: general.enabled,
    base_values,
    total_values,
    extra_values,
    selections: general.selections
  }
}

export const overrideRoleWithPreferences = (army: Army, units: Units, latest: { [key in UnitRole]: UnitType | undefined }) => {
  const preferences = army.unit_preferences
  return mapCohorts(army, cohort => {
    const role = units[cohort.type]?.role
    let override = role && preferences[role]
    if (role && override === UnitType.Latest)
      override = latest[role]
    if (override)
      return { ...cohort, type: override }
    return cohort
  })
}

export const getUnitList = (units: CombatUnitTypes, mode: Mode, _tech: number, filter_parents: boolean, settings: SiteSettings) => {
  const parents = getParents(units)
  let list = settings[Setting.Tech] ? [units[UnitType.Land]].concat(getArchetypes(units, mode)) : sortBy(toArr(units), unit => unitSorter(unit, mode, parents))
  list = filter_parents ? list.filter(unit => !parents[unit.type]) : list
  return list
}

export const getUnitList2 = (units: Units, mode: Mode, _tech: number, filter_parents: boolean, settings: SiteSettings) => {
  const parents = getParents(units)
  let list = settings[Setting.Tech] ? [units[UnitType.Land]].concat(getArchetypes2(units, mode)) : sortBy(toArr(units), unit => unitSorter2(unit, mode, parents))
  list = filter_parents ? list.filter(unit => !parents[unit.type]) : list
  return list
}

export const getAllUnitList = (units: Units, mode: Mode) => {
  const parents = getParents(units)
  return sortBy(toArr(units), unit => unitSorter2(unit, mode, parents))
}



/** Returns latest available unit for each role. */
export const getLatestUnits = (units: CombatUnitTypes, tech: number) => {
  const sorted = sortBy(filterByTech(toArr(units), tech), techSorter)
  return toObj(values(UnitRole), role => role, role => sorted.find(unit => unit.role === role)?.type)
}

/** Returns latest available unit for each role. */
export const getLatestUnits2 = (units: Units, tech: number) => {
  const sorted = sortBy(filterByTech2(toArr(units), tech), techSorter)
  return toObj(values(UnitRole), role => role, role => sorted.find(unit => unit.role === role)?.type)
}


/** Returns available child units of a parent unit.  */
export const getChildUnits = (units: CombatUnitTypes, tech: number, parent: UnitType) => {
  return sortBy(filterByTech(toArr(units).filter(unit => unit.parent === parent), tech), techSorter)
}

export const getChildUnits2 = (units: Units, tech: number, parent: UnitType) => {
  return sortBy(filterByTech2(toArr(units).filter(unit => unit.parent === parent), tech), techSorter)
}


const techSorter = (unit: { tech?: number, type: UnitType }) => {
  return (99 - (unit.tech ?? 0)) + unit.type
}

const unitSorter = (unit: CombatCohortDefinition, mode: Mode, parents?: ObjSet) => {
  if (parents && parents[unit.type])
    return ''
  if (mode === Mode.Naval)
    return unit[UnitAttribute.Cost]
  return techSorter(unit)
}

const unitSorter2 = (unit: Unit, mode: Mode, parents?: ObjSet) => {
  if (parents && parents[unit.type])
    return ''
  if (mode === Mode.Naval)
    return calculateBase(unit, UnitAttribute.Cost)
  return techSorter(unit)
}

export const getArchetypes = (units: CombatUnitTypes, mode: Mode) => toArr(units).filter(unit => mode === Mode.Naval ? unit.parent === UnitType.Naval : unit.parent === UnitType.Land)
export const getArchetypes2 = (units: Units, mode: Mode) => toArr(units).filter(unit => mode === Mode.Naval ? unit.parent === UnitType.Naval : unit.parent === UnitType.Land)


export const getActualUnits = (units: CombatUnitTypes, mode: Mode) => {
  const parents = getParents(units)
  return sortBy(toArr(units).filter(unit => !parents[unit.type]), unit => unitSorter(unit, mode))
}

export const getActualUnits2 = (units: Units, mode: Mode) => {
  const parents = getParents(units)
  return sortBy(toArr(units).filter(unit => !parents[unit.type]), unit => unitSorter2(unit, mode))
}

const getParents = (units: Units) => toSet(units, unit => unit.parent || unit.type)

const filterByTech = (units: CombatCohortDefinition[], tech: number) => units.filter(unit => unit.tech === undefined || unit.tech <= tech)
const filterByTech2 = (units: Unit[], tech: number) => units.filter(unit => unit.tech === undefined || unit.tech <= tech)

export const mapCohorts = (army: Army, mapper: (cohort: CohortDefinition) => CohortDefinition) => {
  return {
    frontline: map(army.frontline, row => map(row, mapper)),
    reserve: army.reserve.map(mapper),
    defeated: army.defeated.map(mapper)
  }
}

const findFromFrontline = (frontline: FrontlineDefinition, criteria: number | ((cohort: CohortDefinition) => boolean)): [number, number][] => {
  let ret: [number, number][] = []
  forEach(frontline, (row, row_index) => forEach(row, (unit, column_index) => {
    if (typeof criteria === 'number' ? unit.id === criteria : criteria(unit))
      ret.push([Number(row_index), Number(column_index)])
  }))
  return ret
}

const findFromReserve = (reserve: ReserveDefinition, criteria: number | ((cohort: CohortDefinition) => boolean)) => {
  return reserve.map((cohort, index) => [typeof criteria === 'number' ? cohort.id === criteria : criteria(cohort), index]).filter(pair => pair[0]).map(pair => pair[1] as number)
}
const findFromDefeated = (defeated: DefeatedDefinition, criteria: number | ((cohort: CohortDefinition) => boolean)) => {
  return defeated.map((cohort, index) => [typeof criteria === 'number' ? cohort.id === criteria : criteria(cohort), index]).filter(pair => pair[0]).map(pair => pair[1] as number)
}


const update = (army: Army, criteria: number | ((cohort: CohortDefinition) => boolean), updater: (unit: CohortDefinition) => CohortDefinition): void => {
  for (let location of findFromFrontline(army.frontline, criteria)) {
    const [row, column] = location
    army.frontline[row][column] = updater(army.frontline[row][column])
  }
  for (let index of findFromReserve(army.reserve, criteria))
    army.reserve[index] = updater(army.reserve[index])
  for (let index of findFromDefeated(army.defeated, criteria))
    army.defeated[index] = updater(army.defeated[index])
}

export const selectCohort = (army: Army, type: ArmyType, row: number, column: number, cohort: CohortDefinition) => {
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

export const editCohort = (army: Army, unit: CohortDefinition) => {
  update(army, unit.id, () => unit)
}

export const deleteCohort = (army: Army, id: number) => {
  for (let location of findFromFrontline(army.frontline, id)) {
    const [row, column] = location
    delete army.frontline[row][column]
    if (!keys(army.frontline[row]).length)
      delete army.frontline[row]
  }
  for (let index of findFromReserve(army.reserve, id))
    army.reserve.splice(index, 1)
  for (let index of findFromDefeated(army.defeated, id))
    army.defeated.splice(index, 1)
}

export const removeFromReserve = (army: { reserve: ReserveDefinition }, types: UnitType[]) => {
  for (const type of types) {
    const index = findLastIndex(army.reserve, value => value.type === type)
    army.reserve = army.reserve.filter((_, i) => i !== index)
  }
}

export const addToReserve = (army: { reserve: ReserveDefinition }, cohorts: CohortDefinition[]) => {
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

export const setUnitPreference = (army: Army, preference_type: UnitPreferenceType | UnitRole, unit: UnitType | null) => {
  army.unit_preferences[preference_type] = unit
}

export const setFlankSize = (army: Army, flank_size: number) => {
  army.flank_size = flank_size
}

export const setGeneralAttribute = (army: Army, attribute: GeneralValueType, value: number) => {
  addValuesWithMutate(army.general, ValuesType.Base, 'Custom', [[attribute, value]])
}

export const clearGeneralAttributes = (army: Army) => {
  clearAllValuesWithMutate(army.general, 'Custom')
}

export const setHasGeneral = (army: Army, has_general: boolean) => {
  army.general.enabled = has_general
}

export const enableGeneralSelection = (army: Army, type: SelectionType, key: string) => {
  if (!army.general.selections[type])
    army.general.selections[type] = {}
  army.general.selections[type][key] = true
}

export const enableGeneralSelections = (army: Army, type: SelectionType, keys: string[]) => {
  keys.forEach(key => enableGeneralSelection(army, type, key))
}

export const clearGeneralSelection = (army: Army, type: SelectionType, key: string) => {
  delete army.general.selections[type][key]
}

export const clearGeneralSelections = (army: Army, type?: SelectionType, keys?: string[]) => {
  if (keys && type)
    keys.forEach(key => clearGeneralSelection(army, type, key))
  else if (type)
    delete army.general.selections[type]
  else
    army.general.selections = {} as Selections
}

export const applyGeneralModifiers = (country: GeneralDefinition, modifiers: ModifierWithKey[]): GeneralDefinition => {
  modifiers.filter(value => value.target === ModifierType.General).forEach(value => {
    country = addValue(country, value.type, value.key, value.attribute, value.value)
  })
  return country
}
