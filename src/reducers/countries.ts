import * as manager from 'managers/countries'
import { Countries, CountryDefinition, CountryName } from 'types'
import { getDefaultCountryDefinitions } from 'data'
import { makeContainerReducer, ActionToFunction, makeActionRemoveFirst, makeEntityReducer, compose, makeActionReplaceFirst } from './utils'

const countriesMapping: ActionToFunction<Countries> = {}

export const createCountry = makeActionRemoveFirst(manager.createCountry, countriesMapping)
export const importCountry = makeActionRemoveFirst(manager.importCountry, countriesMapping)
export const deleteCountry = makeActionRemoveFirst(manager.deleteCountry, countriesMapping)
export const changeCountryName = makeActionRemoveFirst(manager.changeCountryName, countriesMapping)

const countries = makeContainerReducer(getDefaultCountryDefinitions(), countriesMapping)

const countryMapping: ActionToFunction<CountryDefinition, CountryName> = {}

export const clearCountrySelection = makeActionReplaceFirst(manager.clearCountrySelection, countryMapping)
export const clearCountrySelections = makeActionReplaceFirst(manager.clearCountrySelections, countryMapping)
export const clearAllCountrySelections = makeActionReplaceFirst(manager.clearAllCountrySelections, countryMapping)
export const enableCountrySelection = makeActionReplaceFirst(manager.enableCountrySelection, countryMapping)
export const enableCountrySelections = makeActionReplaceFirst(manager.enableCountrySelections, countryMapping)
export const selectCulture = makeActionReplaceFirst(manager.selectCulture, countryMapping)
export const selectGovernment = makeActionReplaceFirst(manager.selectGovernment, countryMapping)
export const selectReligion = makeActionReplaceFirst(manager.selectReligion, countryMapping)
export const setCountryValue = makeActionReplaceFirst(manager.setCountryValue, countryMapping)
export const clearCountryValues = makeActionReplaceFirst(manager.clearCountryValues, countryMapping)
export const changeWeariness = makeActionReplaceFirst(manager.changeWeariness, countryMapping)

const country = makeEntityReducer(getDefaultCountryDefinitions(), countryMapping)

export const countriesReducer = compose(country, countries)
