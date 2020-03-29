import { calculateValue, clearAllValues, calculateBase, addValues, regenerateValues, addValuesWithMutate, filterValues } from 'definition_values'
import { Mode, GeneralAttribute, UnitType, UnitAttribute, GeneralDefinition, Army, ArmyType, BaseCohort, ValuesType, UnitValueType, TacticType, UnitPreferenceType, General, BaseReserve, ScopeType, Modifier, BaseDefeated, BaseFrontLine, GeneralValueType, CombatPhase, Settings, isAttributeEnabled, Units, Setting, UnitRole, Unit, CombatUnitTypes, CombatCohortDefinition } from 'types'
import { map, forEach, keys, toObj, toArr, toSet, ObjSet, values } from 'utils'
import { findLastIndex, sortBy } from 'lodash'

/**
 * Returns how much capture chance given martial skill gives.
 * @param martial 
 */
export const martialToCaptureChance = (martial: number) => 0.002 * martial

const BASE_STAT_KEY = 'Base stat'

export const convertGeneralDefinition = (settings: Settings, general: GeneralDefinition): General => {
  const base = filterValues(general, BASE_STAT_KEY)
  const attributes = [GeneralAttribute.Maneuver, GeneralAttribute.Martial, CombatPhase.Fire, CombatPhase.Shock, CombatPhase.Default]
  const base_values = toObj(attributes, attribute => attribute, attribute => isAttributeEnabled(attribute, settings) ? calculateValue(base, attribute) : 0)
  const extra_values = toObj(attributes, attribute => attribute, attribute => isAttributeEnabled(attribute, settings) ? calculateValue(general, attribute) - calculateValue(base, attribute) : 0)
  const total_values = toObj(attributes, attribute => attribute, attribute => isAttributeEnabled(attribute, settings) ? Math.min(calculateValue(general, attribute), settings[Setting.MaxGeneral]) : 0)
  return {
    enabled: general.enabled,
    base_values,
    total_values,
    extra_values
  }
}

export const overrideRoleWithPreferences = (army: Army, units: Units, latest: { [key in UnitRole]: UnitType | undefined }) => {
  const preferences = army.unit_preferences
  return mapCohorts(army, cohort => {
    const role = units[cohort.type].role
    let override = role && preferences[role]
    if (role && override === UnitType.Latest)
      override = latest[role]
    if (override)
      return { ...cohort, type: override }
    return cohort
  })
}

export const getUnitList = (units: CombatUnitTypes, mode: Mode, _tech: number, filter_base: boolean, settings: Settings) => {
  const base_units = getBaseUnits(units)
  let list = settings[Setting.Tech] ? [units[UnitType.Land]].concat(getArchetypes(units, mode)) : sortBy(toArr(units), unit => unitSorter(unit, mode, base_units))
  list = filter_base ? list.filter(unit => !base_units[unit.type]) : list
  return list
}

