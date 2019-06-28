import { Map, OrderedSet } from 'immutable'
import { createReducer } from 'typesafe-actions'
import { getDefaultDefinitions, getDefaultTypes, getDefaultGlobalDefinition } from './data'
import {
  UnitType, UnitDefinition,
  setValue, setGlobalValue, deleteUnit, addUnit, changeImage, changeType, changeMode,
  ValueType,
  UnitCalc
} from './actions'
import { CountryName, enableTradition, clearTradition, createCountry, deleteCountry, changeCountryName, duplicateCountry } from '../countries'
import { addValues, DefinitionType, ValuesType, regenerateValues, clearValues } from '../../base_definition'

export const unitsState = {
  types: Map<CountryName, OrderedSet<UnitType>>().set(CountryName.Country1, getDefaultTypes()).set(CountryName.Country2, getDefaultTypes()),
  definitions: Map<CountryName, Map<UnitType, UnitDefinition>>().set(CountryName.Country1, getDefaultDefinitions()).set(CountryName.Country2, getDefaultDefinitions()),
}
export const globalStatsState = Map<CountryName, Map<DefinitionType, UnitDefinition>>().set(CountryName.Country1, getDefaultGlobalDefinition()).set(CountryName.Country2, getDefaultGlobalDefinition())

const isModifier = (attribute: string) => {
  return attribute === UnitCalc.Morale || attribute === UnitCalc.Strength || attribute === UnitCalc.Maintenance || attribute === UnitCalc.Cost
}

export const unitsReducer = createReducer(unitsState)
  .handleAction(setValue, (state, action: ReturnType<typeof setValue>) => (
    {
      ...state,
      definitions: state.definitions.updateIn([action.payload.country, action.payload.unit], (unit: UnitDefinition) => (
        addValues(unit, action.payload.type, action.payload.key, [[action.payload.attribute, action.payload.value]])
      ))
    }
  ))
  .handleAction(deleteUnit, (state, action: ReturnType<typeof deleteUnit>) => (
    {
      ...state,
      definitions: state.definitions.deleteIn([action.payload.country, action.payload.type]),
      types: state.types.deleteIn([action.payload.country, action.payload.type])
    }
  ))
  .handleAction(addUnit, (state, action: ReturnType<typeof addUnit>) => (
    {
      ...state,
      definitions: state.definitions.setIn([action.payload.country, action.payload.type], { type: action.payload.type, mode: action.payload.mode, image: '' }),
      types: state.types.update(action.payload.country, value => value.add(action.payload.type))
    }
  ))
  .handleAction(changeImage, (state, action: ReturnType<typeof changeImage>) => (
    {
      ...state,
      definitions: state.definitions.updateIn([action.payload.country, action.payload.type], unit => ({ ...unit, image: action.payload.image }))
    }
  ))
  .handleAction(changeMode, (state, action: ReturnType<typeof changeMode>) => (
    {
      ...state,
      definitions: state.definitions.updateIn([action.payload.country, action.payload.type], unit => ({ ...unit, mode: action.payload.mode }))
    }
  ))
  .handleAction(changeType, (state, action: ReturnType<typeof changeType>) => (
    {
      ...state,
      definitions: state.definitions.setIn([action.payload.country, action.payload.new_type], { ...state.definitions.getIn([action.payload.country, action.payload.old_type]), type: action.payload.new_type }).deleteIn([action.payload.country, action.payload.old_type]),
      types: state.types.update(action.payload.country, value => value.toList().map(value => value === action.payload.old_type ? action.payload.new_type : value).toOrderedSet())
    }
  ))
  .handleAction(createCountry, (state, action: ReturnType<typeof createCountry>) => (
    {
      ...state,
      definitions: state.definitions.set(action.payload.country, getDefaultDefinitions()),
      types: state.types.set(action.payload.country, getDefaultTypes())
    }
  ))
  .handleAction(duplicateCountry, (state, action: ReturnType<typeof duplicateCountry>) => (
    {
      ...state,
      definitions: state.definitions.set(action.payload.country, state.definitions.get(action.payload.source_country, getDefaultDefinitions())),
      types: state.types.set(action.payload.country, state.types.get(action.payload.source_country, getDefaultTypes()))
    }
  ))
  .handleAction(deleteCountry, (state, action: ReturnType<typeof deleteCountry>) => (
    {
      ...state,
      definitions: state.definitions.delete(action.payload.country),
      types: state.types.delete(action.payload.country)
    }
  ))
  .handleAction(changeCountryName, (state, action: ReturnType<typeof changeCountryName>) => (
    {
      ...state,
      definitions: state.definitions.mapKeys(key => key === action.payload.old_country ? action.payload.country : key),
      types: state.types.mapKeys(key => key === action.payload.old_country ? action.payload.country : key)
    }
  ))
  .handleAction(enableTradition, (state, action: ReturnType<typeof enableTradition>) => {
    let next = state.definitions.get(action.payload.country)!
    if (!next)
      return state
    next = next.map((unit, type) => {
      const values = action.payload.tradition.modifiers.filter(value => value.type === type)
      const base_values = values.filter(value => !isModifier(value.attribute)).map(value => [value.attribute, value.value] as [ValueType, number]).toArray()
      const modifier_values = values.filter(value => isModifier(value.attribute)).map(value => [value.attribute, value.value] as [ValueType, number]).toArray()
      return regenerateValues(regenerateValues(unit, ValuesType.Base, action.payload.key, base_values), ValuesType.Modifier, action.payload.key, modifier_values)
    })
    return { ...state, definitions: state.definitions.set(action.payload.country, next) }
  })
  .handleAction(clearTradition, (state, action: ReturnType<typeof clearTradition>) => {
    let next = state.definitions.get(action.payload.country)!
    if (!next)
      return state
    next = next.map(unit => clearValues(unit, ValuesType.Modifier, action.payload.key))
    return { ...state, definitions: state.definitions.set(action.payload.country, next) }
  })

