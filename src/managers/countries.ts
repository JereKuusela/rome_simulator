import { Countries, CountryName, CountryDefinition, GovermentType, ReligionType, CultureType, CountryAttribute, ValuesType, Modifier, WearinessAttribute, Country, isAttributeEnabled, Settings, ModifierWithKey } from 'types'
import { defaultCountry, getDefaultUnits } from 'data'
import { addValuesWithMutate, clearAllValuesWithMutate, regenerateValues, calculateValue, addValue } from 'definition_values'
import { toObj } from 'utils'

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

export const enableCountryModifiers = (country: CountryDefinition, key: string, modifiers: Modifier[]) => {
  modifiers = modifiers.filter(value => value.target === 'Country')
  clearAllValuesWithMutate(country, key)
  const values = modifiers.map(value => [value.attribute, value.value] as [CountryAttribute, number])
  regenerateValues(country, ValuesType.Base, key, values)
}

export const clearCountryModifiers = (country: CountryDefinition, key: string) => clearAllValuesWithMutate(country, key)

export const selectGovernment = (country: CountryDefinition, government: GovermentType) => {
  country.government = government
}

export const selectReligion = (country: CountryDefinition, religion: ReligionType) => {
  country.religion = religion
}

export const setTechLevel = (country: CountryDefinition, level: number) => {
  country.tech_level = Math.max(0, level)
}

export const selectCulture = (country: CountryDefinition, culture: CultureType, load_all_units: boolean) => {
  country.culture = culture
  country.units = getDefaultUnits(load_all_units ? undefined : culture)
}

export const setOmenPower = (country: CountryDefinition, omen_power: number) => {
  country.omen_power = omen_power
}

export const setMilitaryPower = (country: CountryDefinition, military_power: number) => {
  country.military_power = military_power
}

export const setOfficeDiscipline = (country: CountryDefinition, office_discipline: number) => {
  country.office_discipline = office_discipline
}

export const setOfficeMorale = (country: CountryDefinition, office_morale: number) => {
  country.office_morale = office_morale
}

export const enableSelection = (country: CountryDefinition, key: string) => {
  country.selections[key] = true
}

export const enableSelections = (country: CountryDefinition, keys: string[]) => {
  keys.forEach(key => enableSelection(country, key))
}

export const clearSelection = (country: CountryDefinition, key: string) => {
  delete country.selections[key]
}

export const clearSelections = (country: CountryDefinition, keys: string[]) => {
  keys.forEach(key => clearSelection(country, key))
}

export const clearAllSelections = (country: CountryDefinition) => {
  country.selections = {}
}

export const changeWeariness = (country: CountryDefinition, type: WearinessAttribute, min: number, max: number) => {
  country.weariness[type].min = min
  country.weariness[type].max = max
}

export const applyCountryModifiers = (country: CountryDefinition, modifiers: ModifierWithKey[]): CountryDefinition => {
  modifiers.filter(value => value.target === 'Country').forEach(value => {
    country = addValue(country, value.type, value.key, value.attribute, value.value)
  })
  return country
}

export const convertCountryDefinition = (country: CountryDefinition, settings: Settings): Country => {
  const attributes = [CountryAttribute.CombatWidth, CountryAttribute.FlankRatio]
  const values = toObj(attributes, attribute => attribute, attribute => isAttributeEnabled(attribute, settings) ? calculateValue(country, attribute) : 0)
  return {
    values,
    tech_level: country.tech_level,
    culture: country.culture,
    weariness: country.weariness
  }
}