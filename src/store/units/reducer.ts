import { getDefaultUnits, getDefaultGlobals, getIcon } from './data'
import {
  UnitType, UnitDefinition,
  ValueType
} from './actions'
import { CountryName, enableModifiers, clearModifiers, createCountry, deleteCountry, changeCountryName } from '../countries'
import { addValues, DefinitionType, ValuesType, regenerateValues, clearValues } from '../../base_definition'
import { ImmerReducer, createActionCreators, createReducerFunction, Actions } from 'immer-reducer'
import { Modifier } from '../data'
import { objGet, map } from '../../utils'

export type GlobalStats = { [key in CountryName]: GlobalDefinitions }
export type GlobalDefinitions = { [key in DefinitionType.Land | DefinitionType.Naval]: UnitDefinition }

export type Units = { [key in CountryName]: UnitDefinitions }
export type UnitDefinitions = { [key in UnitType]: UnitDefinition }

export const unitsState = { [CountryName.Country1]: getDefaultUnits(), [CountryName.Country2]: getDefaultUnits() } as Units

export const globalStatsState = { [CountryName.Country1]: getDefaultGlobals(), [CountryName.Country2]: getDefaultGlobals() } as GlobalStats


class UnitsReducer extends ImmerReducer<Units> {

  setValue(country: CountryName, values_type: ValuesType, type: UnitType, key: string, attribute: ValueType, value: number) {
    this.draftState[country][type] = addValues(this.state[country][type], values_type, key, [[attribute, value]])
  }

  deleteUnit(country: CountryName, type: UnitType) {
    delete this.draftState[country][type]
  }

  addUnit(country: CountryName, mode: DefinitionType, type: UnitType) {
    this.draftState[country][type] = { type, mode, image: getIcon(type), can_assault: false, requirements: '', is_flank: false }
  }

  changeType(country: CountryName, old_type: UnitType, type: UnitType) {
    delete Object.assign(this.draftState[country], {[type]: this.draftState[country][old_type] })[old_type]
  }

  changeImage(country: CountryName, type: UnitType, image: string) {
    this.draftState[country][type].image = image
  }

  toggleIsFlank(country: CountryName, type: UnitType) {
    this.draftState[country][type].is_flank = !this.draftState[country][type].is_flank
  }

  toggleCanAssault(country: CountryName, type: UnitType) {
    this.draftState[country][type].can_assault = !this.draftState[country][type].can_assault
  }

  changeMode(country: CountryName, type: UnitType, mode: DefinitionType) {
    this.draftState[country][type].mode = mode
  }

  createCountry(country: CountryName, source_country?: CountryName) {
    this.draftState[country] = objGet(this.state, source_country, getDefaultUnits())
  }

  deleteCountry(country: CountryName) {
    delete this.draftState[country]
  }

  changeCountryName(old_country: CountryName, country: CountryName) {
    delete Object.assign(this.draftState, {[country]: this.draftState[old_country] })[old_country]
  }

  enableModifiers(country: CountryName, key: string, modifiers: Modifier[]) {
    const next = map(this.state[country], (unit, type) => {
      const values = modifiers.filter(value => value.target === type)
      const base_values = values.filter(value => value.type !== ValuesType.Modifier).map(value => [value.attribute, value.value] as [ValueType, number])
      const modifier_values = values.filter(value => value.type === ValuesType.Modifier).map(value => [value.attribute, value.value] as [ValueType, number])
      return regenerateValues(regenerateValues(unit, ValuesType.Base, key, base_values), ValuesType.Modifier, key, modifier_values)
    })
    this.draftState[country] = next
  }

  clearModifiers(country: CountryName, key: string) {
    const next = map(this.state[country], unit => clearValues(clearValues(unit, ValuesType.Base, key), ValuesType.Modifier, key))
    this.draftState[country] = next
  }
}

class GlobalStatsReducer extends ImmerReducer<GlobalStats> {

  setGlobalValue(country: CountryName, mode: DefinitionType.Land | DefinitionType.Naval, type: ValuesType, key: string, attribute: ValueType, value: number) {
    this.draftState[country][mode] = addValues(this.state[country][mode], type, key, [[attribute, value]])
  }

