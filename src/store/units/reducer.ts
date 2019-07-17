import { Map, OrderedMap } from 'immutable'
import { createReducer } from 'typesafe-actions'
import { getDefaultUnits, getDefaultGlobal } from './data'
import {
  UnitType, UnitDefinition,
  setValue, setGlobalValue, deleteUnit, addUnit, changeImage, changeType, changeMode,
  ValueType
} from './actions'
import { CountryName, enableModifiers, clearModifiers, createCountry, deleteCountry, changeCountryName } from '../countries'
import { addValues, DefinitionType, ValuesType, regenerateValues, clearValues } from '../../base_definition'

export const unitsState = Map<CountryName, OrderedMap<UnitType, UnitDefinition>>().set(CountryName.Country1, getDefaultUnits()).set(CountryName.Country2, getDefaultUnits())

export const globalStatsState = Map<CountryName, Map<DefinitionType, UnitDefinition>>().set(CountryName.Country1, getDefaultGlobal()).set(CountryName.Country2, getDefaultGlobal())

export const unitsReducer = createReducer(unitsState)
  .handleAction(setValue, (state, action: ReturnType<typeof setValue>) => (
    state.updateIn([action.payload.country, action.payload.unit], (unit: UnitDefinition) => (
        addValues(unit, action.payload.type, action.payload.key, [[action.payload.attribute, action.payload.value]])
      )
    )
  ))
  .handleAction(deleteUnit, (state, action: ReturnType<typeof deleteUnit>) => (
    state.deleteIn([action.payload.country, action.payload.type])
  ))
  .handleAction(addUnit, (state, action: ReturnType<typeof addUnit>) => (
     state.setIn([action.payload.country, action.payload.type], { type: action.payload.type, mode: action.payload.mode, image: '' })
  ))
  .handleAction(changeImage, (state, action: ReturnType<typeof changeImage>) => (
    state.updateIn([action.payload.country, action.payload.type], unit => ({ ...unit, image: action.payload.image }))
  ))
  .handleAction(changeMode, (state, action: ReturnType<typeof changeMode>) => (
    state.updateIn([action.payload.country, action.payload.type], unit => ({ ...unit, mode: action.payload.mode }))
  ))
  .handleAction(changeType, (state, action: ReturnType<typeof changeType>) => (
    state.setIn([action.payload.country, action.payload.new_type], { ...state.getIn([action.payload.country, action.payload.old_type]), type: action.payload.new_type }).deleteIn([action.payload.country, action.payload.old_type])
  ))
  .handleAction(createCountry, (state, action: ReturnType<typeof createCountry>) => (
    state.set(action.payload.country, state.get(action.payload.source_country!, getDefaultUnits()))
  ))
  .handleAction(deleteCountry, (state, action: ReturnType<typeof deleteCountry>) => (
    state.delete(action.payload.country)
  ))
  .handleAction(changeCountryName, (state, action: ReturnType<typeof changeCountryName>) => (
    state.mapKeys(key => key === action.payload.old_country ? action.payload.country : key)
  ))
  .handleAction(enableModifiers, (state, action: ReturnType<typeof enableModifiers>) => {
    let next = state.get(action.payload.country)!
    if (!next)
      return state
    next = next.map((unit, type) => {
      const values = action.payload.modifiers.filter(value => value.target === type)
      const base_values = values.filter(value => value.type !== ValuesType.Modifier).map(value => [value.attribute, value.value] as [ValueType, number]).toArray()
      const modifier_values = values.filter(value => value.type === ValuesType.Modifier).map(value => [value.attribute, value.value] as [ValueType, number]).toArray()
      return regenerateValues(regenerateValues(unit, ValuesType.Base, action.payload.key, base_values), ValuesType.Modifier, action.payload.key, modifier_values)
    })
    return state.set(action.payload.country, next)
  })
  .handleAction(clearModifiers, (state, action: ReturnType<typeof clearModifiers>) => {
    let next = state.get(action.payload.country)!
    if (!next)
      return state
    next = next.map(unit => clearValues(clearValues(unit, ValuesType.Base, action.payload.key), ValuesType.Modifier, action.payload.key))
    return state.set(action.payload.country, next)
  })

export const globalStatsReducer = createReducer(globalStatsState)
  .handleAction(setGlobalValue, (state, action: ReturnType<typeof setGlobalValue>) => (
    state.updateIn([action.payload.country, action.payload.mode], (unit: UnitDefinition) => addValues(unit, action.payload.type, action.payload.key, [[action.payload.attribute, action.payload.value]]))
  ))
  .handleAction(createCountry, (state, action: ReturnType<typeof createCountry>) => (
    state.set(action.payload.country, state.get(action.payload.source_country!, getDefaultGlobal()))
  ))
  .handleAction(deleteCountry, (state, action: ReturnType<typeof deleteCountry>) => (
    state.delete(action.payload.country)
  ))
  .handleAction(changeCountryName, (state, action: ReturnType<typeof changeCountryName>) => (
    state.mapKeys(key => key === action.payload.old_country ? action.payload.country : key)
  ))
  .handleAction(enableModifiers, (state, action: ReturnType<typeof enableModifiers>) => {
    let next = state.get(action.payload.country)!
    if (!next)
      return state
    const landValues = action.payload.modifiers.filter(value => value.target === DefinitionType.Land || value.target === DefinitionType.Global)
    const baseLandValues = landValues.filter(value => value.type !== ValuesType.Modifier).map(value => [value.attribute, value.value] as [ValueType, number]).toArray()
    const modifierLandValues = landValues.filter(value => value.type === ValuesType.Modifier).map(value => [value.attribute, value.value] as [ValueType, number]).toArray()
    const navalValues = action.payload.modifiers.filter(value => value.target === DefinitionType.Naval || value.target === DefinitionType.Global)
    const baseNavalValues = navalValues.filter(value => value.type !== ValuesType.Modifier).map(value => [value.attribute, value.value] as [ValueType, number]).toArray()
    const modifierNavalValues = navalValues.filter(value => value.type === ValuesType.Modifier).map(value => [value.attribute, value.value] as [ValueType, number]).toArray()
    next = next.update(DefinitionType.Land, stats => regenerateValues(stats, ValuesType.Base, action.payload.key, baseLandValues))
    next = next.update(DefinitionType.Land, stats => regenerateValues(stats, ValuesType.Modifier, action.payload.key, modifierLandValues))
    next = next.update(DefinitionType.Naval, stats => regenerateValues(stats, ValuesType.Base, action.payload.key, baseNavalValues))
    next = next.update(DefinitionType.Naval, stats => regenerateValues(stats, ValuesType.Modifier, action.payload.key, modifierNavalValues))
    return state.set(action.payload.country, next)
  })
  .handleAction(clearModifiers, (state, action: ReturnType<typeof clearModifiers>) => {
    let next = state.get(action.payload.country)!
    if (!next)
      return state
    next = next.update(DefinitionType.Land, stats => clearValues(clearValues(stats, ValuesType.Base, action.payload.key), ValuesType.Modifier, action.payload.key))
    next = next.update(DefinitionType.Naval, stats => clearValues(clearValues(stats, ValuesType.Base, action.payload.key), ValuesType.Modifier, action.payload.key))
    return state.set(action.payload.country, next)
  })