export const getUnitList2 = (units: Units, mode: Mode, _tech: number, filter_base: boolean, settings: Settings) => {
  const base_units = getBaseUnits(units)
  let list = settings[Setting.Tech] ? [units[UnitType.Land]].concat(getArchetypes2(units, mode)) : sortBy(toArr(units), unit => unitSorter2(unit, mode, base_units))
  list = filter_base ? list.filter(unit => !base_units[unit.type]) : list
  return list
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


/** Returns available child units of a base unit.  */
export const getChildUnits = (units: CombatUnitTypes, tech: number, base_unit: UnitType) => {
  return sortBy(filterByTech(toArr(units).filter(unit => unit.base === base_unit), tech), techSorter)
}

const techSorter = (unit: { tech?: number, type: UnitType }) => {
  return (99 - (unit.tech ?? 0)) + unit.type
}

const unitSorter = (unit: CombatCohortDefinition, mode: Mode, base_units?: ObjSet) => {
  if (base_units && base_units[unit.type])
    return ''
  if (mode === Mode.Naval)
    return unit[UnitAttribute.Cost]
  return techSorter(unit)
}

const unitSorter2 = (unit: Unit, mode: Mode, base_units?: ObjSet) => {
  if (base_units && base_units[unit.type])
    return ''
  if (mode === Mode.Naval)
    return calculateBase(unit, UnitAttribute.Cost)
  return techSorter(unit)
}

export const getArchetypes = (units: CombatUnitTypes, mode: Mode) => toArr(units).filter(unit => mode === Mode.Naval ? unit.base === UnitType.Naval : unit.base === UnitType.Land)
export const getArchetypes2 = (units: Units, mode: Mode) => toArr(units).filter(unit => mode === Mode.Naval ? unit.base === UnitType.Naval : unit.base === UnitType.Land)


export const getActualUnits = (units: CombatUnitTypes, mode: Mode) => {
  const base_units = getBaseUnits(units)
  return sortBy(toArr(units).filter(unit => !base_units[unit.type]), unit => unitSorter(unit, mode))
}

const getBaseUnits = (units: Units) => toSet(units, unit => unit.base || unit.type)

const filterByTech = (units: CombatCohortDefinition[], tech: number) => units.filter(unit => unit.tech === undefined || unit.tech <= tech)
const filterByTech2 = (units: Unit[], tech: number) => units.filter(unit => unit.tech === undefined || unit.tech <= tech)

export const mapCohorts = (army: Army, mapper: (cohort: BaseCohort) => BaseCohort) => {
  return {
    frontline: map(army.frontline, row => map(row, mapper)),
    reserve: army.reserve.map(mapper),
    defeated: army.defeated.map(mapper)
  }
}

const findFromFrontline = (frontline: BaseFrontLine, criteria: number | ((cohort: BaseCohort) => boolean)): [number, number][] => {
  let ret: [number, number][] = []
  forEach(frontline, (row, row_index) => forEach(row, (unit, column_index) => {
    if (typeof criteria === 'number' ? unit.id === criteria : criteria(unit))
      ret.push([Number(row_index), Number(column_index)])
  }))
  return ret
}

const findFromReserve = (reserve: BaseReserve, criteria: number | ((cohort: BaseCohort) => boolean)) => {
  return reserve.map((cohort, index) => [typeof criteria === 'number' ? cohort.id === criteria : criteria(cohort), index]).filter(pair => pair[0]).map(pair => pair[1] as number)
}
const findFromDefeated = (defeated: BaseDefeated, criteria: number | ((cohort: BaseCohort) => boolean)) => {
  return defeated.map((cohort, index) => [typeof criteria === 'number' ? cohort.id === criteria : criteria(cohort), index]).filter(pair => pair[0]).map(pair => pair[1] as number)
}


const update = (army: Army, criteria: number | ((cohort: BaseCohort) => boolean), updater: (unit: BaseCohort) => BaseCohort): void => {
  for (let location of findFromFrontline(army.frontline, criteria)) {
    const [row, column] = location
    army.frontline[row][column] = updater(army.frontline[row][column])
  }
  for (let index of findFromReserve(army.reserve, criteria))
    army.reserve[index] = updater(army.reserve[index])
  for (let index of findFromDefeated(army.defeated, criteria))
    army.defeated[index] = updater(army.defeated[index])
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

export const setUnitPreference = (army: Army, preference_type: UnitPreferenceType | UnitRole, unit: UnitType | null) => {
  army.unit_preferences[preference_type] = unit
}

export const setFlankSize = (army: Army, flank_size: number) => {
  army.flank_size = flank_size
}

export const setGeneralBaseStat = (army: Army, attribute: GeneralValueType, value: number) => {
  setGeneralValue(army, BASE_STAT_KEY, attribute, value)
}

export const setGeneralValue = (army: Army, key: string, attribute: GeneralValueType, value: number) => {
  addValuesWithMutate(army.general, ValuesType.Base, key, [[attribute, value]])
}

export const setGeneralBaseValue = (army: Army, key: string, attribute: GeneralValueType, value: number) => {
  addValuesWithMutate(army.general, ValuesType.Base, key, [[attribute, value]])
}

export const enableGeneralModifiers = (army: Army, key: string, modifiers: Modifier[]) => {

  modifiers = modifiers.filter(value => value.scope === ScopeType.Army)
  const definitions = map(army.general.definitions, definition => clearAllValues(definition, key))
  const otherModifiers = modifiers.filter(value => value.attribute !== GeneralAttribute.Martial)

  otherModifiers.forEach(modifier => {
    const type = modifier.target as UnitType
    if (!definitions[type])
      definitions[type] = {}
    if (modifier.type === ValuesType.Modifier)
      definitions[type] = addValues(definitions[type], ValuesType.Modifier, key, [[modifier.attribute, modifier.value]])
    else
      definitions[type] = addValues(definitions[type], ValuesType.Base, key, [[modifier.attribute, modifier.value]])
  })

  let definition = clearAllValues(army.general, key)
  const generalModifiers = modifiers.filter(value => value.attribute === GeneralAttribute.Martial)
  const generalValues = generalModifiers.map(value => [value.attribute, value.value] as [UnitValueType, number])
  regenerateValues(definition, ValuesType.Base, key, generalValues)
  const martial = calculateValue(definition, GeneralAttribute.Martial)
  if (!definitions[UnitType.Naval])
    definitions[UnitType.Naval] = {}
  definitions[UnitType.Naval] = addValues(definitions[UnitType.Naval], ValuesType.Base, GeneralAttribute.Martial, [[UnitAttribute.CaptureChance, 0.002 * martial]])
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
