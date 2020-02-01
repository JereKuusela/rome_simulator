
import { ImmerReducer, createActionCreators, createReducerFunction, Actions } from 'immer-reducer'

import { DefinitionType, ValuesType, CountryName, UnitType, UnitValueType, UnitDeployment, Modifier, ScopeType, UnitState } from 'types'
import { getDefaultUnits, getUnitIcon, getDefaultUnitState } from 'data'
import { addValues, regenerateValues, clearValues } from 'definition_values'
import { map } from 'utils'
import { createCountry, deleteCountry, changeCountryName, enableModifiers, clearModifiers } from './countries'


const filterTarget = (type: UnitType, target: string) => (
  type === target
  || (target === DefinitionType.Land && type === UnitType.BaseLand)
  || (target === DefinitionType.Naval && type === UnitType.BaseNaval)
  || (target === DefinitionType.Global && (type === UnitType.BaseLand || type === UnitType.BaseNaval))
)

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
      const values = modifiers.filter(value => filterTarget(type, value.target))
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

const unitsActions = createActionCreators(UnitsReducer)

export const setUnitValue = unitsActions.setValue
export const deleteUnit = unitsActions.deleteUnit
export const addUnit = unitsActions.addUnit
export const changeUnitType = unitsActions.changeType
export const changeUnitImage = unitsActions.changeImage
export const changeUnitMode = unitsActions.changeMode
export const changeUnitDeployment = unitsActions.changeDeployment
export const toggleIsUnitLoyal = unitsActions.toggleIsLoyal

const unitsBaseReducer = createReducerFunction(UnitsReducer, getDefaultUnitState())

export const unitsReducer = (state = getDefaultUnitState(), action: Actions<typeof UnitsReducer>) => {
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
