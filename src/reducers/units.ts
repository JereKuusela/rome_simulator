
import { ImmerReducer, createActionCreators, createReducerFunction, Actions } from 'immer-reducer'

import { DefinitionType, ValuesType, Mode, CountryName, UnitType, UnitValueType, UnitDeployment, Modifier, ScopeType, UnitState, GlobalStats } from 'types'
import { getDefaultUnits, getDefaultGlobals, getUnitIcon, getDefaultUnitDefinitions, getDefaultBaseDefinitions } from 'data'
import { addValues, regenerateValues, clearValues, clearAllValues } from 'definition_values'
import { map } from 'utils'
import { createCountry, deleteCountry, changeCountryName, enableModifiers, clearModifiers } from './countries'


class UnitsReducer extends ImmerReducer<UnitState> {

  setValue(country: CountryName, values_type: ValuesType, type: UnitType, key: string, attribute: UnitValueType, value: number) {
    this.draftState[country][type] = addValues(this.state[country][type], values_type, key, [[attribute, value]])
  }

  deleteUnit(country: CountryName, type: UnitType) {
    delete this.draftState[country][type]
  }

  addUnit(country: CountryName, mode: DefinitionType, type: UnitType) {
    this.draftState[country][type] = { type, mode, image: getUnitIcon(type), deployment: UnitDeployment.Front }
  }

  changeType(country: CountryName, old_type: UnitType, type: UnitType) {
    delete Object.assign(this.draftState[country], { [type]: this.draftState[country][old_type] })[old_type]
  }

  changeImage(country: CountryName, type: UnitType, image: string) {
    this.draftState[country][type].image = image
  }

  changeDeployment(country: CountryName, type: UnitType, deployment: UnitDeployment) {
    this.draftState[country][type].deployment = deployment
  }

  toggleIsLoyal(country: CountryName, type: UnitType) {
    this.draftState[country][type].is_loyal = !this.draftState[country][type].is_loyal
  }

  changeMode(country: CountryName, type: UnitType, mode: DefinitionType) {
    this.draftState[country][type].mode = mode
  }

  createCountry(country: CountryName, source_country?: CountryName) {
    this.draftState[country] = source_country ? this.state[source_country] : getDefaultUnits()
  }

  deleteCountry(country: CountryName) {
    delete this.draftState[country]
  }

  changeCountryName(old_country: CountryName, country: CountryName) {
    delete Object.assign(this.draftState, { [country]: this.draftState[old_country] })[old_country]
  }

  enableModifiers(country: CountryName, key: string, modifiers: Modifier[]) {
    modifiers = modifiers.filter(value => value.scope === ScopeType.Country)
    const next = map(this.state[country], (unit, type) => {
      const values = modifiers.filter(value => value.target === type)
      const base_values = values.filter(value => value.type !== ValuesType.Modifier).map(value => [value.attribute, value.value] as [UnitValueType, number])
      const modifier_values = values.filter(value => value.type === ValuesType.Modifier).map(value => [value.attribute, value.value] as [UnitValueType, number])
      return regenerateValues(regenerateValues(unit, ValuesType.Base, key, base_values), ValuesType.Modifier, key, modifier_values)
    })
    this.draftState[country] = next
  }

  clearModifiers(country: CountryName, key: string) {
    const next = map(this.state[country], unit => clearValues(clearValues(unit, ValuesType.Base, key), ValuesType.Modifier, key))
    this.draftState[country] = next
  }
}

class BaseDefinitionsReducer extends ImmerReducer<GlobalStats> {

  setGlobalValue(country: CountryName, mode: Mode, type: ValuesType, key: string, attribute: UnitValueType, value: number) {
    this.draftState[country][mode] = addValues(this.state[country][mode], type, key, [[attribute, value]])
  }

  createCountry(country: CountryName, source_country?: CountryName) {
    this.draftState[country] = source_country ? this.state[source_country] :  getDefaultGlobals()
  }

  deleteCountry(country: CountryName) {
    delete this.draftState[country]
  }

  changeCountryName(old_country: CountryName, country: CountryName) {
    delete Object.assign(this.draftState, { [country]: this.draftState[old_country] })[old_country]
  }

  toggleIsLoyal(country: CountryName, mode: Mode) {
    this.draftState[country][mode].is_loyal = !this.draftState[country][mode].is_loyal
  }

