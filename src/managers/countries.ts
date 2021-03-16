import {
  Countries,
  CountryName,
  CountryDefinition,
  GovermentType,
  CultureType,
  CountryAttribute,
  ValuesType,
  WearinessAttribute,
  Country,
  isAttributeEnabled,
  ModifierWithKey,
  SiteSettings,
  ModifierType,
  SelectionType,
  Selections,
  ArmyName,
  Mode,
  CountryModifiers,
  Armies
} from 'types'
import { getDefaultUnits, getDefaultArmies, getDefaultCountry } from 'data'
import { addValuesWithMutate, clearAllValuesWithMutate, calculateValue, addValue } from 'definition_values'
import { toObj, values, filter } from 'utils'

export const createCountry = (countries: Countries, country: CountryName, source?: CountryName): void => {
  countries[country] = source ? countries[source] : getDefaultCountry(country)
}

export const deleteCountry = (countries: Countries, country: CountryName): void => {
  delete countries[country]
}

export const changeCountryName = (countries: Countries, oldCountry: CountryName, country: CountryName): void => {
  delete Object.assign(countries, { [country]: countries[oldCountry] })[oldCountry]
  countries[country].name = country
}

export const setCountryAttribute = (country: CountryDefinition, attribute: CountryAttribute, value: number): void => {
  addValuesWithMutate(country.modifiers, ValuesType.Base, 'Custom', [[attribute, value]])
}

export const clearCountryAttributes = (country: CountryDefinition): void => {
  clearAllValuesWithMutate(country.modifiers, 'Custom')
}

export const selectGovernment = (country: CountryDefinition, government: GovermentType): void => {
  country.modifiers.government = government
}

export const selectCulture = (country: CountryDefinition, culture: CultureType, loadAllUnits: boolean): void => {
  country.modifiers.culture = culture
  country.units = getDefaultUnits(loadAllUnits ? undefined : culture)
}

export const selectTradition = (country: CountryDefinition, tradition: string): void => {
  country.modifiers.selectedTradition = tradition
}

export const enableCountrySelection = (country: CountryDefinition, type: SelectionType, key: string): void => {
  if (!country.modifiers.selections[type]) country.modifiers.selections[type] = {}
  country.modifiers.selections[type][key] = true
}

export const enableCountrySelections = (country: CountryDefinition, type: SelectionType, keys: string[]): void => {
  keys.forEach(key => enableCountrySelection(country, type, key))
}

export const clearCountrySelection = (country: CountryDefinition, type: SelectionType, key: string): void => {
  if (country.modifiers.selections[type]) delete country.modifiers.selections[type][key]
}

export const clearCountrySelections = (country: CountryDefinition, type?: SelectionType, keys?: string[]): void => {
  if (keys && type) keys.forEach(key => clearCountrySelection(country, type, key))
  else if (type) delete country.modifiers.selections[type]
  else country.modifiers.selections = {} as Selections
}

export const changeWeariness = (
  country: CountryDefinition,
  type: WearinessAttribute,
  min: number,
  max: number
): void => {
  country.weariness[type].min = min
  country.weariness[type].max = max
}

export const applyCountryModifiers = (country: CountryModifiers, modifiers: ModifierWithKey[]): CountryModifiers => {
  modifiers
    .filter(value => value.target === ModifierType.Country)
    .forEach(value => {
      country = addValue(country, value.type, value.key, value.attribute, value.value)
    })
  return country
}

export const convertCountryDefinition = (country: CountryDefinition, settings: SiteSettings): Country => {
  const attributes = values(CountryAttribute)
  const calculated = toObj(
    attributes,
    attribute => attribute,
    attribute => (isAttributeEnabled(attribute, settings) ? calculateValue(country.modifiers, attribute) : 0)
  )
  return {
    ...calculated,
    selections: country.modifiers.selections,
    selectedTradition: country.modifiers.selectedTradition,
    weariness: country.weariness,
    name: country.name
  }
}

export const createArmy = (country: CountryDefinition, armyName: ArmyName, mode: Mode, source?: ArmyName): void => {
  country.armies[armyName] = source
    ? country.armies[source]
    : getDefaultArmies()[mode === Mode.Land ? ArmyName.Army : ArmyName.Navy]
}

export const deleteArmy = (country: CountryDefinition, armyName: ArmyName): void => {
  delete country.armies[armyName]
}

export const changeArmyName = (country: CountryDefinition, oldArmyName: ArmyName, armyName: ArmyName): void => {
  delete Object.assign(country.armies, { [armyName]: country.armies[oldArmyName] })[oldArmyName]
}

export const filterArmies = (country: CountryDefinition, mode: Mode): Armies =>
  filter(country.armies, army => army.mode === mode)
