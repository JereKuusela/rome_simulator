import { Countries, CountryName, CountryDefinition, GovermentType, ReligionType, CultureType, CountryAttribute, ValuesType, WearinessAttribute, Country, isAttributeEnabled, ModifierWithKey, SiteSettings, ModifierType } from 'types'
import { defaultCountry, getDefaultUnits } from 'data'
import { addValuesWithMutate, clearAllValuesWithMutate, calculateValue, addValue } from 'definition_values'
import { toObj, values } from 'utils'

export const createCountry = (countries: Countries, country: CountryName, source_country?: CountryName) => {
  countries[country] = source_country ? countries[source_country] : defaultCountry
}

export const deleteCountry = (countries: Countries, country: CountryName) => {
  delete countries[country]
}

export const changeCountryName = (countries: Countries, old_country: CountryName, country: CountryName) => {
  delete Object.assign(countries, { [country]: countries[old_country] })[old_country]
}

export const setCountryValue = (country: CountryDefinition, key: string, attribute: CountryAttribute, value: number) => {
  addValuesWithMutate(country, ValuesType.Base, key, [[attribute, value]])
}

export const clearCountryValues = (country: CountryDefinition, key: string) => {
  clearAllValuesWithMutate(country, key)
}

export const selectGovernment = (country: CountryDefinition, government: GovermentType) => {
  country.government = government
}

export const selectReligion = (country: CountryDefinition, religion: ReligionType) => {
  country.religion = religion
}

export const selectCulture = (country: CountryDefinition, culture: CultureType, load_all_units: boolean) => {
  country.culture = culture
  country.units = getDefaultUnits(load_all_units ? undefined : culture)
}

export const enableCountrySelection = (country: CountryDefinition, key: string) => {
  country.selections[key] = true
}

export const enableCountrySelections = (country: CountryDefinition, keys: string[]) => {
  keys.forEach(key => enableCountrySelection(country, key))
}

export const clearCountrySelection = (country: CountryDefinition, key: string) => {
  delete country.selections[key]
}

export const clearCountrySelections = (country: CountryDefinition, keys: string[]) => {
  keys.forEach(key => clearCountrySelection(country, key))
}

export const clearAllCountrySelections = (country: CountryDefinition) => {
  country.selections = {}
}

export const changeWeariness = (country: CountryDefinition, type: WearinessAttribute, min: number, max: number) => {
  country.weariness[type].min = min
  country.weariness[type].max = max
}

export const applyCountryModifiers = (country: CountryDefinition, modifiers: ModifierWithKey[]): CountryDefinition => {
  modifiers.filter(value => value.target === ModifierType.Country).forEach(value => {
    country = addValue(country, value.type, value.key, value.attribute, value.value)
  })
  return country
}

export const convertCountryDefinition = (country: CountryDefinition, settings: SiteSettings): Country => {
  const attributes = values(CountryAttribute)
  const calculated = toObj(attributes, attribute => attribute, attribute => isAttributeEnabled(attribute, settings) ? calculateValue(country, attribute) : 0)
  return {
    ...calculated,
    selections: country.selections,
    culture: country.culture,
    weariness: country.weariness,
    religion: country.religion
  }
}