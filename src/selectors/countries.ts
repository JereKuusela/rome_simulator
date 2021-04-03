import { convertCountryData, convertCountryDefinition, filterArmies } from 'managers/countries'
import * as manager from 'managers/modifiers'
import createCachedSelector from 're-reselect'
import { createSelector } from 'reselect'
import type { AppState } from 'reducers'
import { CountryAttribute, CountryName } from 'types'
import { keys } from 'utils'
import { getSharedSettings } from './settings'
import { getMode } from './ui'
import { getKey, useSelector } from './utils'

export const getCountries = (state: AppState) => state.countries
export const getCountryData = (state: AppState, countryName: CountryName) => getCountries(state)[countryName]
export const getCountryNames = createSelector([getCountries], keys)
export const getWeariness = (state: AppState, countryName: CountryName) => getCountryData(state, countryName).weariness
const getCulture = (state: AppState, countryName: CountryName) => getCountryData(state, countryName).modifiers.culture
const getAllArmies = (state: AppState, countryName: CountryName) => getCountryData(state, countryName).armies
export const getCountryAttribute = (state: AppState, countryName: CountryName, attribute: CountryAttribute) => {
  const country = getCountry(state, countryName)
  return country[attribute]
}

export const getArmies = createCachedSelector([getAllArmies, getMode], filterArmies)(getKey)
export const getArmyNames = createCachedSelector([getArmies], keys)(getKey)

export const getCountryModifiers = createCachedSelector([getCountryData], country => {
  return manager.getCountryModifiers(country.modifiers)
})(getKey)

export const getCountryDefinition = createCachedSelector([getCountryData], convertCountryData)(getKey)
export const getCountry = createCachedSelector(
  [getCountryDefinition, getSharedSettings],
  convertCountryDefinition
)(getKey)

export const useCountryDefinition = (countryName: CountryName) =>
  useSelector(state => getCountryDefinition(state, countryName))

export const useCountries = () => useSelector(getCountries)
export const useCountryNames = () => useSelector(getCountryNames)
export const useWeariness = (countryName: CountryName) => useSelector(state => getWeariness(state, countryName))
export const useCulture = (countryName: CountryName) => useSelector(state => getCulture(state, countryName))
export const useArmies = (countryName: CountryName) => useSelector(state => getArmies(state, countryName))
export const useArmyNames = (countryName: CountryName) => useSelector(state => getArmyNames(state, countryName))

export const useCountryAttribute = (countryName: CountryName, attribute: CountryAttribute): number =>
  useSelector(state => getCountryAttribute(state, countryName, attribute))
