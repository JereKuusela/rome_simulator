import { Countries, CountryName, CountryDefinition, GovermentType, ReligionType, CultureType, CountryAttribute, ValuesType, WearinessAttribute, Country, isAttributeEnabled, ModifierWithKey, SiteSettings, ModifierType, SelectionType, Selections, ArmyName, Mode } from 'types'
import { defaultCountry, getDefaultUnits, getDefaultArmies } from 'data'
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

export const setCountryAttribute = (country: CountryDefinition, attribute: CountryAttribute, value: number) => {
  addValuesWithMutate(country, ValuesType.Base, 'Custom', [[attribute, value]])
}

export const clearCountryAttributes = (country: CountryDefinition) => {
  clearAllValuesWithMutate(country, 'Custom')
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

export const enableCountrySelection = (country: CountryDefinition, type: SelectionType, key: string) => {
  if (!country.selections[type])
    country.selections[type] = {}
  country.selections[type][key] = true
}

export const enableCountrySelections = (country: CountryDefinition, type: SelectionType, keys: string[]) => {
  keys.forEach(key => enableCountrySelection(country, type, key))
}

export const clearCountrySelection = (country: CountryDefinition, type: SelectionType, key: string) => {
  delete country.selections[type][key]
}

export const clearCountrySelections = (country: CountryDefinition, type?: SelectionType, keys?: string[]) => {
  if (keys && type)
    keys.forEach(key => clearCountrySelection(country, type, key))
  else if (type)
    delete country.selections[type]
  else
    country.selections = {} as Selections
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

export const createArmy = (country: CountryDefinition, mode: Mode, army: ArmyName) => {
  country.armies[mode][army] = getDefaultArmies()[mode][ArmyName.Army1]
}

export const deleteArmy = (country: CountryDefinition, mode: Mode, army: ArmyName) => {
  delete country.armies[mode][army]
}
