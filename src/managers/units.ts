import { ValuesType, UnitValueType, UnitType, UnitRole, Modifier, ScopeType, BaseUnit, BaseUnits, Mode, Settings, Setting, UnitAttribute } from "types"
import { addValuesWithMutate, regenerateValues, clearValues, DefinitionValues, calculateValue, addValues } from "definition_values"
import { getUnitIcon } from "data"
import { forEach } from "utils"

export const setUnitValue = (unit: BaseUnit, values_type: ValuesType, key: string, attribute: UnitValueType, value: number) => {
  addValuesWithMutate(unit, values_type, key, [[attribute, value]])
}

export const deleteUnit = (units: BaseUnits, type: UnitType) => {
  delete units[type]
}

export const createUnit = (units: BaseUnits, mode: Mode, type: UnitType) => {
  units[type] = { type, image: getUnitIcon(type), role: UnitRole.Front, base: getBaseUnitType(mode) }
}

export const changeUnitType = (units: BaseUnits, old_type: UnitType, type: UnitType) => {
  delete Object.assign(units, { [type]: { ...units[old_type], type } })[old_type]
}

export const changeUnitImage = (unit: BaseUnit, image: string) => {
  unit.image = image
}

export const changeUnitDeployment = (unit: BaseUnit, deployment: UnitRole) => {
  unit.role = deployment
}

export const toggleUnitLoyality = (unit: BaseUnit) => {
  unit.is_loyal = !unit.is_loyal
}

export const changeUnitBaseType = (unit: BaseUnit, base: UnitType) => {
  unit.base = base
}

export const enableUnitModifiers = (units: BaseUnits, key: string, modifiers: Modifier[]) => {
  modifiers = modifiers.filter(value => value.scope === ScopeType.Country)
  forEach(units, (unit, type) => {
    const values = modifiers.filter(value => type === value.target)
    const base_values = values.filter(value => value.type !== ValuesType.Modifier).map(value => [value.attribute, value.value] as [UnitValueType, number])
    const modifier_values = values.filter(value => value.type === ValuesType.Modifier).map(value => [value.attribute, value.value] as [UnitValueType, number])
    units[type] = regenerateValues(regenerateValues(unit, ValuesType.Base, key, base_values), ValuesType.Modifier, key, modifier_values)
  })
}

export const clearUnitModifiers = (units: BaseUnits, key: string) => {
  forEach(units, (unit, type) => {
    units[type] = clearValues(clearValues(unit, ValuesType.Base, key), ValuesType.Modifier, key)
  })
}

export const getBaseUnitType = (mode: Mode) => mode === Mode.Naval ? UnitType.Naval : UnitType.Land

export const applyDynamicAttributes = <T extends DefinitionValues<UnitValueType>>(definition: T, settings: Settings) => {
  if (settings[Setting.AttributeDrill]) {
    const drill = 0.1 * calculateValue(definition, UnitAttribute.Drill)
    definition = addValues(definition, ValuesType.Base, 'From drill', [[UnitAttribute.ShockDamageDone, drill], [UnitAttribute.FireDamageDone, drill], [UnitAttribute.ShockDamageTaken, -drill], [UnitAttribute.FireDamageTaken, -drill]])
  }
  if (settings[Setting.StrengthBasedFlank]) {
    const maneuver = getStrengthBasedFlank(calculateValue(definition, UnitAttribute.Strength)) - 1
    definition = addValues(definition, ValuesType.Modifier, 'From losses', [[UnitAttribute.Maneuver, maneuver]])
  }
  return definition
}

export const getStrengthBasedFlank = (strength: number) => Math.ceil(strength * 4.0) / 4.0
