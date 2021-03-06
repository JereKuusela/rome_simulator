import {
  ValuesType,
  UnitValueType,
  UnitType,
  UnitRole,
  UnitData,
  UnitsData,
  Mode,
  Setting,
  UnitAttribute,
  WearinessAttributes,
  ReserveData,
  ModifierWithKey,
  CombatSharedSettings,
  SideType,
  GeneralData,
  CountryDefinition
} from 'types'
import { addValuesWithMutate, calculateValue, addValues, addValue } from 'data_values'
import { getUnitIcon } from 'data'
import { toArr, round, randomWithinRange } from 'utils'
import { getCountryModifiers, getGeneralModifiers, mapModifiersToUnits2 } from './modifiers'
import { getConfig } from 'data/config'

export const setUnitValue = (
  unit: UnitData,
  valuesType: ValuesType,
  key: string,
  attribute: UnitValueType,
  value: number
) => {
  addValuesWithMutate(unit, valuesType, key, [[attribute, value]])
}

export const deleteUnit = (units: UnitsData, type: UnitType) => {
  delete units[type]
}

export const createUnit = (units: UnitsData, mode: Mode, type: UnitType) => {
  units[type] = { type, image: getUnitIcon(type), role: UnitRole.Front, parent: getRootParent(mode) }
}

export const changeUnitType = (units: UnitsData, oldType: UnitType, type: UnitType) => {
  delete Object.assign(units, { [type]: { ...units[oldType], type } })[oldType]
}

export const changeUnitImage = (unit: UnitData, image: string) => {
  unit.image = image
}

export const changeUnitDeployment = (unit: UnitData, deployment: UnitRole) => {
  unit.role = deployment
}

export const toggleUnitLoyality = (unit: UnitData) => {
  unit.isLoyal = !unit.isLoyal
}

export const changeParent = (unit: UnitData, parent: UnitType) => {
  unit.parent = parent
}

export const getRootParent = (mode: Mode) => (mode === Mode.Naval ? UnitType.Naval : UnitType.Land)

export const applyDynamicAttributes = <T extends UnitData>(definition: T, settings: CombatSharedSettings) => {
  if (settings[Setting.AttributeDrill]) {
    const drill = 0.1 * calculateValue(definition, UnitAttribute.Drill)
    definition = addValues(definition, ValuesType.Base, 'From drill', [
      [UnitAttribute.ShockDamageDone, drill],
      [UnitAttribute.FireDamageDone, drill],
      [UnitAttribute.ShockDamageTaken, -drill],
      [UnitAttribute.FireDamageTaken, -drill]
    ])
  }
  if (settings[Setting.StrengthBasedFlank]) {
    const maneuver = getStrengthBasedFlank(calculateValue(definition, UnitAttribute.Strength)) - 1
    definition = addValues(definition, ValuesType.Modifier, 'From losses', [[UnitAttribute.Maneuver, maneuver]])
    if (calculateValue(definition, UnitAttribute.Maneuver) < 1)
      definition = addValues(definition, ValuesType.Loss, 'Minimum cap', [[UnitAttribute.Maneuver, -1]])
  }
  if (definition.isLoyal)
    definition = addValues(definition, ValuesType.Modifier, 'Loyal', [
      [UnitAttribute.Maintenance, getConfig().LoyalMaintenance - 1]
    ])
  return definition
}

export const getStrengthBasedFlank = (strength: number) => Math.pow(0.5, 4 - Math.ceil(strength * 4.0))

export const applyLosses = (values: WearinessAttributes, units: ReserveData) =>
  units.map(unit => addValues(unit, ValuesType.LossModifier, 'Custom', generateLosses(values)))

export const applyUnitModifiers = (unitsData: UnitsData, modifiers: ModifierWithKey[]): UnitsData => {
  modifiers = mapModifiersToUnits2(modifiers)
  const resultUnitsData = { ...unitsData }
  modifiers.forEach(value => {
    const type = value.target as UnitType
    const unitData = resultUnitsData[type]
    if (!unitData) return
    resultUnitsData[type] = addValue(unitData, value.type, value.key, value.attribute, value.value)
  })
  return resultUnitsData
}

const generateLosses = (values: WearinessAttributes): [string, number][] =>
  toArr(values, (range, type) => [type, round(randomWithinRange(range.min, range.max), 100)])

export const getCohortId = (side: SideType, cohort: { index: number; participantIndex: number }) =>
  side + '-' + cohort.participantIndex + '-' + cohort.index
export const getCohortName = (cohort: { type: UnitType; index: number; participantIndex: number }) =>
  cohort.type + ' ' + (1000 * cohort.participantIndex + cohort.index)

export const convertUnitsData = (units: UnitsData, country: CountryDefinition, general: GeneralData) => {
  const countryModifiers = getCountryModifiers(country.modifiers)
  const generalModifiers = getGeneralModifiers(general)
  return applyUnitModifiers(units, countryModifiers.concat(generalModifiers))
}
