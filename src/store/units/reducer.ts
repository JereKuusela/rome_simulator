import { Map, OrderedMap, List } from 'immutable'
import { getDefaultUnits, getDefaultGlobal } from './data'
import {
  UnitType, UnitDefinition,
  ValueType
} from './actions'
import { CountryName, enableModifiers, clearModifiers, createCountry, deleteCountry, changeCountryName } from '../countries'
import { addValues, DefinitionType, ValuesType, regenerateValues, clearValues } from '../../base_definition'
import { ImmerReducer, createActionCreators, createReducerFunction, Actions } from 'immer-reducer';
import { Modifier } from '../data';

export const unitsState = Map<CountryName, OrderedMap<UnitType, UnitDefinition>>().set(CountryName.Country1, getDefaultUnits()).set(CountryName.Country2, getDefaultUnits())

export const globalStatsState = Map<CountryName, Map<DefinitionType, UnitDefinition>>().set(CountryName.Country1, getDefaultGlobal()).set(CountryName.Country2, getDefaultGlobal())


class UnitsReducer extends ImmerReducer<typeof unitsState> {

  setValue(country: CountryName, type: ValuesType, unit: UnitType, key: string, attribute: ValueType, value: number) {
    this.draftState = this.state.updateIn([country, unit], (unit: UnitDefinition) => (
      addValues(unit, type, key, [[attribute, value]])
    ))
  }

  deleteUnit(country: CountryName, type: UnitType) {
    this.draftState = this.state.update(country, value => value.delete(type))
  }

  addUnit(country: CountryName, mode: DefinitionType, type: UnitType) {
    this.draftState = this.state.setIn([country, type], { type, mode, image: '' })
  }

  changeType(country: CountryName, old_type: UnitType, new_type: UnitType) {
    this.draftState = this.state.setIn([country, new_type], { ...this.state.getIn([country, old_type]), type: new_type }).deleteIn([country, old_type])
  }

  changeImage(country: CountryName, type: UnitType, image: string) {
    this.draftState = this.state.updateIn([country, type], unit => ({ ...unit, image }))
  }

  changeMode(country: CountryName, type: UnitType, mode: DefinitionType) {
    this.draftState = this.state.updateIn([country, type], unit => ({ ...unit, mode }))
  }

  createCountry(country: CountryName, source_country?: CountryName) {
    this.draftState = this.state.set(country, this.state.get(source_country!, getDefaultUnits()))
  }

  deleteCountry(country: CountryName) {
    this.draftState = this.state.delete(country)
  }

  changeCountryName(old_country: CountryName, country: CountryName) {
    this.draftState = this.state.mapKeys(key => key === old_country ? country : key)
  }

  enableModifiers(country: CountryName, key: string, modifiers: List<Modifier>) {
    let next = this.state.get(country)!
    if (!next)
      return
    next = next.map((unit, type) => {
      const values = modifiers.filter(value => value.target === type)
      const base_values = values.filter(value => value.type !== ValuesType.Modifier).map(value => [value.attribute, value.value] as [ValueType, number]).toArray()
      const modifier_values = values.filter(value => value.type === ValuesType.Modifier).map(value => [value.attribute, value.value] as [ValueType, number]).toArray()
      return regenerateValues(regenerateValues(unit, ValuesType.Base, key, base_values), ValuesType.Modifier, key, modifier_values)
    })
    this.draftState = this.state.set(country, next)
  }

  clearModifiers(country: CountryName, key: string) {
    let next = this.state.get(country)!
    if (!next)
      return
    next = next.map(unit => clearValues(clearValues(unit, ValuesType.Base, key), ValuesType.Modifier, key))
    this.draftState = this.state.set(country, next)
  }
}

class GlobalStatsReducer extends ImmerReducer<typeof globalStatsState> {

  setGlobalValue(country: CountryName, mode: DefinitionType, type: ValuesType, key: string, attribute: ValueType, value: number) {
    this.draftState = this.state.updateIn([country, mode], (unit: UnitDefinition) => addValues(unit, type, key, [[attribute, value]]))
  }

  createCountry(country: CountryName, source_country?: CountryName) {
    this.draftState = this.state.set(country, this.state.get(source_country!, getDefaultGlobal()))
  }

  deleteCountry(country: CountryName) {
    this.draftState = this.state.delete(country)
  }

  changeCountryName(old_country: CountryName, country: CountryName) {
    this.draftState = this.state.mapKeys(key => key === old_country ? country : key)
  }

  enableModifiers(country: CountryName, key: string, modifiers: List<Modifier>) {
    let next = this.state.get(country)!
    if (!next)
      return
    const landValues = modifiers.filter(value => value.target === DefinitionType.Land || value.target === DefinitionType.Global)
    const baseLandValues = landValues.filter(value => value.type !== ValuesType.Modifier).map(value => [value.attribute, value.value] as [ValueType, number]).toArray()
    const modifierLandValues = landValues.filter(value => value.type === ValuesType.Modifier).map(value => [value.attribute, value.value] as [ValueType, number]).toArray()
    const navalValues = modifiers.filter(value => value.target === DefinitionType.Naval || value.target === DefinitionType.Global)
    const baseNavalValues = navalValues.filter(value => value.type !== ValuesType.Modifier).map(value => [value.attribute, value.value] as [ValueType, number]).toArray()
    const modifierNavalValues = navalValues.filter(value => value.type === ValuesType.Modifier).map(value => [value.attribute, value.value] as [ValueType, number]).toArray()
    next = next.update(DefinitionType.Land, stats => regenerateValues(stats, ValuesType.Base, key, baseLandValues))
    next = next.update(DefinitionType.Land, stats => regenerateValues(stats, ValuesType.Modifier, key, modifierLandValues))
    next = next.update(DefinitionType.Naval, stats => regenerateValues(stats, ValuesType.Base, key, baseNavalValues))
    next = next.update(DefinitionType.Naval, stats => regenerateValues(stats, ValuesType.Modifier, key, modifierNavalValues))
    this.draftState = this.state.set(country, next)
  }

  clearModifiers(country: CountryName, key: string) {
    let next = this.state.get(country)!
    if (!next)
      return
    next = next.update(DefinitionType.Land, stats => clearValues(clearValues(stats, ValuesType.Base, key), ValuesType.Modifier, key))
    next = next.update(DefinitionType.Naval, stats => clearValues(clearValues(stats, ValuesType.Base, key), ValuesType.Modifier, key))
    this.draftState = this.state.set(country, next)
  }
}

const unitsActions = createActionCreators(UnitsReducer)

export const setValue = unitsActions.setValue
export const deleteUnit = unitsActions.deleteUnit
export const addUnit = unitsActions.addUnit
export const changeType = unitsActions.changeType
export const changeImage = unitsActions.changeImage
export const changeMode = unitsActions.changeMode

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
