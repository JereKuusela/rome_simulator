import { ValuesType, UnitValueType, UnitType, UnitRole, Modifier, UnitDefinition, UnitDefinitions, Mode, Setting, UnitAttribute, WearinessAttributes, ReserveDefinition, ModifierWithKey, SiteSettings } from "types"
import { addValuesWithMutate, regenerateValues, clearValues, DefinitionValues, calculateValue, addValues, addValue } from "definition_values"
import { getUnitIcon } from "data"
import { forEach, toArr, round, randomWithinRange } from "utils"
import { mapModifiersToUnits2 } from "./modifiers"

export const setUnitValue = (unit: UnitDefinition, values_type: ValuesType, key: string, attribute: UnitValueType, value: number) => {
  addValuesWithMutate(unit, values_type, key, [[attribute, value]])
}

export const deleteUnit = (units: UnitDefinitions, type: UnitType) => {
  delete units[type]
}

export const createUnit = (units: UnitDefinitions, mode: Mode, type: UnitType) => {
  units[type] = { type, image: getUnitIcon(type), role: UnitRole.Front, parent: getRootParent(mode) }
}

export const changeUnitType = (units: UnitDefinitions, old_type: UnitType, type: UnitType) => {
  delete Object.assign(units, { [type]: { ...units[old_type], type } })[old_type]
}

export const changeUnitImage = (unit: UnitDefinition, image: string) => {
  unit.image = image
}

export const changeUnitDeployment = (unit: UnitDefinition, deployment: UnitRole) => {
  unit.role = deployment
}

export const toggleUnitLoyality = (unit: UnitDefinition) => {
  unit.is_loyal = !unit.is_loyal
}

export const changeParent = (unit: UnitDefinition, parent: UnitType) => {
  unit.parent = parent
}

export const enableUnitModifiers = (units: UnitDefinitions, key: string, modifiers: Modifier[]) => {
  forEach(units, (unit, type) => {
    const values = modifiers.filter(value => type === value.target)
    const base_values = values.filter(value => value.type !== ValuesType.Modifier).map(value => [value.attribute, value.value] as [UnitValueType, number])
    const modifier_values = values.filter(value => value.type === ValuesType.Modifier).map(value => [value.attribute, value.value] as [UnitValueType, number])
    regenerateValues(unit, ValuesType.Modifier, key, modifier_values)
    regenerateValues(unit, ValuesType.Base, key, base_values)
  })
}

export const clearUnitModifiers = (units: UnitDefinitions, key: string) => {
  forEach(units, (unit, type) => {
    units[type] = clearValues(clearValues(unit, ValuesType.Base, key), ValuesType.Modifier, key)
  })
}

export const getRootParent = (mode: Mode) => mode === Mode.Naval ? UnitType.Naval : UnitType.Land

export const applyDynamicAttributes = <T extends DefinitionValues<UnitValueType>>(definition: T, settings: SiteSettings) => {
  if (settings[Setting.AttributeDrill]) {
    const drill = 0.1 * calculateValue(definition, UnitAttribute.Drill)
    definition = addValues(definition, ValuesType.Base, 'From drill', [[UnitAttribute.ShockDamageDone, drill], [UnitAttribute.FireDamageDone, drill], [UnitAttribute.ShockDamageTaken, -drill], [UnitAttribute.FireDamageTaken, -drill]])
  }
  if (settings[Setting.StrengthBasedFlank]) {
    const maneuver = getStrengthBasedFlank(calculateValue(definition, UnitAttribute.Strength)) - 1
    definition = addValues(definition, ValuesType.Modifier, 'From losses', [[UnitAttribute.Maneuver, maneuver]])
    if (calculateValue(definition, UnitAttribute.Maneuver) < 1)
      definition = addValues(definition, ValuesType.Loss, 'Minimum cap', [[UnitAttribute.Maneuver, -1]])
  }
  return definition
}

export const getStrengthBasedFlank = (strength: number) => Math.pow(0.5, 4 - Math.ceil(strength * 4.0))

export const applyLosses = (values: WearinessAttributes, units: ReserveDefinition) => (
  units.map(unit => addValues(unit, ValuesType.LossModifier, 'Custom', generateLosses(values)))
)

export const applyUnitModifiers = (units: UnitDefinitions, modifiers: ModifierWithKey[]): UnitDefinitions => {
  modifiers = mapModifiersToUnits2(modifiers)
  let result = { ...units }
  modifiers.forEach(value => {
    const type = value.target as UnitType
    if (!result[type])
      return
    result[type] = addValue(result[type], value.type, value.key, value.attribute, value.value)
  })
  return result
}

const generateLosses = (values: WearinessAttributes): [string, number][] => toArr(values, (range, type) => [type, round(randomWithinRange(range.min, range.max), 100)])
