import { convertCountryData, convertCountryDefinition, filterArmies } from 'managers/countries'
import * as manager from 'managers/modifiers'
import createCachedSelector from 're-reselect'
import { AppState } from 'state'
import { CountryName, Mode } from 'types'
import { keys } from 'utils'
import { getMode } from './ui'
import { getKey, useSelector } from './utils'

export const getCountries = (state: AppState) => state.countries
export const getCountryNames = (state: AppState) => keys(state.countries)
export const getCountryData = (state: AppState, countryName: CountryName) => getCountries(state)[countryName]
export const getWeariness = (state: AppState, countryName: CountryName) => getCountryData(state, countryName).weariness
export const getArmies = (state: AppState, countryName: CountryName, mode?: Mode) =>
  filterArmies(getCountryData(state, countryName).armies, mode ?? getMode(state))
export const getArmyNames = (state: AppState, countryName: CountryName, mode?: Mode) =>
  keys(getArmies(state, countryName, mode))

export const getCountryModifiers = createCachedSelector([getCountryData], country => {
  return manager.getCountryModifiers(country.modifiers)
})(getKey)

// CACHE?
export const getCountryDefinition = (state: AppState, countryName: CountryName) => {
  const country = getCountryData(state, countryName)
  return convertCountryData(country)
}

export const getCountry = (state: AppState, countryName: CountryName) => {
  const country = getCountryDefinition(state, countryName)
  return convertCountryDefinition(country, state.settings.sharedSettings)
}

export const useCountryDefinition = (countryName: CountryName) =>
  useSelector(state => getCountryDefinition(state, countryName))

export const useCountryNames = () => useSelector(getCountryNames)
export const useWeariness = (countryName: CountryName) => useSelector(state => getWeariness(state, countryName))
export const useArmies = (countryName: CountryName) => useSelector(state => getArmies(state, countryName))
export const useArmyNames = (countryName: CountryName) => useSelector(state => getArmyNames(state, countryName))
