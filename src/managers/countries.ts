import { Countries, CountryName, Country, GovermentType, ReligionType, CultureType, CountryAttribute, ValuesType } from "types"
import { defaultCountry, getDefaultUnits } from "data"
import { addValuesWithMutate } from "definition_values"

export const createCountry = (countries: Countries, country: CountryName, source_country?: CountryName)  => {
  countries[country] = source_country ? countries[source_country] : defaultCountry
}

export const deleteCountry = (countries: Countries, country: CountryName) => {
  delete countries[country]
}

export const changeCountryName = (countries: Countries, old_country: CountryName, country: CountryName) => {
  delete Object.assign(countries, { [country]: countries[old_country] })[old_country]
}

export const setCountryValue = (ountry: Country, key: string, attribute: CountryAttribute, value: number) => {
  addValuesWithMutate(ountry, ValuesType.Base, key, [[attribute, value]])
}

export const selectGovernment = (country: Country, government: GovermentType) => {
  country.government = government
}

export const selectReligion = (country: Country, religion: ReligionType) => {
  country.religion = religion
}

export const selectCulture = (country: Country, culture: CultureType) => {
  country.culture = culture
  country.units = getDefaultUnits(culture)
}

export const setOmenPower = (country: Country, omen_power: number) => {
  country.omen_power = omen_power
}

export const setMilitaryPower = (country: Country, military_power: number) => {
  country.military_power = military_power
}

export const setOfficeDiscipline = (country: Country, office_discipline: number) => {
  country.office_discipline = office_discipline
}

export const setOfficeMorale = (country: Country, office_morale: number) => {
  country.office_morale = office_morale
}

export const enableSelection = (country: Country, key: string) => {
  country.selections[key] = true
}

export const clearSelection = (country: Country, key: string) => {
  delete country.selections[key]
}
