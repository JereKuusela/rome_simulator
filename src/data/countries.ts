import { Country, GovermentType, ReligionType, CountryName, CultureType } from 'types'
import { getDefaultArmies } from 'data'
import { getDefaultUnits } from './units'

export const defaultCountry: Country =
{
  selections: {},
  government: GovermentType.Republic,
  religion: 'Hellenic' as ReligionType,
  culture: (process.env.REACT_APP_GAME === 'euiv' ? 'Western' : 'Greek') as CultureType,
  omen_power: 100,
  military_power: 0,
  office_discipline: 0,
  office_morale: 0,
  tech_level: 0,
  armies: getDefaultArmies(),
  units: getDefaultUnits((process.env.REACT_APP_GAME === 'euiv' ? 'Western' : undefined) as CultureType)
}

export const getDefaultCountryDefinitions = (): { [key in CountryName]: Country } => ({
  [CountryName.Country1]: defaultCountry,
  [CountryName.Country2]: defaultCountry
})
