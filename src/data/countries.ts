import { Country, GovermentType, ReligionType, CultureType, CountryName } from "types"

export const defaultCountry: Country =
{
  selections: {},
  government: GovermentType.Republic,
  religion: 'Hellenic' as ReligionType,
  culture: CultureType.Greek,
  omen_power: 100,
  general: {
    enabled: true,
    definitions: {} as any
  },
  military_power: 0,
  office_discipline: 0,
  office_morale: 0
}

export const getDefaultCountryDefinitions = (): { [key in CountryName]: Country } => ({
  [CountryName.Country1]: defaultCountry,
  [CountryName.Country2]: defaultCountry
})
