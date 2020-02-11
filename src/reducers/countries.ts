import * as manager from 'managers/countries'
import { Countries, Country } from 'types'
import { getDefaultCountryDefinitions } from 'data'
import { makeContainerReducer, ActionToFunction, makeActionRemoveFirst, Action, ReducerParams, makeReducer, compose } from './utils'

const countriesMapping: ActionToFunction<Countries> = {}

export const createCountry = makeActionRemoveFirst(manager.createCountry, countriesMapping)
export const deleteCountry = makeActionRemoveFirst(manager.deleteCountry, countriesMapping)
export const changeCountryName = makeActionRemoveFirst(manager.changeCountryName, countriesMapping)

const countries = makeContainerReducer(getDefaultCountryDefinitions(), countriesMapping)

const countryMapping: ActionToFunction<Country> = {}

export const clearSelection = makeActionRemoveFirst(manager.clearSelection, countryMapping)
export const enableSelection = makeActionRemoveFirst(manager.enableSelection, countryMapping)
export const selectCulture = makeActionRemoveFirst(manager.selectCulture, countryMapping)
export const selectGovernment = makeActionRemoveFirst(manager.selectGovernment, countryMapping)
export const selectReligion = makeActionRemoveFirst(manager.selectReligion, countryMapping)
export const setMilitaryPower = makeActionRemoveFirst(manager.setMilitaryPower, countryMapping)
export const setOfficeDiscipline = makeActionRemoveFirst(manager.setOfficeDiscipline, countryMapping)
export const setOfficeMorale = makeActionRemoveFirst(manager.setOfficeMorale, countryMapping)
export const setOmenPower = makeActionRemoveFirst(manager.setOmenPower, countryMapping)
export const setCountryValue = makeActionRemoveFirst(manager.setCountryValue, countryMapping)

const getEntity = (draft: Countries, _: Action, params: ReducerParams) => draft[params.country]

const country = makeReducer(getDefaultCountryDefinitions(), countryMapping, getEntity)

export const countriesReducer = compose(country, countries)
