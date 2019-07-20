import { createReducer } from 'typesafe-actions'
import { Set, Map } from 'immutable'
import {
  CountryName, setOfficeDiscipline, setOfficeMorale,
  deleteCountry, createCountry, changeCountryName, enableModifiers, clearModifiers, setMilitaryPower,
  selectGovernment, selectReligion, setOmenPower, selectCulture, setGeneralMartial, setHasGeneral
} from './actions'
import { GovermentType, ReligionType, CultureType } from '../data'

export interface Country {
  readonly selections: Set<string>
  readonly culture: CultureType
  readonly government: GovermentType
  readonly religion: ReligionType
  readonly omen_power: number
  readonly general_martial: number
  readonly trait_martial: Map<string, number>
  readonly has_general: boolean
  readonly military_power: number
  readonly office_discipline: number
  readonly office_morale: number
}

export const defaultCountry =
{
  selections: Set<string>(),
  government: GovermentType.Republic,
  religion: 'Hellenic' as ReligionType,
  culture: CultureType.Greek,
  omen_power: 100,
  general_martial: 0,
  trait_martial: Map<string, number>(),
  has_general: true,
  military_power: 0,
  office_discipline: 0,
  office_morale: 0
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
  .handleAction(enableModifiers, (state, action: ReturnType<typeof enableModifiers>) => {
    const modifiers = action.payload.modifiers.filter(value => value.target === 'General' && value.attribute === 'Martial').toMap().mapEntries(value => [action.payload.key, value[1].value])
    return state.update(action.payload.country, defaultCountry, value => ({ ...value, selections: value.selections.add(action.payload.key), trait_martial: value.trait_martial.merge(modifiers) }))
  })
  .handleAction(clearModifiers, (state, action: ReturnType<typeof clearModifiers>) => (
    state.update(action.payload.country, defaultCountry, value => ({ ...value, selections: value.selections.remove(action.payload.key), trait_martial: value.trait_martial.delete(action.payload.key) }))
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
  .handleAction(setHasGeneral, (state, action: ReturnType<typeof setHasGeneral>) => (
    state.update(action.payload.country, defaultCountry, value => ({ ...value, has_general: action.payload.value }))
  ))
  .handleAction(setMilitaryPower, (state, action: ReturnType<typeof setMilitaryPower>) => (
    state.update(action.payload.country, defaultCountry, value => ({ ...value, military_power: action.payload.power }))
  ))
  .handleAction(setOfficeDiscipline, (state, action: ReturnType<typeof setOfficeDiscipline>) => (
    state.update(action.payload.country, defaultCountry, value => ({ ...value, office_discipline: action.payload.value }))
  ))
  .handleAction(setOfficeMorale, (state, action: ReturnType<typeof setOfficeMorale>) => (
    state.update(action.payload.country, defaultCountry, value => ({ ...value, office_morale: action.payload.value }))
  ))
