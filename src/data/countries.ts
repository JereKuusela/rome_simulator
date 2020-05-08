import { CountryDefinition, GovermentType, CountryName, CultureType, CountryAttribute, UnitAttribute, Selections } from 'types'
import { getDefaultArmies } from 'data'
import { getDefaultUnits } from './units'

export const defaultCountry: CountryDefinition =
{
  selections: {} as Selections,
  government: GovermentType.Republic,
  culture: (process.env.REACT_APP_GAME === 'euiv' ? 'Western' : 'latin_philosophy') as CultureType,
  armies: getDefaultArmies(),
  units: getDefaultUnits((process.env.REACT_APP_GAME === 'euiv' ? 'Western' : undefined) as CultureType),
  baseValues: {
    [CountryAttribute.FlankRatio]: {
      'Base': 0.5
    },
    [CountryAttribute.OmenPower]: {
      'Base': 100
    },
    [CountryAttribute.TechLevel]: {
      'Base': (process.env.REACT_APP_GAME === 'euiv' ? 3 : 0)
    }
  } as any,
  weariness: { [UnitAttribute.Morale]: { min: 0, max: 0 }, [UnitAttribute.Strength]: { min: 0, max: 0 } }
}

export const getDefaultCountryDefinitions = (): { [key in CountryName]: CountryDefinition } => ({
  [CountryName.Country1]: defaultCountry,
  [CountryName.Country2]: defaultCountry
})
