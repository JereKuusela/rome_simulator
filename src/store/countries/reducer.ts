import { createReducer } from 'typesafe-actions'
import { combineReducers } from 'redux'
import { Set, Map } from 'immutable'
import { getDefaultDefinitions, getDefaultTypes } from './data'
import {
  GovermentType, CountryName,
  deleteCountry, createCountry, changeCountryName, enableTradition, clearTradition,
  selectGovernment, selectReligion, ReligionType
} from './actions'

interface Selections {
  traditions: Set<string>,
  government: GovermentType,
  religion: ReligionType
}

const getDefaultSelections = () => (
  {
    traditions: Set<string>(),
    government: GovermentType.Republic,
    religion: ReligionType.Greek
  }
)

const traditionsState = {
  types: getDefaultTypes(),
  definitions: getDefaultDefinitions()
}

const selectionsState = Map<CountryName, Selections>().set(CountryName.Country1, getDefaultSelections()).set(CountryName.Country2, getDefaultSelections())

const traditionsReducer = createReducer(traditionsState)


const selectionsReducer = createReducer(selectionsState)
  .handleAction(createCountry, (state, action: ReturnType<typeof createCountry>) => (
    state.set(action.payload.country, state.get(action.payload.source_country!, getDefaultSelections()))
  ))
  .handleAction(deleteCountry, (state, action: ReturnType<typeof deleteCountry>) => (
    state.delete(action.payload.country)
  ))
  .handleAction(changeCountryName, (state, action: ReturnType<typeof changeCountryName>) => (
    state.mapKeys(key => key === action.payload.old_country ? action.payload.country : key)
  ))
  .handleAction(enableTradition, (state, action: ReturnType<typeof enableTradition>) => (
    state.update(action.payload.country, value => ({ ...value, traditions: value.traditions.add(action.payload.key) }))
  ))
  .handleAction(clearTradition, (state, action: ReturnType<typeof clearTradition>) => (
    state.update(action.payload.country, value => ({ ...value, traditions: value.traditions.remove(action.payload.key) }))
  ))
  .handleAction(selectGovernment, (state, action: ReturnType<typeof selectGovernment>) => (
    state.update(action.payload.country, value => ({ ...value, government: action.payload.government }))
  ))
  .handleAction(selectReligion, (state, action: ReturnType<typeof selectReligion>) => (
    state.update(action.payload.country, value => ({ ...value, religion: action.payload.religion }))
  ))

export const countriesReducer = combineReducers({
  selections: selectionsReducer,
  traditions: traditionsReducer
})
