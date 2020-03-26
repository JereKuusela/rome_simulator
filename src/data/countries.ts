import { CountryDefinition, GovermentType, ReligionType, CountryName, CultureType, CountryAttribute, UnitAttribute } from 'types'
import { getDefaultArmies } from 'data'
import { getDefaultUnits } from './units'

export const defaultCountry: CountryDefinition =
{
  selections: {},
  government: GovermentType.Republic,
  religion: 'Hellenic' as ReligionType,
  culture: (process.env.REACT_APP_GAME === 'euiv' ? 'Western' : 'Greek') as CultureType,
  omen_power: 100,
  military_power: 0,
  office_discipline: 0,
  office_morale: 0,
  tech_level: 3,
  armies: getDefaultArmies(),
  units: getDefaultUnits((process.env.REACT_APP_GAME === 'euiv' ? 'Western' : undefined) as CultureType),
  base_values: {
    [CountryAttribute.FlankRatio]: {
      'Base': 0.5
    }
  } as any,
  weariness: { [UnitAttribute.Morale]: { min: 0, max: 0 }, [UnitAttribute.Strength]: { min: 0, max: 0 } }
}

export const getDefaultCountryDefinitions = (): { [key in CountryName]: CountryDefinition } => ({
  [CountryName.Country1]: defaultCountry,
  [CountryName.Country2]: defaultCountry
})
