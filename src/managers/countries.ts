import { Countries, CountryName } from "types"
import { defaultCountry } from "data"

export const createCountry = (countries: Countries, country: CountryName, source_country?: CountryName)  => {
  countries[country] = source_country ? countries[source_country] : defaultCountry
}

export const deleteCountry = (countries: Countries, country: CountryName) => {
  delete countries[country]
}

export const changeCountryName = (countries: Countries, old_country: CountryName, country: CountryName) => {
  delete Object.assign(countries, { [country]: countries[old_country] })[old_country]
}
