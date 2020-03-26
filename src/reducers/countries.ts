import * as manager from 'managers/countries'
import { Countries, Country, CountryName } from 'types'
import { getDefaultCountryDefinitions } from 'data'
import { makeContainerReducer, ActionToFunction, makeActionRemoveFirst, makeEntityReducer, compose, makeActionReplaceFirst } from './utils'

const countriesMapping: ActionToFunction<Countries> = {}

export const createCountry = makeActionRemoveFirst(manager.createCountry, countriesMapping)
export const deleteCountry = makeActionRemoveFirst(manager.deleteCountry, countriesMapping)
export const changeCountryName = makeActionRemoveFirst(manager.changeCountryName, countriesMapping)

const countries = makeContainerReducer(getDefaultCountryDefinitions(), countriesMapping)

const countryMapping: ActionToFunction<Country, CountryName> = {}

export const clearSelection = makeActionReplaceFirst(manager.clearSelection, countryMapping)
export const enableSelection = makeActionReplaceFirst(manager.enableSelection, countryMapping)
export const selectCulture = makeActionReplaceFirst(manager.selectCulture, countryMapping)
export const selectGovernment = makeActionReplaceFirst(manager.selectGovernment, countryMapping)
export const selectReligion = makeActionReplaceFirst(manager.selectReligion, countryMapping)
export const setMilitaryPower = makeActionReplaceFirst(manager.setMilitaryPower, countryMapping)
export const setOfficeDiscipline = makeActionReplaceFirst(manager.setOfficeDiscipline, countryMapping)
export const setOfficeMorale = makeActionReplaceFirst(manager.setOfficeMorale, countryMapping)
export const setOmenPower = makeActionReplaceFirst(manager.setOmenPower, countryMapping)
export const setCountryValue = makeActionReplaceFirst(manager.setCountryValue, countryMapping)
export const setTechLevel = makeActionReplaceFirst(manager.setTechLevel, countryMapping)
export const changeWeariness = makeActionReplaceFirst(manager.changeWeariness, countryMapping)
export const enableCountryModifiers = makeActionReplaceFirst(manager.enableCountryModifiers, countryMapping)
export const clearCountryModifiers = makeActionReplaceFirst(manager.clearCountryModifiers, countryMapping)

const country = makeEntityReducer(getDefaultCountryDefinitions(), countryMapping)

export const countriesReducer = compose(country, countries)
