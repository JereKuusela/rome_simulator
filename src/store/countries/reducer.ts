import { createReducer } from 'typesafe-actions'
import { combineReducers } from 'redux'
import { Set, Map } from 'immutable'
import { getTraditionDefinitions, getTradeDefinitions, getHeritageDefinitions, getInventionDefinitions, getOmenDefinitions } from './data'
import {
  GovermentType, CountryName,
  deleteCountry, createCountry, changeCountryName, enableModifiers, clearModifiers,
  selectGovernment, selectReligion, ReligionType, CultureType, setOmenPower, selectCulture
} from './actions'

export interface Selections {
  selections: Set<string>,
  culture: CultureType,
  government: GovermentType,
  religion: ReligionType,
  omen_power: number
}

const getDefaultSelections = () => (
  {
    selections: Set<string>(),
    government: GovermentType.Republic,
    religion: 'Hellenic' as ReligionType,
    culture: CultureType.Greek,
    omen_power: 100
  }
)

const selectionsState = Map<CountryName, Selections>().set(CountryName.Country1, getDefaultSelections()).set(CountryName.Country2, getDefaultSelections())


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
  .handleAction(enableModifiers, (state, action: ReturnType<typeof enableModifiers>) => (
    state.update(action.payload.country, value => ({ ...value, selections: value.selections.add(action.payload.key) }))
  ))
  .handleAction(clearModifiers, (state, action: ReturnType<typeof clearModifiers>) => (
    state.update(action.payload.country, value => ({ ...value, selections: value.selections.remove(action.payload.key) }))
  ))
  .handleAction(selectGovernment, (state, action: ReturnType<typeof selectGovernment>) => (
    state.update(action.payload.country, value => ({ ...value, government: action.payload.government }))
  ))
  .handleAction(selectReligion, (state, action: ReturnType<typeof selectReligion>) => (
    state.update(action.payload.country, value => ({ ...value, religion: action.payload.religion }))
  )) 
  .handleAction(selectCulture, (state, action: ReturnType<typeof selectCulture>) => (
    state.update(action.payload.country, value => ({ ...value, culture: action.payload.culture }))
  )) 
  .handleAction(setOmenPower, (state, action: ReturnType<typeof setOmenPower>) => (
    state.update(action.payload.country, value => ({ ...value, omen_power: action.payload.power }))
  ))

export const countriesReducer = combineReducers({
  selections: selectionsReducer,
  traditions: createReducer(getTraditionDefinitions()),
  trades: createReducer(getTradeDefinitions()),
  heritages: createReducer(getHeritageDefinitions()),
  inventions: createReducer(getInventionDefinitions()),
  omens: createReducer(getOmenDefinitions())
})
