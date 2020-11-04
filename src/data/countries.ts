import {
  GovermentType,
  CountryName,
  CultureType,
  CountryAttribute,
  UnitAttribute,
  Selections,
  CountryDefinitions
} from 'types'
import { getDefaultArmies } from 'data'
import { getDefaultUnits } from './units'

export const getDefaultCountry = () => ({
  selections: {} as Selections,
  government: GovermentType.Republic,
  culture: (process.env.REACT_APP_GAME === 'EU4' ? 'Western' : 'latin_philosophy') as CultureType,
  armies: getDefaultArmies(),
  units: getDefaultUnits(process.env.REACT_APP_GAME === 'EU4' ? ('Western' as CultureType) : undefined),
  baseValues: {
    [CountryAttribute.FlankRatio]: {
      Base: 0.5
    },
    [CountryAttribute.OmenPower]: {
      Base: 100
    },
    [CountryAttribute.TechLevel]: {
      Base: process.env.REACT_APP_GAME === 'EU4' ? 3 : 0
    }
  } as any,
  weariness: { [UnitAttribute.Morale]: { min: 0, max: 0 }, [UnitAttribute.Strength]: { min: 0, max: 0 } }
})

export const getDefaultCountryDefinitions = (): CountryDefinitions => ({
  [CountryName.Country1]: getDefaultCountry(),
  [CountryName.Country2]: getDefaultCountry()
})
