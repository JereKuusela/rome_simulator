import {
  GovermentType,
  CountryName,
  CultureType,
  CountryAttribute,
  UnitAttribute,
  Selections,
  CountryDefinitions,
  CountryDefinition
} from 'types'
import { getDefaultArmies } from 'data'
import { getDefaultUnits } from './units'

export const getDefaultCountry = (): CountryDefinition => ({
  modifiers: {
    selections: {} as Selections,
    selectedTradition: 'Roman',
    government: GovermentType.Republic,
    culture: 'Western' as CultureType,
    baseValues: {
      [CountryAttribute.FlankRatio]: {
        Base: 0.5
      },
      [CountryAttribute.OmenPower]: {
        Base: 100
      },
      [CountryAttribute.MilitaryTech]: {
        Base: process.env.REACT_APP_GAME === 'EU4' ? 3 : 0
      }
    } as never
  },

  armies: getDefaultArmies(),
  units: getDefaultUnits(process.env.REACT_APP_GAME === 'EU4' ? ('Western' as CultureType) : undefined),

  weariness: { [UnitAttribute.Morale]: { min: 0, max: 0 }, [UnitAttribute.Strength]: { min: 0, max: 0 } }
})

export const getDefaultCountryDefinitions = (): CountryDefinitions => ({
  [CountryName.Country1]: getDefaultCountry(),
  [CountryName.Country2]: getDefaultCountry()
})