  createCountry(country: CountryName, source_country?: CountryName) {
    this.draftState[country] = objGet(this.state, source_country!, getDefaultGlobals())
  }

  deleteCountry(country: CountryName) {
    delete this.draftState[country]
  }

  changeCountryName(old_country: CountryName, country: CountryName) {
    delete Object.assign(this.draftState, {[country]: this.draftState[old_country] })[old_country]
  }

  enableModifiers(country: CountryName, key: string, modifiers: Modifier[]) {
    const landValues = modifiers.filter(value => value.target === DefinitionType.Land || value.target === DefinitionType.Global)
    const baseLandValues = landValues.filter(value => value.type !== ValuesType.Modifier).map(value => [value.attribute, value.value] as [ValueType, number])
    const modifierLandValues = landValues.filter(value => value.type === ValuesType.Modifier).map(value => [value.attribute, value.value] as [ValueType, number])
    const navalValues = modifiers.filter(value => value.target === DefinitionType.Naval || value.target === DefinitionType.Global)
    const baseNavalValues = navalValues.filter(value => value.type !== ValuesType.Modifier).map(value => [value.attribute, value.value] as [ValueType, number])
    const modifierNavalValues = navalValues.filter(value => value.type === ValuesType.Modifier).map(value => [value.attribute, value.value] as [ValueType, number])
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
    this.draftState[country][DefinitionType.Land] = clearValues(clearValues(this.state[country][DefinitionType.Land], ValuesType.Base, key), ValuesType.Modifier, key)
    this.draftState[country][DefinitionType.Naval] = clearValues(clearValues(this.state[country][DefinitionType.Naval], ValuesType.Base, key), ValuesType.Modifier, key)
  }
}

const unitsActions = createActionCreators(UnitsReducer)

export const setValue = unitsActions.setValue
export const deleteUnit = unitsActions.deleteUnit
export const addUnit = unitsActions.addUnit
export const changeType = unitsActions.changeType
export const changeImage = unitsActions.changeImage
export const changeMode = unitsActions.changeMode
export const toggleIsFlank = unitsActions.toggleIsFlank
export const toggleCanAssault = unitsActions.toggleCanAssault

const unitsBaseReducer = createReducerFunction(UnitsReducer, unitsState)

export const unitsReducer = (state = unitsState, action: Actions<typeof UnitsReducer>) => {
  if (action.type === createCountry.type)
    return unitsBaseReducer(state, { payload: action.payload, type: unitsActions.createCountry.type })
  if (action.type === deleteCountry.type)
    return unitsBaseReducer(state, { payload: action.payload, type: unitsActions.deleteCountry.type })
  if (action.type === changeCountryName.type)
    return unitsBaseReducer(state, { payload: action.payload, type: unitsActions.changeCountryName.type })
  if (action.type === enableModifiers.type)
    return unitsBaseReducer(state, { payload: action.payload, type: unitsActions.enableModifiers.type })
  if (action.type === clearModifiers.type)
    return unitsBaseReducer(state, { payload: action.payload, type: unitsActions.clearModifiers.type })
  return unitsBaseReducer(state, action)
}

const globalStatsActions = createActionCreators(GlobalStatsReducer)

export const setGlobalValue = globalStatsActions.setGlobalValue

const globalStatsBaseReducer = createReducerFunction(GlobalStatsReducer, globalStatsState)

export const globalStatsReducer = (state = globalStatsState, action: Actions<typeof GlobalStatsReducer>) => {
  if (action.type === createCountry.type)
    return globalStatsBaseReducer(state, { payload: action.payload, type: globalStatsActions.createCountry.type })
  if (action.type === deleteCountry.type)
    return globalStatsBaseReducer(state, { payload: action.payload, type: globalStatsActions.deleteCountry.type })
  if (action.type === changeCountryName.type)
    return globalStatsBaseReducer(state, { payload: action.payload, type: globalStatsActions.changeCountryName.type })
  if (action.type === enableModifiers.type)
    return globalStatsBaseReducer(state, { payload: action.payload, type: globalStatsActions.enableModifiers.type })
  if (action.type === clearModifiers.type)
    return globalStatsBaseReducer(state, { payload: action.payload, type: globalStatsActions.clearModifiers.type })
  return globalStatsBaseReducer(state, action)
}