export const globalStatsReducer = createReducer(globalStatsState)
  .handleAction(setGlobalValue, (state, action: ReturnType<typeof setGlobalValue>) => (
    state.updateIn([action.payload.country, action.payload.mode], (unit: UnitDefinition) => addValues(unit, action.payload.type, action.payload.key, [[action.payload.attribute, action.payload.value]]))
  ))
  .handleAction(createCountry, (state, action: ReturnType<typeof createCountry>) => (
    state.set(action.payload.country, getDefaultGlobalDefinition())
  ))
  .handleAction(duplicateCountry, (state, action: ReturnType<typeof duplicateCountry>) => (
    state.set(action.payload.country, state.get(action.payload.source_country, getDefaultGlobalDefinition()))
  ))
  .handleAction(deleteCountry, (state, action: ReturnType<typeof deleteCountry>) => (
    state.delete(action.payload.country)
  ))
  .handleAction(changeCountryName, (state, action: ReturnType<typeof changeCountryName>) => (
    state.mapKeys(key => key === action.payload.old_country ? action.payload.country : key)
  ))
  .handleAction(enableTradition, (state, action: ReturnType<typeof enableTradition>) => {
    let next = state.get(action.payload.country)!
    if (!next)
      return state
    const landValues = action.payload.tradition.modifiers.filter(value => value.type === DefinitionType.Land || value.type === DefinitionType.Global)
    const baseLandValues = landValues.filter(value => !isModifier(value.attribute)).map(value => [value.attribute, value.value] as [ValueType, number]).toArray()
    const modifierLandValues = landValues.filter(value => isModifier(value.attribute)).map(value => [value.attribute, value.value] as [ValueType, number]).toArray()
    const navalValues = action.payload.tradition.modifiers.filter(value => value.type === DefinitionType.Naval || value.type === DefinitionType.Global)
    const baseNavalValues = navalValues.filter(value => !isModifier(value.attribute)).map(value => [value.attribute, value.value] as [ValueType, number]).toArray()
    const modifierNavalValues = navalValues.filter(value => isModifier(value.attribute)).map(value => [value.attribute, value.value] as [ValueType, number]).toArray()
    next = next.update(DefinitionType.Land, stats => regenerateValues(stats, ValuesType.Base, action.payload.key, baseLandValues))
    next = next.update(DefinitionType.Land, stats => regenerateValues(stats, ValuesType.Modifier, action.payload.key, modifierLandValues))
    next = next.update(DefinitionType.Naval, stats => regenerateValues(stats, ValuesType.Base, action.payload.key, baseNavalValues))
    next = next.update(DefinitionType.Naval, stats => regenerateValues(stats, ValuesType.Modifier, action.payload.key, modifierNavalValues))
    return state.set(action.payload.country, next)
  })
  .handleAction(clearTradition, (state, action: ReturnType<typeof clearTradition>) => {
    let next = state.get(action.payload.country)!
    if (!next)
      return state
    next = next.update(DefinitionType.Land, stats => clearValues(stats, ValuesType.Modifier, action.payload.key))
    next = next.update(DefinitionType.Naval, stats => clearValues(stats, ValuesType.Modifier, action.payload.key))
    return state.set(action.payload.country, next)
  })
