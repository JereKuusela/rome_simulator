import {
  GovermentType,
  CountryName,
  CultureType,
  CountryAttribute,
  UnitAttribute,
  Selections,
  CountryDefinitions,
  CountryDefinition,
  SelectionType
} from 'types'
import { getDefaultArmies } from 'data'
import { getDefaultUnits } from './units'
import { ObjSet } from 'utils'

export const getDefaultCountry = (name: CountryName): CountryDefinition => ({
  name,
  modifiers: {
    selections: {
      [SelectionType.Policy]: {
        // All army expense policies include the same levy size.
        // So better just select it by default even though it's only used for importing.
        expense_army_default: true
      } as ObjSet
    } as Selections,
    government: GovermentType.Republic,
    culture: 'Western' as CultureType,
    baseValues: {
      [CountryAttribute.FlankRatio]: {
        Base: 0.5
      },
      [CountryAttribute.OmenPower]: {
        Base: 100
      },
      [CountryAttribute.MartialTech]: {
        Base: process.env.REACT_APP_GAME === 'EU4' ? 3 : 0
      }
    } as never
  },

  armies: getDefaultArmies(),
  units: getDefaultUnits(process.env.REACT_APP_GAME === 'EU4' ? ('Western' as CultureType) : undefined),

  weariness: { [UnitAttribute.Morale]: { min: 0, max: 0 }, [UnitAttribute.Strength]: { min: 0, max: 0 } }
})

export const getDefaultCountryDefinitions = (): CountryDefinitions => ({
  [CountryName.Country1]: getDefaultCountry(CountryName.Country1),
  [CountryName.Country2]: getDefaultCountry(CountryName.Country2)
})
