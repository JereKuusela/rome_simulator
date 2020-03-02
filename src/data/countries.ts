import { Country, GovermentType, ReligionType, CountryName } from 'types'
import { getDefaultArmies } from 'data'
import { getDefaultUnits, getCultures } from './units'

export const defaultCountry: Country =
{
  selections: {},
  government: GovermentType.Republic,
  religion: 'Hellenic' as ReligionType,
  culture: getCultures()[0],
  omen_power: 100,
  military_power: 0,
  office_discipline: 0,
  office_morale: 0,
  tech_level: 1,
  armies: getDefaultArmies(),
  units: getDefaultUnits(getCultures()[0])
}

export const getDefaultCountryDefinitions = (): { [key in CountryName]: Country } => ({
  [CountryName.Country1]: defaultCountry,
  [CountryName.Country2]: defaultCountry
})
