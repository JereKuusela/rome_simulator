import * as manager from 'managers/countries'
import { Countries, CountryDefinition, CountryName } from 'types'
import { getDefaultCountryDefinitions } from 'data'
import {
  makeContainerReducer,
  ActionToFunction,
  makeActionRemoveFirst,
  makeEntityReducer,
  compose,
  makeActionReplaceFirst
} from './utils'

const countriesMapping: ActionToFunction<Countries> = {}

export const createCountry = makeActionRemoveFirst(manager.createCountry, countriesMapping)
export const importCountry = makeActionRemoveFirst(manager.importCountry, countriesMapping)
export const deleteCountry = makeActionRemoveFirst(manager.deleteCountry, countriesMapping)
export const changeCountryName = makeActionRemoveFirst(manager.changeCountryName, countriesMapping)

const countries = makeContainerReducer(getDefaultCountryDefinitions(), countriesMapping)

const countryMapping: ActionToFunction<CountryDefinition, CountryName> = {}

export const clearCountrySelection = makeActionReplaceFirst(manager.clearCountrySelection, countryMapping)
export const clearCountrySelections = makeActionReplaceFirst(manager.clearCountrySelections, countryMapping)
export const enableCountrySelection = makeActionReplaceFirst(manager.enableCountrySelection, countryMapping)
export const enableCountrySelections = makeActionReplaceFirst(manager.enableCountrySelections, countryMapping)
export const selectCulture = makeActionReplaceFirst(manager.selectCulture, countryMapping)
export const selectGovernment = makeActionReplaceFirst(manager.selectGovernment, countryMapping)
export const setCountryAttribute = makeActionReplaceFirst(manager.setCountryAttribute, countryMapping)
export const clearCountryAttributes = makeActionReplaceFirst(manager.clearCountryAttributes, countryMapping)
export const changeWeariness = makeActionReplaceFirst(manager.changeWeariness, countryMapping)
export const createArmy = makeActionReplaceFirst(manager.createArmy, countryMapping)
export const deleteArmy = makeActionReplaceFirst(manager.deleteArmy, countryMapping)
export const changeArmyName = makeActionReplaceFirst(manager.changeArmyName, countryMapping)

const country = makeEntityReducer(getDefaultCountryDefinitions(), countryMapping)

export const countriesReducer = compose(country, countries)