  enableModifiers(country: CountryName, key: string, modifiers: Modifier[]) {
    modifiers = modifiers.filter(value => value.scope === ScopeType.Country)
    const landValues = modifiers.filter(value => value.target === DefinitionType.Land || value.target === DefinitionType.Global)
    const baseLandValues = landValues.filter(value => value.type !== ValuesType.Modifier).map(value => [value.attribute, value.value] as [UnitValueType, number])
    const modifierLandValues = landValues.filter(value => value.type === ValuesType.Modifier).map(value => [value.attribute, value.value] as [UnitValueType, number])
    const navalValues = modifiers.filter(value => value.target === DefinitionType.Naval || value.target === DefinitionType.Global)
    const baseNavalValues = navalValues.filter(value => value.type !== ValuesType.Modifier).map(value => [value.attribute, value.value] as [UnitValueType, number])
    const modifierNavalValues = navalValues.filter(value => value.type === ValuesType.Modifier).map(value => [value.attribute, value.value] as [UnitValueType, number])
    let definition = this.state[country][DefinitionType.Land]
    definition = regenerateValues(definition, ValuesType.Base, key, baseLandValues)
    definition = regenerateValues(definition, ValuesType.Modifier, key, modifierLandValues)
    this.draftState[country][DefinitionType.Land] = definition
    definition = this.state[country][DefinitionType.Naval]
    definition = regenerateValues(definition, ValuesType.Base, key, baseNavalValues)
    definition = regenerateValues(definition, ValuesType.Modifier, key, modifierNavalValues)
    this.draftState[country][DefinitionType.Naval] = definition
  }

  clearModifiers(country: CountryName, key: string) {
    this.draftState[country][DefinitionType.Land] = clearAllValues(this.state[country][DefinitionType.Land], key)
    this.draftState[country][DefinitionType.Naval] = clearAllValues(this.state[country][DefinitionType.Naval], key)
  }
}

const unitsActions = createActionCreators(UnitsReducer)

export const setUnitValue = unitsActions.setValue
export const deleteUnit = unitsActions.deleteUnit
export const addUnit = unitsActions.addUnit
export const changeUnitType = unitsActions.changeType
export const changeUnitImage = unitsActions.changeImage
export const changeUnitMode = unitsActions.changeMode
export const changeUnitDeployment = unitsActions.changeDeployment
export const toggleIsUnitLoyal = unitsActions.toggleIsLoyal

const unitsBaseReducer = createReducerFunction(UnitsReducer, getDefaultUnitDefinitions())

export const unitsReducer = (state = getDefaultUnitDefinitions(), action: Actions<typeof UnitsReducer>) => {
  if (action.type === createCountry.type)
    return unitsBaseReducer(state, { payload: action.payload, type: unitsActions.createCountry.type, args: true } as any)
  if (action.type === deleteCountry.type)
    return unitsBaseReducer(state, { payload: action.payload, type: unitsActions.deleteCountry.type })
  if (action.type === changeCountryName.type)
    return unitsBaseReducer(state, { payload: action.payload, type: unitsActions.changeCountryName.type, args: true } as any)
  if (action.type === enableModifiers.type)
    return unitsBaseReducer(state, { payload: action.payload, type: unitsActions.enableModifiers.type, args: true } as any)
  if (action.type === clearModifiers.type)
    return unitsBaseReducer(state, { payload: action.payload, type: unitsActions.clearModifiers.type, args: true } as any)
  return unitsBaseReducer(state, action)
}

const baseDefinitionsActions = createActionCreators(BaseDefinitionsReducer)

export const setGlobalValue = baseDefinitionsActions.setGlobalValue
export const toggleGlobalIsLoyal = baseDefinitionsActions.toggleIsLoyal

const baseDefinitionsReducer = createReducerFunction(BaseDefinitionsReducer, getDefaultBaseDefinitions())

export const globalStatsReducer = (state = getDefaultBaseDefinitions(), action: Actions<typeof BaseDefinitionsReducer>) => {
  if (action.type === createCountry.type)
    return baseDefinitionsReducer(state, { payload: action.payload, type: baseDefinitionsActions.createCountry.type, args: true } as any)
  if (action.type === deleteCountry.type)
    return baseDefinitionsReducer(state, { payload: action.payload, type: baseDefinitionsActions.deleteCountry.type })
  if (action.type === changeCountryName.type)
    return baseDefinitionsReducer(state, { payload: action.payload, type: baseDefinitionsActions.changeCountryName.type, args: true } as any)
  if (action.type === enableModifiers.type)
    return baseDefinitionsReducer(state, { payload: action.payload, type: baseDefinitionsActions.enableModifiers.type, args: true } as any)
  if (action.type === clearModifiers.type)
    return baseDefinitionsReducer(state, { payload: action.payload, type: baseDefinitionsActions.clearModifiers.type, args: true } as any)
  return baseDefinitionsReducer(state, action)
}
