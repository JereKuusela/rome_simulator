import { createAction } from 'typesafe-actions'
import { List } from 'immutable'
import { Modifier, GovermentType, ReligionType, CultureType } from '../data'

export enum CountryName {
  Country1 = 'Country 1',
  Country2 = 'Country 2'
}


export const deleteCountry = createAction('@@countries/DELETE_COUNTRY', action => {
  return (country: CountryName) => action({ country })
})

export const createCountry = createAction('@@countries/CREATE_COUNTRY', action => {
  return (country: CountryName, source_country?: CountryName) => action({ country, source_country })
})

export const changeCountryName = createAction('@@countries/CHANGE_COUNTRY_NAME', action => {
  return (old_country: CountryName, country: CountryName) => action({ old_country, country })
})

export const enableModifiers = createAction('@@countries/ENABLE_MODIFIERS', action => {
  return (country: CountryName, key: string, modifiers: List<Modifier>) => action({ country, key, modifiers })
})

export const clearModifiers = createAction('@@countries/CLEAR_MODIFIERS', action => {
  return (country: CountryName, key: string) => action({ country, key })
})

export const selectGovernment = createAction('@@countries/SELECT_GOVERNMENT', action => {
  return (country: CountryName, government: GovermentType) => action({ country, government })
})

export const selectReligion = createAction('@@countries/SELECT_RELIGION', action => {
  return (country: CountryName, religion: ReligionType) => action({ country, religion })
})

export const selectCulture = createAction('@@countries/SELECT_CULTURE', action => {
  return (country: CountryName, culture: CultureType) => action({ country, culture })
})

export const setOmenPower = createAction('@@countries/SET_OMEN_POWER', action => {
  return (country: CountryName, power: number) => action({ country, power })
})

export const setGeneralMartial = createAction('@@countries/SET_GENERAL_MARTIAL', action => {
  return (country: CountryName, skill: number) => action({ country, skill })
})

export const toggleHasGeneral = createAction('@@countries/TOGGLE_HAS_GENERAL', action => {
  return (country: CountryName) => action({ country })
})

export const setMilitaryPower = createAction('@@countries/SET_MILITARY_POWER', action => {
  return (country: CountryName, power: number) => action({ country, power })
})
