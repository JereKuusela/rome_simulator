import { createReducer } from 'typesafe-actions'
import { Set, Map, OrderedMap } from 'immutable'
import {
  CountryName,
  deleteCountry, createCountry, changeCountryName, enableModifiers, clearModifiers,
  selectGovernment, selectReligion, setOmenPower, selectCulture, setGeneralMartial, toggleHasGeneral
} from './actions'
import { GovermentType, ReligionType, CultureType } from '../data'

export interface Country {
  selections: Set<string>,
  culture: CultureType,
  government: GovermentType,
  religion: ReligionType,
  omen_power: number,
  general_martial: number,
  trait_martial:  Map<string, OrderedMap<string, number>>,
  has_general: boolean
}

export const defaultCountry =
  {
    selections: Set<string>(),
    government: GovermentType.Republic,
    religion: 'Hellenic' as ReligionType,
    culture: CultureType.Greek,
    omen_power: 100,
    general_martial: 0,
    trait_martial: Map<string, OrderedMap<string, number>>(),
    has_general: true
  }

const selectionsState = Map<CountryName, Country>().set(CountryName.Country1, defaultCountry).set(CountryName.Country2, defaultCountry)

export const selectionsReducer = createReducer(selectionsState)
  .handleAction(createCountry, (state, action: ReturnType<typeof createCountry>) => (
    state.set(action.payload.country, state.get(action.payload.source_country!, defaultCountry))
  ))
  .handleAction(deleteCountry, (state, action: ReturnType<typeof deleteCountry>) => (
    state.delete(action.payload.country)
  ))
  .handleAction(changeCountryName, (state, action: ReturnType<typeof changeCountryName>) => (
    state.mapKeys(key => key === action.payload.old_country ? action.payload.country : key)
  ))
  .handleAction(enableModifiers, (state, action: ReturnType<typeof enableModifiers>) => (
    state.update(action.payload.country, defaultCountry, value => ({ ...value, selections: value.selections.add(action.payload.key) }))
  ))
  .handleAction(clearModifiers, (state, action: ReturnType<typeof clearModifiers>) => (
    state.update(action.payload.country, defaultCountry, value => ({ ...value, selections: value.selections.remove(action.payload.key) }))
  ))
  .handleAction(selectGovernment, (state, action: ReturnType<typeof selectGovernment>) => (
    state.update(action.payload.country, defaultCountry, value => ({ ...value, government: action.payload.government }))
  ))
  .handleAction(selectReligion, (state, action: ReturnType<typeof selectReligion>) => (
    state.update(action.payload.country, defaultCountry, value => ({ ...value, religion: action.payload.religion }))
  ))
  .handleAction(selectCulture, (state, action: ReturnType<typeof selectCulture>) => (
    state.update(action.payload.country, defaultCountry, value => ({ ...value, culture: action.payload.culture }))
  ))
  .handleAction(setOmenPower, (state, action: ReturnType<typeof setOmenPower>) => (
    state.update(action.payload.country, defaultCountry, value => ({ ...value, omen_power: action.payload.power }))
  ))
  .handleAction(setGeneralMartial, (state, action: ReturnType<typeof setGeneralMartial>) => (
    state.update(action.payload.country, defaultCountry, value => ({ ...value, general_martial: action.payload.skill }))
  ))
  .handleAction(toggleHasGeneral, (state, action: ReturnType<typeof toggleHasGeneral>) => (
    state.update(action.payload.country, defaultCountry, value => ({ ...value, has_general: !value.has_general }))
  ))
