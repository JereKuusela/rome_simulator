import { ValuesType, UnitValueType, UnitType, DefinitionType, UnitRole, Modifier, ScopeType, Unit, Units, Mode } from "types"
import { addValuesWithMutate, regenerateValues, clearValues } from "definition_values"
import { getUnitIcon } from "data"
import { forEach } from "utils"
import { getBaseUnitType } from "./army"

export const setUnitValue = (unit: Unit, values_type: ValuesType, key: string, attribute: UnitValueType, value: number) => {
  addValuesWithMutate(unit, values_type, key, [[attribute, value]])
}

export const deleteUnit = (units: Units, type: UnitType) => {
  delete units[type]
}

export const createUnit = (units: Units, mode: Mode, type: UnitType) => {
  units[type] = { type, mode, image: getUnitIcon(type), role: UnitRole.Front, base: getBaseUnitType(mode, type) }
}

export const changeUnitType = (units: Units, old_type: UnitType, type: UnitType) => {
  delete Object.assign(units, { [type]: units[old_type] })[old_type]
}

export const changeUnitImage = (unit: Unit, image: string) => {
  unit.image = image
}

export const changeUnitDeployment = (unit: Unit, deployment: UnitRole) => {
  unit.role = deployment
}

export const toggleUnitLoyality = (unit: Unit) => {
  unit.is_loyal = !unit.is_loyal
}

export const changeUnitMode = (unit: Unit, mode: DefinitionType) => {
  unit.mode = mode
}

const filterTarget = (type: UnitType, target: string) => (
  type === target
  || (target === DefinitionType.Land && type === UnitType.BaseLand)
  || (target === DefinitionType.Naval && type === UnitType.BaseNaval)
  || (target === DefinitionType.Global && (type === UnitType.BaseLand || type === UnitType.BaseNaval))
)

export const enableUnitModifiers = (units: Units, key: string, modifiers: Modifier[]) => {
  modifiers = modifiers.filter(value => value.scope === ScopeType.Country)
  forEach(units, (unit, type) => {
    const values = modifiers.filter(value => filterTarget(type, value.target))
    const base_values = values.filter(value => value.type !== ValuesType.Modifier).map(value => [value.attribute, value.value] as [UnitValueType, number])
    const modifier_values = values.filter(value => value.type === ValuesType.Modifier).map(value => [value.attribute, value.value] as [UnitValueType, number])
    units[type] = regenerateValues(regenerateValues(unit, ValuesType.Base, key, base_values), ValuesType.Modifier, key, modifier_values)
  })
}

export const clearUnitModifiers = (units: Units, key: string) => {
  forEach(units, (unit, type) => {
    units[type] = clearValues(clearValues(unit, ValuesType.Base, key), ValuesType.Modifier, key)
  })
}
